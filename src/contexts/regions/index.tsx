import { contractQuery, decodeOutput, useContract, useInkathon } from '@scio-labs/use-inkathon';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  countOne,
  getBlockTimestamp,
  parseHNString,
  parseHNStringToString,
  stringifyOnChainId as stringifyOnChainRegionId,
} from '@/utils/functions';

import {
  RegionMetadata,
  RegionLocation,
  RELAY_CHAIN_BLOCK_TIME,
  ScheduleItem,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { CONTRACT_XC_REGIONS } from '../apis/consts';
import { ApiState } from '../apis/types';
import XcRegionsMetadata from "../../contracts/xc_regions.json";
import { CoreMask, Region, RegionId, RegionRecord } from 'coretime-utils';

interface RegionsData {
  regions: Array<RegionMetadata>;
  config: {
    timeslicePeriod: number;
  };
  loading: boolean;
  updateRegionName: (_index: number, _name: string) => void;
  fetchRegions: () => Promise<void>;
}
const defaultRegionData: RegionsData = {
  regions: [],
  config: {
    timeslicePeriod: 0,
  },
  loading: false,
  updateRegionName: () => {
    /** */
  },
  fetchRegions: async () => {
    /** */
  },
};

const RegionDataContext = createContext<RegionsData>(defaultRegionData);

interface Props {
  children: React.ReactNode;
}

const RegionDataProvider = ({ children }: Props) => {
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const { api: contractsApi, isConnected: contractsReady, activeAccount } = useInkathon();

  const { contract } = useContract(XcRegionsMetadata, CONTRACT_XC_REGIONS);

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [timeslicePeriod, setTimeslicePeriod] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const apisConnected =
    coretimeApi &&
    coretimeApiState === ApiState.READY &&
    relayApi &&
    relayApiState === ApiState.READY &&
    contractsApi &&
    contractsReady;

  const fetchTasks = async () => {
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return {};
    const res = await coretimeApi.query.broker.workplan.entries();
    const tasks: Record<string, number> = {};

    /*
    for await (const [key, value] of res) {
      const [[strBegin, strCore]] = key.toHuman() as [[string, string]];
      const records = value.toHuman() as ScheduleItem[];

      records.forEach((record) => {
        const begin = parseHNString(strBegin);
        const core = parseHNString(strCore);
        const {
          mask,
          assignment: { Task: taskId },
        } = record;
        const rawId = { begin, core, mask } as OnChainRegionId;
        tasks[stringifyOnChainRegionId(rawId)] = parseHNString(taskId);
      });
    }
    */
    return tasks;
  };

  const fetchRegions = async (): Promise<void> => {
    if (!apisConnected || !activeAccount) {
      setRegions([]);
      return;
    }

    setLoading(true);
    const timeslicePeriod = parseHNString(
      coretimeApi.consts.broker.timeslicePeriod.toString()
    );

    const tasks = await fetchTasks();

    const rawXcRegionIds = await getOwnedRawXcRegionIds();
    const xcRegions = await getOwnedXcRegions(rawXcRegionIds);

    const brokerRegions = await getBrokerRegions();

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions, ...xcRegions]) {
      const beginBlockHeight = timeslicePeriod * region.getBegin();

      const rawId = region.getEncodedRegionId(contractsApi);
      const name = localStorage.getItem(`region-${rawId}`);
      const taskId = tasks[rawId.toString()];

      // rough estimation
      const endBlockHeight = timeslicePeriod * region.getEnd();
      const currentBlockHeight = parseHNString((await coretimeApi.query.system.number()).toString());
      const durationInBlocks = endBlockHeight - beginBlockHeight;

      let consumed = (currentBlockHeight - beginBlockHeight) / durationInBlocks;
      if (consumed < 0) {
        // This means that the region hasn't yet started.
        consumed = 0;
      }

      const coretimeOwnership = region.getMask().countOnes() / timeslicePeriod;
      const currentUsage = 0; // FIXME:

      _regions.push(new RegionMetadata(
        region,
        RegionLocation.CORETIME_CHAIN, // FIXME
        rawId,
        name ?? `Region #${_regions.length + 1}`,
        coretimeOwnership,
        currentUsage,
        consumed,
        taskId
      ))
    }
    console.log(_regions);

    setRegions(_regions.filter(({ region }) => region.getOwner() === activeAccount.address));
    setLoading(false);
  };

  useEffect(() => {
    if (!apisConnected) return;
    const timeslicePeriod = parseHNString(
      coretimeApi.consts.broker.timeslicePeriod.toString()
    );
    setTimeslicePeriod(timeslicePeriod);
    fetchRegions();
  }, [apisConnected]);

  useEffect(() => {
    activeAccount && fetchRegions();
  }, [activeAccount]);

  const updateRegionName = (index: number, name: string) => {
    const _regions = [...regions];
    const region = regions[index];
    _regions[index] = {
      ...region,
      name,
    };
    setRegions(_regions);
    localStorage.setItem(
      `region-${stringifyOnChainRegionId(region.rawId)}`,
      name
    );
  };

  const getBrokerRegions = async (): Promise<Array<Region>> => {
    if (!coretimeApi) {
      return [];
    }
    const brokerEntries = await coretimeApi.query.broker.regions.entries();

    const brokerRegions: Array<Region> = brokerEntries
      .map(([key, value]) => {
        // @ts-ignore
        const { begin, core, mask } = key.toHuman()[0];
        const regionId = { begin, core, mask: new CoreMask(mask) };
        return new Region(regionId, value.toHuman() as RegionRecord);
      })
      .filter(entry => entry !== null) as Array<Region>;

    return brokerRegions;
  }

  const getOwnedRawXcRegionIds = async (): Promise<Array<string>> => {
    if (!contractsApi || !contract || !activeAccount) {
      return [];
    }

    const rawRegionIds = [];
    let isError = false;
    let index = 0;

    while (!isError) {
      const result = await contractQuery(
        contractsApi,
        "",
        contract,
        "PSP34Enumerable::owners_token_by_index",
        {},
        [activeAccount.address, index],
      );

      const { output, isError: queryError, decodedOutput } = decodeOutput(
        result,
        contract,
        "PSP34Enumerable::owners_token_by_index",
      );

      if (queryError || decodedOutput === "TokenNotExists") {
        isError = true;
      } else {
        rawRegionIds.push(parseHNStringToString(output.Ok.U128));
        index++;
      }
    }

    return rawRegionIds;
  };

  const getOwnedXcRegions = async (rawRegionIds: Array<string>): Promise<Array<Region>> => {
    if (!contractsApi || !contract || !activeAccount) {
      return [];
    }

    const regions: Array<Region> = [];

    for await (const regionId of rawRegionIds) {
      const result = await contractQuery(
        contractsApi,
        "",
        contract,
        "RegionMetadata::get_metadata",
        {},
        [regionId],
      );

      const { output, isError: queryError } = decodeOutput(
        result,
        contract,
        "RegionMetadata::get_metadata",
      );

      if (!queryError) {
        const versionedRegion = output.Ok;

        // TODO: Once cross-chain region transfers are enabled from the broker pallet ensure 
        // metadata is correct.

        regions.push(new Region({
          begin: versionedRegion.region.begin,
          core: versionedRegion.region.core,
          mask: new CoreMask(versionedRegion.region.mask),
        }, {
          end: versionedRegion.region.end,
          owner: activeAccount.address,
          paid: null
        }));
      }
    }

    return regions;
  }

  return (
    <RegionDataContext.Provider
      value={{
        regions,
        config: { timeslicePeriod },
        loading,
        updateRegionName,
        fetchRegions,
      }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

const useRegions = () => useContext(RegionDataContext);

export { RegionDataProvider, useRegions };
