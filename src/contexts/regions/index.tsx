import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  decodeMaskString,
  getBlockTimestamp,
  parseHNString,
} from '@/utils/functions';

import {
  HumanRegionId,
  HumanRegionRecord,
  RegionMetadata,
  RELAY_CHAIN_BLOCK_TIME,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';

interface RegionsData {
  regions: Array<RegionMetadata>;
  config: {
    timeslicePeriod: number;
  };
}

const defaultRegionData: RegionsData = {
  regions: [],
  config: {
    timeslicePeriod: 0,
  },
};

const RegionDataContext = createContext<RegionsData>(defaultRegionData);

interface Props {
  children: React.ReactNode;
}

const RegionDataProvider = ({ children }: Props) => {
  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [timeslicePeriod, setTimeslicePeriod] = useState<number>(0);
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  useEffect(() => {
    if (
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !relayApi ||
      relayApiState !== ApiState.READY
    ) {
      setRegions([]);
      return;
    }
    const timeslicePeriod = parseHNString(
      coretimeApi.consts.broker.timeslicePeriod.toString()
    );
    const fetchRegions = async (): Promise<void> => {
      const _regions: Array<RegionMetadata> = [];
      const res = await coretimeApi.query.broker.regions.entries();
      for await (const [key, value] of res) {
        const [regionId] = key.toHuman() as [HumanRegionId];
        const regionData = value.toHuman() as HumanRegionRecord;

        const { begin, core, mask } = regionId;
        const { end, owner, paid } = regionData;

        const beginBlockHeight = timeslicePeriod * parseHNString(begin);
        const tsBegin = await getBlockTimestamp(relayApi, beginBlockHeight); // begin block timestamp

        // rough estimation
        const endBlockHeight = timeslicePeriod * parseHNString(end);
        const tsEnd =
          tsBegin +
          (endBlockHeight - beginBlockHeight) * RELAY_CHAIN_BLOCK_TIME;

        const nPaid = paid ? parseHNString(paid) : undefined;

        _regions.push({
          begin: tsBegin,
          core,
          mask: decodeMaskString(mask, Math.floor(timeslicePeriod / 8)),
          end: tsEnd,
          owner,
          paid: nPaid,
          id: `${tsBegin}-${tsEnd}`, // FIXME: unique identifier for each region
        });
      }
      setRegions(_regions);
    };
    setTimeslicePeriod(timeslicePeriod);
    fetchRegions();
  }, [coretimeApi, coretimeApiState, relayApi, relayApiState]);
  return (
    <RegionDataContext.Provider
      value={{ regions, config: { timeslicePeriod } }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

const useRegions = () => useContext(RegionDataContext);

export { RegionDataProvider, useRegions };
