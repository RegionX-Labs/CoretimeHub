import { useInkathon } from '@scio-labs/use-inkathon';
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
import { useCoretimeApi } from '../apis';
import { useCommon } from '../common';
import { useTasks } from '../tasks';

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
  const { api, activeAccount } = useInkathon();

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

    const brokerRegions = await NativeRegions.fetchRegions(coretimeApi);

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions]) {
      const rawId = region.getEncodedRegionId(api);
      const location = RegionLocation.CORETIME_CHAIN;

      const name =
        localStorage.getItem(`region-${rawId}`) ??
        `Region #${_regions.length + 1}`;

      _regions.push(
        RegionMetadata.construct(
          context,
          region.getEncodedRegionId(api),
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
  }, [activeAccount, context, coretimeApi, api, fetchTasks]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const updateRegionName = (index: number, name: string) => {
    const _regions = [...regions];
    _regions[index].name = name;
    setRegions(_regions);
    localStorage.setItem(`region-${_regions[index].rawId}`, name);
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
