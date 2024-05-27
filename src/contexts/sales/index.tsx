import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { SaleConfig, SaleInfo } from '@/models';

import { useCoretimeApi } from '../apis';
import { ApiState } from '../apis/types';

interface SaleData {
  loading: boolean;
  saleInfo: SaleInfo;
  config: SaleConfig;
  fetchSaleInfo: () => void;
}

const defaultSaleData: SaleData = {
  loading: true,
  saleInfo: {
    coresOffered: 0,
    coresSold: 0,
    firstCore: 0,
    idealCoresSold: 0,
    leadinLength: 0,
    price: 0,
    regionBegin: 0,
    regionEnd: 0,
    saleStart: 0,
    selloutPrice: null,
  },
  config: {
    advanceNotice: 0,
    contributionTimeout: 0,
    idealBulkProportion: 0,
    interludeLength: 0,
    leadinLength: 0,
    limitCoresOffered: 0,
    regionLength: 0,
    renewalBump: 0,
  },
  fetchSaleInfo: () => {
    /** */
  },
};

const SaleDataContext = createContext<SaleData>(defaultSaleData);

interface Props {
  children: React.ReactNode;
}

const SaleInfoProvider = ({ children }: Props) => {
  const [saleInfo, setSaleInfo] = useState<SaleInfo>(defaultSaleData.saleInfo);
  const [config, setConfig] = useState<SaleConfig>(defaultSaleData.config);
  const [loading, setLoading] = useState(true);

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();

  const fetchSaleInfo = useCallback(async () => {
    setLoading(true);
    if (
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !coretimeApi.query.broker
    )
      return;

    const info = (
      await coretimeApi.query.broker.saleInfo()
    ).toJSON() as SaleInfo;
    if (info && Object.keys(info).length) {
      setSaleInfo(info);

      const config = (
        await coretimeApi.query.broker.configuration()
      ).toJSON() as SaleConfig;
      setConfig(config);
    } else {
      setSaleInfo(defaultSaleData.saleInfo);
      setConfig(defaultSaleData.config);
    }
    setLoading(false);
  }, [coretimeApi, coretimeApiState]);

  useEffect(() => {
    fetchSaleInfo();
  }, [fetchSaleInfo]);

  return (
    <SaleDataContext.Provider
      value={{ loading, saleInfo, config, fetchSaleInfo }}
    >
      {children}
    </SaleDataContext.Provider>
  );
};

const useSaleInfo = () => useContext(SaleDataContext);

export { SaleInfoProvider, useSaleInfo };
