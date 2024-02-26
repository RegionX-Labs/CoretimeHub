import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString, parseHNStringToString } from '@/utils/functions';

import { COREMASK_BIT_LEN, Listing } from '@/models';

import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
import { useCommon } from '../common';
import MarketMetadata from '../../contracts/market.json';
import XcRegionsMetadata from '../../contracts/xc_regions.json';

interface MarketData {
  loading: boolean;
  listedRegions: Array<Listing>;
  fetchMarketInfo: () => void;
}

const defaultMarketData: MarketData = {
  loading: true,
  listedRegions: [],
  fetchMarketInfo: () => {
    /** */
  },
};

const MarketDataContext = createContext<MarketData>(defaultMarketData);

interface Props {
  children: React.ReactNode;
}

const MarketProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [listedRegions, setListedRegions] = useState<Array<Listing>>([]);

  const context = useCommon();

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

  const fetchMarketInfo = async () => {
    setLoading(true);
    if (
      !contractsApi ||
      !marketContract ||
      !xcRegionsContract ||
      !activeAccount
    ) {
      return [];
    }
    const result = await contractQuery(
      contractsApi,
      '',
      marketContract,
      'listed_regions',
      {},
      [null]
    );
    const { output } = decodeOutput(result, marketContract, 'listed_regions');
    const regionIds = output.map((regionId: string) =>
      parseHNStringToString(regionId)
    );

    const _listedRegions: Array<Listing> = [];

    for await (const regionId of regionIds) {
      const id = contractsApi.createType('Id', { U128: regionId });
      const listingResult = await contractQuery(
        contractsApi,
        '',
        marketContract,
        'listed_region',
        {},
        [id]
      );
      const { output: listingOutput } = decodeOutput(
        listingResult,
        marketContract,
        'listed_region'
      );

      const regionResult = await contractQuery(
        contractsApi,
        '',
        xcRegionsContract,
        'RegionMetadata::get_metadata',
        {},
        [id]
      );
      const { output: regionOutput } = decodeOutput(
        regionResult,
        xcRegionsContract,
        'RegionMetadata::get_metadata'
      );

      const region = new Region(
        {
          begin: regionOutput.Ok.region.begin,
          core: regionOutput.Ok.region.core,
          mask: regionOutput.Ok.region.mask,
        },
        {
          end: regionOutput.Ok.region.end,
          owner: listingOutput.Ok.seller,
          paid: null,
        }
      );

      _listedRegions.push(
        Listing.construct(
          context,
          region,
          listingOutput.Ok.seller,
          parseHNString(listingOutput.Ok.timeslicePrice),
          listingOutput.Ok.saleRecepient
        )
      );
    }

    console.log(_listedRegions);

    setListedRegions(_listedRegions);
    setLoading(false);
  };

  useEffect(() => {
    if (!contractsApi || !activeAccount || !marketContract || !contractsReady)
      return;
    fetchMarketInfo();
  }, [contractsApi, activeAccount, marketContract, contractsReady]);

  return (
    <MarketDataContext.Provider
      value={{ loading, listedRegions, fetchMarketInfo }}
    >
      {children}
    </MarketDataContext.Provider>
  );
};

const useMarket = () => useContext(MarketDataContext);

export { MarketProvider, useMarket };
