import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

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
    const config: any = (
      await coretimeApi.query.broker.configuration()
    ).toHuman();
    setConfig({
      advanceNotice: parseHNString(config.advanceNotice.toString()),
      contributionTimeout: parseHNString(config.contributionTimeout.toString()),
      idealBulkProportion: config.idealBulkProportion,
      interludeLength: parseHNString(config.interludeLength.toString()),
      leadinLength: parseHNString(config.leadinLength.toString()),
      limitCoresOffered: config.limitCoresOffered
        ? parseHNString(config.limitCoresOffered.toString())
        : null,
      regionLength: parseHNString(config.regionLength.toString()),
      renewalBump: config.renewalBump,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return;
    fetchSaleInfo();
  }, [coretimeApi, coretimeApiState]);

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
