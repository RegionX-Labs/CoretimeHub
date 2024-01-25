import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

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

    const saleInfo: any = (await coretimeApi.query.broker.saleInfo()).toHuman();
    setSaleInfo({
      coresOffered: parseHNString(saleInfo.coresOffered.toString()),
      coresSold: parseHNString(saleInfo.coresSold.toString()),
      firstCore: parseHNString(saleInfo.firstCore.toString()),
      idealCoresSold: parseHNString(saleInfo.idealCoresSold.toString()),
      leadinLength: parseHNString(saleInfo.leadinLength.toString()),
      price: parseHNString(saleInfo.price.toString()),
      regionBegin: parseHNString(saleInfo.regionBegin.toString()),
      regionEnd: parseHNString(saleInfo.regionEnd.toString()),
      saleStart: parseHNString(saleInfo.saleStart.toString()),
      selloutPrice: saleInfo.selloutPrice
        ? parseHNString(saleInfo.saleStart.toString())
        : null,
    });
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
