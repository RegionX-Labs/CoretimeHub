import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { CoreMask, Region, RegionId } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString, parseHNStringToString } from '@/utils/functions';

import { RegionLocation, RegionMetadata, ScheduleItem } from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
import { ApiState } from '../apis/types';
import { useCommon } from '../common';
import MarketMetadata from '../../contracts/market.json';
import XcRegionsMetadata from '../../contracts/xc_regions.json';

type Tasks = Record<string, number | null>;

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

  const context = useCommon();

  const [regions, setRegions] = useState<Array<RegionMetadata>>([]);
  const [loading, setLoading] = useState(false);

  const relayConnected = relayApi && relayApiState === ApiState.READY;
  const coretimeConnected = coretimeApi && coretimeApiState === ApiState.READY;
  const contractsConnected = contractsApi && contractsReady;

  const fetchTasks = async (): Promise<Tasks> => {
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return {};
    const workplan = await coretimeApi.query.broker.workplan.entries();
    const tasks: Record<string, number | null> = {};

    for await (const [key, value] of workplan) {
      const [[begin, core]] = key.toHuman() as [[number, number]];
      const records = value.toHuman() as ScheduleItem[];

      records.forEach((record) => {
        const {
          assignment: { Task: taskId },
          mask,
        } = record;

        const region = new Region(
          {
            begin: parseHNString(begin.toString()),
            core: parseHNString(core.toString()),
            mask: new CoreMask(mask),
          },
          { end: 0, owner: '', paid: null },
          0
        );
        tasks[region.getEncodedRegionId(contractsApi).toString()] = taskId
          ? parseHNString(taskId)
          : null;
      });
    }
    return tasks;
  };

  const fetchRegions = async (): Promise<void> => {
    if (!activeAccount || !relayApi) {
      setRegions([]);
      return;
    }

    setLoading(true);

    const tasks = await fetchTasks();

    const xcRegionIds = await getOwnedXcRegionIds();
    const listedRegionIds = await getListedRegionIds();
    const xcRegions = await getOwnedXcRegions(
      xcRegionIds.concat(listedRegionIds)
    );

    const brokerRegions = await getBrokerRegions();

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
        return new Region(
          regionId,
          {
            end: parseHNString(end),
            owner,
            paid: paid ? parseHNString(paid) : null,
          },
          0
        );
      })
      .filter((entry) => entry !== null) as Array<Region>;

    return brokerRegions;
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

  // Get the region ids of all the regions that the user owns on the contracts chain.
  const getOwnedXcRegionIds = async (): Promise<Array<string>> => {
    if (!contractsApi || !xcRegionsContract || !activeAccount) {
      return [];
    }

    const rawRegionIds = [];
    let isError = false;
    let index = 0;

    while (!isError) {
      const result = await contractQuery(
        contractsApi,
        '',
        xcRegionsContract,
        'PSP34Enumerable::owners_token_by_index',
        {},
        [activeAccount.address, index]
      );

      const {
        output,
        isError: queryError,
        decodedOutput,
      } = decodeOutput(
        result,
        xcRegionsContract,
        'PSP34Enumerable::owners_token_by_index'
      );

      if (queryError || decodedOutput === 'TokenNotExists') {
        isError = true;
      } else {
        rawRegionIds.push(parseHNStringToString(output.Ok.U128));
        index++;
      }
    }

    return rawRegionIds;
  };

  // Get the region ids of all the regions that the user listed on the market
  const getListedRegionIds = async () => {
    if (!contractsApi || !marketContract || !activeAccount) {
      return [];
    }

    const result = await contractQuery(
      contractsApi,
      '',
      marketContract,
      'listed_regions',
      {},
      [activeAccount.address]
    );

    const { output } = decodeOutput(result, marketContract, 'listed_regions');

    return output.map((regionId: string) => parseHNStringToString(regionId));
  };

  const getOwnedXcRegions = async (
    rawRegionIds: Array<string>
  ): Promise<Array<Region>> => {
    if (!contractsApi || !xcRegionsContract || !activeAccount) {
      return [];
    }

    const regions: Array<Region> = [];

    for await (const regionId of rawRegionIds) {
      const id = contractsApi.createType('Id', { U128: regionId });
      const result = await contractQuery(
        contractsApi,
        '',
        xcRegionsContract,
        'RegionMetadata::get_metadata',
        {},
        [id]
      );

      const { output, isError: queryError } = decodeOutput(
        result,
        xcRegionsContract,
        'RegionMetadata::get_metadata'
      );

      if (!queryError) {
        const versionedRegion = output.Ok;

        // TODO: Once cross-chain region transfers are enabled from the broker pallet ensure
        // metadata is correct.

        regions.push(
          new Region(
            {
              begin: parseHNString(versionedRegion.region.begin),
              core: parseHNString(versionedRegion.region.core),
              mask: new CoreMask(versionedRegion.region.mask),
            },
            {
              end: parseHNString(versionedRegion.region.end),
              owner: activeAccount.address,
              paid: null,
            },
            versionedRegion.version
          )
        );
      }
    }

    return regions;
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
