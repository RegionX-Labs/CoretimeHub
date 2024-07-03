import { encodeAddress } from '@polkadot/util-crypto';
import { CoreIndex, getEncodedRegionId, Region } from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { EXPERIMENTAL } from '@/consts';
import {
  ContextStatus,
  ISMPRecordStatus,
  NetworkType,
  RegionLocation,
  RegionMetadata,
} from '@/models';

import * as CoretimeRegions from './coretime';
import * as RegionXRegions from './regionx';
import { useAccounts } from '../account';
import { useCoretimeApi, useRelayApi } from '../apis';
import { useRegionXApi } from '../apis/RegionXApi';
import { ApiState } from '../apis/types';
import { useNetwork } from '../network';
import { Tasks, useTasks } from '../tasks';

interface RegionsData {
  regions: Array<RegionMetadata>;
  status: ContextStatus;
  updateRegionName: (_index: number, _name: string) => void;
  fetchRegions: () => Promise<void>;
}
const defaultRegionData: RegionsData = {
  regions: [],
  status: ContextStatus.UNINITIALIZED,
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
    timeslicePeriod,
  } = useCoretimeApi();
  const {
    state: { api: regionxApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: { api: relayApi, apiState: relayApiState, height: relayBlockNumber },
  } = useRelayApi();
  const {
    state: { activeAccount },
  } = useAccounts();
  const { network } = useNetwork();

  const { fetchWorkplan, fetchRegionWorkload } = useTasks();

  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [status, setStatus] = useState<ContextStatus>(
    ContextStatus.UNINITIALIZED
  );

  useEffect(() => {
    setStatus(ContextStatus.UNINITIALIZED);
    setRegions([]);
  }, [network]);

  useEffect(() => {
    if (network === NetworkType.NONE) return;
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return;
    if (!relayApi || relayApiState !== ApiState.READY) return;
    if (relayBlockNumber === 0) return;

    if (!activeAccount) {
      setStatus(ContextStatus.LOADED);
      setRegions([]);
      return;
    }

    if (
      activeAccount.address == currentAddress &&
      (status === ContextStatus.LOADED || status === ContextStatus.LOADING)
    )
      return;

    fetchRegions();
  }, [
    activeAccount,
    coretimeApi,
    coretimeApiState,
    relayApi,
    relayApiState,
    regionxApi,
    regionxApiState,
    relayBlockNumber,
    timeslicePeriod,
    status,
  ]);

  useEffect(() => {
    fetchRegions();
  }, [activeAccount]);

  const fetchRegions = async () => {
    setCurrentAddress(activeAccount ? activeAccount.address : null);
    setStatus(ContextStatus.LOADING);

    const tasks = await fetchWorkplan();

    const ctRegions = await collectCoretimeRegions(tasks);
    const rxRegions =
      EXPERIMENTAL || network === NetworkType.ROCOCO
        ? await collectRegionXRegions(tasks)
        : [];

    setRegions(ctRegions.concat(rxRegions));
    setStatus(ContextStatus.LOADED);
  };

  const collectCoretimeRegions = async (
    tasks: Tasks
  ): Promise<Array<RegionMetadata>> => {
    const region_metadata: Array<RegionMetadata> = [];
    const regions = await CoretimeRegions.fetchRegions(coretimeApi);

    for await (const region of regions) {
      const metadata = await constructMetadata(
        region,
        tasks,
        RegionLocation.CORETIME_CHAIN
      );
      metadata && region_metadata.push(metadata);
    }

    return region_metadata;
  };

  const collectRegionXRegions = async (
    tasks: Tasks
  ): Promise<Array<RegionMetadata>> => {
    const region_metadata: Array<RegionMetadata> = [];
    const regions = await RegionXRegions.fetchRegions(regionxApi);

    for await (const [region, status, commitment] of regions) {
      const metadata = await constructMetadata(
        region,
        tasks,
        RegionLocation.REGIONX_CHAIN,
        status,
        status === ISMPRecordStatus.PENDING ? commitment : undefined
      );
      metadata && region_metadata.push(metadata);
    }

    return region_metadata;
  };

  const constructMetadata = async (
    region: Region,
    tasks: Tasks,
    location: RegionLocation,
    recordStatus: ISMPRecordStatus = ISMPRecordStatus.AVAILABLE,
    commitment?: string
  ): Promise<RegionMetadata | null> => {
    if (!activeAccount) return null;
    // Only user owned non-expired regions.
    if (
      encodeAddress(region.getOwner(), 42) !==
      encodeAddress(activeAccount.address, 42) ||
      region.consumed({ timeslicePeriod, relayBlockNumber }) > 1
    )
      return null;

    const rawId = getEncodedRegionId(
      region.getRegionId(),
      location === RegionLocation.CORETIME_CHAIN ? coretimeApi : regionxApi
    ).toString();

    const name =
      localStorage.getItem(`region-${rawId}`) ?? `Region #${region.getCore()}`; // RegionId is the first three digits.

    let task = tasks[rawId.toString()] ?? null;
    // If the region isn't still active it cannot be in the workload.
    if (region.consumed({ timeslicePeriod, relayBlockNumber }) != 0) {
      if (!task) {
        task = await _getTaskFromWorkloadId(region.getCore(), region.getMask());
      }
    }

    return RegionMetadata.construct(
      { timeslicePeriod, relayBlockNumber },
      getEncodedRegionId(region.getRegionId(), coretimeApi),
      region,
      name,
      location,
      task,
      recordStatus,
      commitment
    );
  };

  const _getTaskFromWorkloadId = useCallback(
    async (core: CoreIndex, mask: string): Promise<number | null> => {
      const task = await fetchRegionWorkload(core, mask);
      return task;
    },
    [fetchRegionWorkload]
  );

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
        status,
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
