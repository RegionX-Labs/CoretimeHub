import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Listing } from '@/models';

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

  const fetchMarket = useCallback(async () => {
    // TODO

    setLoading(false);
    setListedRegions([]);
    return [];
  }, []);

  useEffect(() => {
    fetchMarket();
  }, []);

  return (
    <MarketDataContext.Provider value={{ loading, listedRegions, fetchMarket }}>
      {children}
    </MarketDataContext.Provider>
  );
};

const useMarket = () => useContext(MarketDataContext);

export { MarketProvider, useMarket };
