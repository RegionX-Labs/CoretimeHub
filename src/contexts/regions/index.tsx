import { encodeAddress } from '@polkadot/util-crypto';
import { CoreIndex, getEncodedRegionId, Region } from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ContextStatus,
  ISMPRecordStatus,
  NetworkType,
  RegionLocation,
  RegionMetadata,
} from '@/models';

import * as NativeRegions from './native';
import * as RegionXRegions from './regionx';
import { useAccounts } from '../account';
import { useCoretimeApi, useRelayApi } from '../apis';
import { EXPERIMENTAL } from '../apis/consts';
import { useRegionXApi } from '../apis/RegionXApi';
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
    state: { api: regionxApi },
  } = useRegionXApi();
  const {
    state: { api: relayApi, apiState: relayApiState, height: relayBlockNumber },
  } = useRelayApi();
  const {
    state: { activeAccount },
  } = useAccounts();
  const { network } = useNetwork();

  const { fetchWorkplan, fetchRegionWorkload } = useTasks();

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [loading, setLoading] = useState(false);
  const { network } = useNetwork();

  const _getTaskFromWorkloadId = useCallback(
    async (core: CoreIndex, mask: string): Promise<number | null> => {
      const task = await fetchRegionWorkload(core, mask);
      return task;
    },
    [fetchRegionWorkload]
  );

  const fetchRegions = async (): Promise<void> => {
    if (!activeAccount) {
      setRegions([]);
      return;
    }
    const constructRegionMetadata = async (
      region: Region,
      location: RegionLocation,
      owner: string,
      tasks: Tasks,
      index: number,
      recordStatus: ISMPRecordStatus = ISMPRecordStatus.AVAILABLE,
      commitment?: string
    ): Promise<RegionMetadata | null> => {
      // Only user owned non-expired regions.
      if (
        encodeAddress(region.getOwner(), 42) !== encodeAddress(owner, 42) ||
        region.consumed({ timeslicePeriod, relayBlockNumber }) > 1
      )
        return null;

      const rawId = getEncodedRegionId(
        region.getRegionId(),
        location === RegionLocation.CORETIME_CHAIN ? coretimeApi : regionxApi
      ).toString();

      const name =
        localStorage.getItem(`region-${rawId}`) ?? `Region #${index + 1}`;

      let task = tasks[rawId.toString()] ?? null;

      // If the region isn't still active it cannot be in the workload.
      if (region.consumed({ timeslicePeriod, relayBlockNumber }) != 0) {
        if (!task) {
          task = await _getTaskFromWorkloadId(
            region.getCore(),
            region.getMask()
          );
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

    setStatus(ContextStatus.LOADING);

    const tasks = await fetchWorkplan();

    const _regions: Array<RegionMetadata> = [];

    const brokerRegions = await NativeRegions.fetchRegions(coretimeApi);
    for await (const region of brokerRegions) {
      const regionMetadata = await constructRegionMetadata(
        region,
        RegionLocation.CORETIME_CHAIN,
        activeAccount.address,
        tasks,
        _regions.length
      );
      if (!regionMetadata) {
        continue;
      }
      _regions.push(regionMetadata);
    }

    const regionxRegions = EXPERIMENTAL
      ? await RegionXRegions.fetchRegions(regionxApi)
      : [];
    for await (const [region, status, commitment] of regionxRegions) {
      if (status === ISMPRecordStatus.AVAILABLE) {
        const regionMetadata = await constructRegionMetadata(
          region,
          RegionLocation.REGIONX_CHAIN,
          activeAccount.address,
          tasks,
          _regions.length
        );
        if (!regionMetadata) continue;
        _regions.push(regionMetadata);
      } else {
        const regionMetadata = await constructRegionMetadata(
          region,
          RegionLocation.REGIONX_CHAIN,
          activeAccount.address,
          tasks,
          _regions.length,
          status,
          commitment
        );
        if (!regionMetadata) continue;
        _regions.push(regionMetadata);
      }
    }

    setRegions(_regions);
    setLoading(false);
  };

  const constructRegionMetadata = async (
    region: Region,
    location: RegionLocation,
    owner: string,
    tasks: Tasks,
    index: number,
    recordStatus: ISMPRecordStatus = ISMPRecordStatus.AVAILABLE,
    commitment?: string
  ): Promise<RegionMetadata | null> => {
    // Only user owned non-expired regions.
    if (
      encodeAddress(region.getOwner(), 42) !== encodeAddress(owner, 42) ||
      region.consumed({ timeslicePeriod, relayBlockNumber }) > 1
    )
      return null;

    const rawId = getEncodedRegionId(
      region.getRegionId(),
      location === RegionLocation.CORETIME_CHAIN ? coretimeApi : regionxApi
    ).toString();

    const name =
      localStorage.getItem(`region-${rawId}`) ?? `Region #${index + 1}`;

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

  useEffect(() => {
    setStatus(ContextStatus.UNINITIALIZED);
    setRegions([]);
  }, [network]);

  useEffect(() => {
    if (!activeAccount) return;
    if (network === NetworkType.NONE) return;
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return;
    if (!relayApi || relayApiState !== ApiState.READY) return;
    if (relayBlockNumber === 0) return;

    if (status === ContextStatus.LOADED) {
      const found =
        regions.findIndex(
          ({ region }) =>
            region.getBegin() * timeslicePeriod + 1 === relayBlockNumber ||
            region.getEnd() * timeslicePeriod + 1 === relayBlockNumber
        ) !== -1;
      if (!found) return;
    } else if (status === ContextStatus.LOADING) {
      return;
    }
    fetchRegions();
  }, [network, activeAccount, coretimeApi, coretimeApiState, relayBlockNumber]);

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
