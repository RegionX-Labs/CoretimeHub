import React, { createContext, useContext, useEffect, useState } from 'react';

import { countOne, getBlockTimestamp, parseHNString } from '@/utils/functions';

import {
  HumanRegionId,
  HumanRegionRecord,
  RegionMetadata,
  RegionOrigin,
  RELAY_CHAIN_BLOCK_TIME,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';

interface RegionsData {
  regions: Array<RegionMetadata>;
  config: {
    timeslicePeriod: number;
  };
  loading: boolean;
  updateRegionName: (_index: number, _name: string) => void;
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
};

const RegionDataContext = createContext<RegionsData>(defaultRegionData);

interface Props {
  children: React.ReactNode;
}

const RegionDataProvider = ({ children }: Props) => {
  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [timeslicePeriod, setTimeslicePeriod] = useState<number>(0);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

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
        const id = `${parseHNString(begin)}-${core}-${mask.slice(2)}`;
        const name = localStorage.getItem(`region-${id}`);

        _regions.push({
          begin: tsBegin,
          core,
          mask,
          end: tsEnd,
          owner,
          paid: nPaid,
          origin: RegionOrigin.CORETIME_CHAIN,
          id,
          name,
          ownership: countOne(mask) / timeslicePeriod,
        });
      }
      setRegions(_regions);

      setLoading(false);
    };
    setTimeslicePeriod(timeslicePeriod);
    fetchRegions();
  }, [coretimeApi, coretimeApiState, relayApi, relayApiState]);

  const updateRegionName = (index: number, name: string) => {
    const _regions = [...regions];
    const region = regions[index];
    _regions[index] = {
      ...region,
      name,
    };
    setRegions(_regions);
    localStorage.setItem(`region-${region.id}`, name);
  };

  return (
    <RegionDataContext.Provider
      value={{
        regions,
        config: { timeslicePeriod },
        loading,
        updateRegionName,
      }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

const useRegions = () => useContext(RegionDataContext);

export { RegionDataProvider, useRegions };
