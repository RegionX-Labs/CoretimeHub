import React, { createContext, useContext, useEffect, useState } from 'react';

import { SaleInfo } from '@/models';
import { useCoretimeApi } from '../apis';
import { ApiState } from '../apis/types';

interface SaleData {
  loading: boolean;
  saleInfo: SaleInfo;
  fetchSaleInfo: () => void;
}

const defaultSaleData: SaleData = {
  loading: true,
  saleInfo: {
    cores_offered: 0,
    cores_sold: 0,
    first_core: 0,
    ideal_cores_sold: 0,
    leadin_length: 0,
    price: 0,
    region_begin: 0,
    region_end: 0,
    sale_start: 0,
    sellout_price: null,
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
  const [loading, setLoading] = useState(true);

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();

  const fetchSaleInfo = async () => {
    setLoading(true);
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return {};

    const saleInfo = await coretimeApi.query.broker.saleInfo();
    setSaleInfo(saleInfo.toHuman() as SaleInfo);
    setLoading(false);
  };

  useEffect(() => {
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return;
    fetchSaleInfo();
  }, [coretimeApi, coretimeApiState]);

  return (
    <SaleDataContext.Provider value={{ loading, saleInfo, fetchSaleInfo }}>
      {children}
    </SaleDataContext.Provider>
  );
};

const useSaleInfo = () => useContext(SaleDataContext);

export { SaleInfoProvider, useSaleInfo };
