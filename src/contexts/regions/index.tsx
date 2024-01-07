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
  HumanRegionId,
  HumanRegionRecord,
  OnChainRegionId,
  RegionMetadata,
  RegionOrigin,
  RELAY_CHAIN_BLOCK_TIME,
  ScheduleItem,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';
import { CONTRACT_XC_REGIONS } from '../apis/consts';
import XcRegionsMetadata from "../../contracts/xc_regions.json";
import { useToast } from '../toast';

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

  const { toastError } = useToast();

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

    const rawXcRegionIds = await getRawXcRegionIds();
    const xcRegions = await getXcRegions(rawXcRegionIds);

    const brokerEntries = await coretimeApi.query.broker.regions.entries();

    const brokerRegions: Array<[HumanRegionId, HumanRegionRecord]> = brokerEntries
      .map(([key, value]) => {
        const keyTuple = key.toHuman();

        // This is defensive.
        if (keyTuple && Array.isArray(keyTuple) && keyTuple[0] !== undefined) {
          return [keyTuple[0] as HumanRegionId, value.toHuman() as HumanRegionRecord];
        }
        return null;
      })
      .filter(entry => entry !== null) as Array<[HumanRegionId, HumanRegionRecord]>;

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions, ...xcRegions]) {
      const regionId = region[0];
      const regionData = region[1];

      const { begin, core, mask } = regionId;
      const { end, owner, paid } = regionData;

      const beginBlockHeight = timeslicePeriod * parseHNString(begin);
      const beginTimestamp = await getBlockTimestamp(relayApi, beginBlockHeight); // begin block timestamp

      // rough estimation
      const endBlockHeight = timeslicePeriod * parseHNString(end);
      const endTimestamp =
        beginTimestamp + (endBlockHeight - beginBlockHeight) * RELAY_CHAIN_BLOCK_TIME;

      const nPaid = paid ? parseHNString(paid) : undefined;
      const rawId: OnChainRegionId = {
        begin: parseHNString(begin),
        core,
        mask,
      };
      const strRegionId = stringifyOnChainRegionId(rawId);
      const name = localStorage.getItem(`region-${strRegionId}`);
      const taskId = tasks[strRegionId];

      const currentBlockHeight = parseHNString((await coretimeApi.query.system.number()).toString());

      const durabtionInBlocks = endBlockHeight - beginBlockHeight;

      let consumed = (currentBlockHeight - beginBlockHeight) / durabtionInBlocks;
      if (consumed < 0) {
        // This means that the region hasn't yet started.
        consumed = 0;
      }

      _regions.push({
        begin: beginTimestamp,
        core,
        mask,
        end: endTimestamp,
        owner,
        paid: nPaid,
        origin: RegionOrigin.CORETIME_CHAIN,
        rawId,
        consumed,
        name: name ?? `Region #${_regions.length + 1}`,
        ownership: countOne(mask) / timeslicePeriod,
        taskId,
      });
    }

    setRegions(_regions.filter(({ owner }) => owner === activeAccount.address));
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

  const getRawXcRegionIds = async (): Promise<Array<string>> => {
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

  const getXcRegions = async (rawRegionIds: Array<string>): Promise<Array<[HumanRegionId, HumanRegionRecord]>> => {
    if (!contractsApi || !contract || !activeAccount) {
      return [];
    }

    let regions: Array<[HumanRegionId, HumanRegionRecord]> = [];

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

        // TODO: Ensure metadata is correct

        regions.push([{
          begin: versionedRegion.region.begin,
          core: versionedRegion.region.core,
          mask: versionedRegion.region.mask,
        }, {
          end: versionedRegion.region.end,
          owner: activeAccount.address,
          paid: undefined
        }]);
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
