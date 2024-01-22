import {
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { CoreMask, Region } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import {
  COREMASK_BYTES_LEN,
  RegionLocation,
  RegionMetadata,
  ScheduleItem,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { CONTRACT_XC_REGIONS } from '../apis/consts';
import { ApiState } from '../apis/types';
import XcRegionsMetadata from '../../contracts/xc_regions.json';

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
  const {
    api: contractsApi,
    isConnected: contractsReady,
    activeAccount,
  } = useInkathon();

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
    const workplan = await coretimeApi.query.broker.workplan.entries();
    const tasks: Record<string, number> = {};

    for await (const [key, value] of workplan) {
      let [[begin, core]] = key.toHuman() as [[number, number]];

      const records = value.toHuman() as ScheduleItem[];

      records.forEach((record) => {
        const { mask } = record;

        const region = new Region(
          {
            begin: parseHNString(begin.toString()),
            core: parseHNString(core.toString()),
            mask: new CoreMask(mask),
          },
          { end: 0, owner: '', paid: null }
        );
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
    const brokerRegions = await getBrokerRegions();

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions]) {
      const beginBlockHeight = timeslicePeriod * region.getBegin();

      const rawId = region.getEncodedRegionId(contractsApi);
      const name = localStorage.getItem(`region-${rawId}`);
      const taskId = tasks[rawId.toString()];

      // rough estimation
      const endBlockHeight = timeslicePeriod * region.getEnd();
      const currentBlockHeight = parseHNString(
        (await coretimeApi.query.system.number()).toString()
      );
      const durationInBlocks = endBlockHeight - beginBlockHeight;

      let consumed = (currentBlockHeight - beginBlockHeight) / durationInBlocks;
      if (consumed < 0) {
        // This means that the region hasn't yet started.
        consumed = 0;
      }

      const coretimeOwnership =
        region.getMask().countOnes() / (COREMASK_BYTES_LEN * 8);
      const currentUsage = 0; // FIXME:

      _regions.push(
        new RegionMetadata(
          region,
          RegionLocation.CORETIME_CHAIN,
          rawId,
          name ?? `Region #${_regions.length + 1}`,
          coretimeOwnership,
          currentUsage,
          consumed,
          taskId
        )
      );
    }

    setRegions(
      _regions.filter(
        ({ region }) => region.getOwner() === activeAccount.address
      )
    );
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
    localStorage.setItem(`region-${region.rawId}`, name);
  };

  const getBrokerRegions = async (): Promise<Array<Region>> => {
    if (!coretimeApi) {
      return [];
    }
    const brokerEntries = await coretimeApi.query.broker.regions.entries();

    const brokerRegions: Array<Region> = brokerEntries
      .map(([key, value]) => {
        const keyTuple: any = key.toHuman();

        const { begin, core, mask } = keyTuple[0] as any;
        const { end, owner, paid } = value.toHuman() as any;

        const regionId = {
          begin: parseHNString(begin.toString()),
          core: parseHNString(core.toString()),
          mask: new CoreMask(mask),
        };
        return new Region(regionId, {
          end: parseHNString(end),
          owner,
          paid: paid ? parseHNString(paid) : null,
        });
      })
      .filter((entry) => entry !== null) as Array<Region>;

    return brokerRegions;
  };

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
