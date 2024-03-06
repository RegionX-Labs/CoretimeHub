import { useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region, RegionId } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { RegionLocation, RegionMetadata } from '@/models';

import * as NativeRegions from './native';
import * as XcRegions from './xc';
import { useCoretimeApi, useRelayApi } from '../apis';
import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
import { ApiState } from '../apis/types';
import { useCommon } from '../common';
import { useTasks } from '../tasks';
import MarketMetadata from '../../contracts/market.json';
import XcRegionsMetadata from '../../contracts/xc_regions.json';

interface RegionsData {
  regions: Array<RegionMetadata>;
  loading: boolean;
  updateRegionName: (_index: number, _name: string) => void;
  fetchRegions: () => Promise<void>;
  fetchRegion: (_regionId: RegionId) => Promise<Region | null>;
}
const defaultRegionData: RegionsData = {
  regions: [],
  loading: false,
  updateRegionName: () => {
    /** */
  },
  fetchRegions: async () => {
    /** */
  },
  fetchRegion: async () => {
    return null;
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

  const { contract: xcRegionsContract } = useContract(
    XcRegionsMetadata,
    CONTRACT_XC_REGIONS
  );
  const { contract: marketContract } = useContract(
    MarketMetadata,
    CONTRACT_MARKET
  );

  const { fetchTasks } = useTasks();

  const context = useCommon();

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [loading, setLoading] = useState(false);

  const relayConnected = relayApi && relayApiState === ApiState.READY;
  const coretimeConnected = coretimeApi && coretimeApiState === ApiState.READY;
  const contractsConnected = contractsApi && contractsReady;

  const fetchRegions = async (): Promise<void> => {
    if (!activeAccount || !relayApi) {
      setRegions([]);
      return;
    }

    setLoading(true);

    const tasks = await fetchTasks();

    const ctx = {
      contractsApi,
      xcRegionsContract,
      marketContract,
    };
    const xcRegionIds = await XcRegions.fetchOwnedRegionIds(
      ctx,
      activeAccount.address
    );
    const listedRegionIds = await XcRegions.fetchListedRegionIds(
      ctx,
      activeAccount.address
    );
    const xcRegions = await XcRegions.fetchOwnedRegions(
      ctx,
      xcRegionIds.concat(listedRegionIds),
      activeAccount.address
    );

    const brokerRegions = await NativeRegions.fetchRegions(coretimeApi);

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions, ...xcRegions]) {
      const rawId = region.getEncodedRegionId(contractsApi);
      const location = determineRegionLocation(
        xcRegionIds,
        listedRegionIds,
        rawId.toString()
      );

      const name =
        localStorage.getItem(`region-${rawId}`) ??
        `Region #${_regions.length + 1}`;

      _regions.push(
        RegionMetadata.construct(
          context,
          region.getEncodedRegionId(contractsApi),
          region,
          name,
          location,
          tasks[rawId.toString()]
        )
      );
    }

    setRegions(
      _regions.filter(
        // Only user owned non-expired regions.
        ({ region }) =>
          region.getOwner() === activeAccount.address &&
          region.consumed(context) < 1
      )
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, [relayConnected, coretimeConnected, contractsConnected]);

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

  const fetchRegion = async (regionId: RegionId): Promise<Region | null> => {
    if (!coretimeApi) return null;
    const record: any = coretimeApi?.query.broker.get({
      begin: regionId.begin,
      core: regionId.core,
      mask: regionId.mask.getMask(),
    });

    return new Region(regionId, record, 0);
  };

  const determineRegionLocation = (
    xcRegionIds: string[],
    listedRegionIds: string[],
    regionId: string
  ): RegionLocation => {
    if (xcRegionIds.indexOf(regionId) >= 0) {
      return RegionLocation.CONTRACTS_CHAIN;
    } else if (listedRegionIds.indexOf(regionId) >= 0) {
      return RegionLocation.MARKET;
    } else {
      return RegionLocation.CORETIME_CHAIN;
    }
  };

  return (
    <RegionDataContext.Provider
      value={{
        regions,
        loading,
        updateRegionName,
        fetchRegions,
        fetchRegion,
      }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

const useRegions = () => useContext(RegionDataContext);

export { RegionDataProvider, useRegions };
