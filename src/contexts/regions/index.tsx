import {
  CoreIndex,
  getEncodedRegionId,
  Region,
  RegionId,
} from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { RegionLocation, RegionMetadata } from '@/models';

import * as NativeRegions from './native';
import * as RegionXRegions from './regionx';
import { useAccounts } from '../account';
import { useCoretimeApi } from '../apis';
import { EXPERIMENTAL } from '../apis/consts';
import { useRegionXApi } from '../apis/RegionXApi';
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
  const {
    state: { api: regionxApi },
  } = useRegionXApi();
  const {
    state: { activeAccount },
  } = useAccounts();

  const { fetchWorkplan, fetchRegionWorkload } = useTasks();

  const context = useCommon();

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [loading, setLoading] = useState(false);

  const _getTaskFromWorkloadId = useCallback(
    async (core: CoreIndex, mask: string): Promise<number | null> => {
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
    const regionxRegions = EXPERIMENTAL
      ? await RegionXRegions.fetchRegions(regionxApi)
      : [];

    const _regions: Array<RegionMetadata> = [];

    for await (const region of [...brokerRegions, ...regionxRegions]) {
      // Only user owned non-expired regions.
      if (
        region.getOwner() !== activeAccount.address ||
        region.consumed(context) > 1
      )
        continue;

      const location = brokerRegions.find(
        (r) =>
          JSON.stringify(r.getRegionId()) ===
            JSON.stringify(region.getRegionId()) &&
          r.getOwner() === region.getOwner()
      )
        ? RegionLocation.CORETIME_CHAIN
        : RegionLocation.REGIONX_CHAIN;

      const rawId = getEncodedRegionId(
        region.getRegionId(),
        location === RegionLocation.CORETIME_CHAIN ? coretimeApi : regionxApi
      ).toString();

      const name =
        localStorage.getItem(`region-${rawId}`) ??
        `Region #${_regions.length + 1}`;

      let task = tasks[rawId.toString()] ?? null;

      // If the region isn't still active it cannot be in the workload.
      if (region.consumed(context) != 0) {
        if (!task) {
          task = await _getTaskFromWorkloadId(
            region.getCore(),
            region.getMask()
          );
        }
      }

      _regions.push(
        RegionMetadata.construct(
          context,
          getEncodedRegionId(region.getRegionId(), coretimeApi),
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
