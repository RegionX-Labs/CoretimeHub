import { BN } from '@polkadot/util';
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

import { parseHNStringToString } from '@/utils/functions';

import { Listing } from '@/models';

import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '../apis/consts';
import { useCommon } from '../common';
import { useRegions } from '../regions';

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

  const context = useCommon();

  const { api } = useInkathon();

  const fetchMarket = useCallback(async () => {
    setLoading(false);
    setListedRegions([]);
    return [];
  }, [api, context]);

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
