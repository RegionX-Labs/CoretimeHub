import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { CoreMask, Region } from 'coretime-utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { parseHNString, parseHNStringToString } from '@/utils/functions';

import { Listing } from '@/models';

import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
import { useCommon } from '../common';
import { useRegions } from '../regions';
import MarketMetadata from '../../contracts/market.json';
import XcRegionsMetadata from '../../contracts/xc_regions.json';

interface MarketData {
  loading: boolean;
  listedRegions: Array<Listing>;
  fetchMarket: () => void;
}

const defaultMarketData: MarketData = {
  loading: true,
  listedRegions: [],
  fetchMarket: () => {
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

  const { fetchRegion } = useRegions();
  const context = useCommon();

  const { api: contractsApi } = useInkathon();

  const { contract: xcRegionsContract } = useContract(
    XcRegionsMetadata,
    CONTRACT_XC_REGIONS
  );
  const { contract: marketContract } = useContract(
    MarketMetadata,
    CONTRACT_MARKET
  );

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    if (!contractsApi || !marketContract || !xcRegionsContract) {
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
    const { output, isError } = decodeOutput(
      result,
      marketContract,
      'listed_regions'
    );
    if (isError) return [];
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
          mask: new CoreMask(regionOutput.Ok.region.mask),
        },
        {
          end: regionOutput.Ok.region.end,
          owner: listingOutput.Ok.seller,
          paid: null,
        },
        regionOutput.Ok.version
      );

      /* TODO: For now we will skip this, but this should be uncommented
      if (!verifyMetadata(region)) {
        continue;
      }
      */

      // Skip expired regions.
      if (region.consumed(context) > 1) {
        continue;
      }

      const priceResult = await contractQuery(
        contractsApi,
        '',
        marketContract,
        'region_price',
        {},
        [id]
      );
      const { output: priceOutput } = decodeOutput(
        priceResult,
        marketContract,
        'region_price'
      );

      _listedRegions.push(
        Listing.construct(
          context,
          region,
          listingOutput.Ok.seller,
          parseHNString(listingOutput.Ok.timeslicePrice),
          parseHNString(priceOutput.Ok),
          listingOutput.Ok.saleRecepient
        )
      );
    }

    setListedRegions(_listedRegions);
    setLoading(false);
  }, [contractsApi, marketContract, xcRegionsContract, context]);

  /// Returns true or false depending whether the metadata matches with the one stored
  /// on the coreitme chain.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _verifyMetadata = async (region: Region): Promise<boolean> => {
    const actualRegion = await fetchRegion(region.getRegionId());

    if (actualRegion) {
      return actualRegion.getRegionRecord() == region.getRegionRecord();
    } else {
      return false;
    }
  };

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return (
    <MarketDataContext.Provider value={{ loading, listedRegions, fetchMarket }}>
      {children}
    </MarketDataContext.Provider>
  );
};

const useMarket = () => useContext(MarketDataContext);

export { MarketProvider, useMarket };
