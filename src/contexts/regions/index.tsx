import { useInkathon } from '@scio-labs/use-inkathon';
import { CoreIndex, CoreMask, Region, RegionId } from 'coretime-utils';
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
import { useNetwork } from '../network';

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

  const { fetchWorkplan, fetchRegionWorkload } = useTasks();

  const context = useCommon();
  const { network } = useNetwork();

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [loading, setLoading] = useState(false);

  const _getTaskFromWorkloadId = useCallback(
    async (core: CoreIndex, mask: CoreMask): Promise<number | null> => {
      const task = await fetchRegionWorkload(core, mask);
      return task;
    },
    [fetchRegionWorkload]
  );

  const fetchRegions = useCallback(async (): Promise<void> => {
    if (!activeAccount) {
      setRegions([]);
      return;
    }
    setLoading(true);

    const tasks = await fetchWorkplan();

    const brokerRegions = await NativeRegions.fetchRegions(coretimeApi);

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions]) {
      // Only user owned non-expired regions.
      if (
        region.getOwner() !== activeAccount.address ||
        region.consumed(context) > 1
      )
        continue;

      const rawId = region.getEncodedRegionId(api).toString();
      const location = RegionLocation.CORETIME_CHAIN;

      const name =
        localStorage.getItem(`region-${rawId}`) ??
        `Region #${_regions.length + 1}`;

      const task = tasks[rawId.toString()]
        ? tasks[rawId.toString()]
        : await _getTaskFromWorkloadId(region.getCore(), region.getMask());

      _regions.push(
        RegionMetadata.construct(
          context,
          region.getEncodedRegionId(api),
          region,
          name,
          location,
          task
        )
      );
    }

    setRegions(_regions);
    setLoading(false);
  }, [
    activeAccount,
    context,
    coretimeApi,
    api,
    network,
    fetchWorkplan,
    _getTaskFromWorkloadId,
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
