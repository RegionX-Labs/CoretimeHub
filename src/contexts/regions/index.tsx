import { useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region, RegionId } from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { RegionLocation, RegionMetadata } from '@/models';

import * as NativeRegions from './native';
import * as XcRegions from './xc';
import { useCoretimeApi } from '../apis';
import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
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
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { api: contractsApi, activeAccount } = useInkathon();

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

  const fetchRegions = useCallback(async (): Promise<void> => {
    if (!activeAccount) {
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
        ({ region, consumed }) =>
          region.getOwner() === activeAccount.address && consumed < 1
      )
    );
    setLoading(false);
  }, [
    activeAccount,
    context,
    coretimeApi,
    contractsApi,
    marketContract,
    xcRegionsContract,
    fetchTasks,
  ]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const updateRegionName = (index: number, name: string) => {
    const _regions = [...regions];
    _regions[index].name = name;
    setRegions(_regions);
    localStorage.setItem(`region-${_regions[index].rawId}`, name);
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
        fetchRegion: (_r: RegionId) =>
          NativeRegions.fetchRegion(coretimeApi, _r),
      }}
    >
      {children}
    </RegionDataContext.Provider>
  );
};

const useRegions = () => useContext(RegionDataContext);

export { RegionDataProvider, useRegions };
