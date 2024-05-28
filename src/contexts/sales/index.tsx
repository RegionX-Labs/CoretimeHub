import React, { createContext, useContext, useEffect, useState } from 'react';

import { getBlockTime, getBlockTimestamp } from '@/utils/functions';
import {
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleStartInBlocks,
} from '@/utils/sale';

import {
  PhaseEndpoints,
  SaleConfig,
  SaleInfo,
  SalePhase,
  SalePhaseInfo,
} from '@/models';

import { useCoretimeApi } from '../apis';
import { ApiState } from '../apis/types';
import { useNetwork } from '../network';

interface SaleData {
  loading: boolean;
  saleInfo: SaleInfo;
  config: SaleConfig;
  phase: SalePhaseInfo;
}

const defaultSaleInfo = {
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
};

const defaultSaleConfig = {
  advanceNotice: 0,
  contributionTimeout: 0,
  idealBulkProportion: 0,
  interludeLength: 0,
  leadinLength: 0,
  limitCoresOffered: 0,
  regionLength: 0,
  renewalBump: 0,
};

const defaultEndpoints = {
  fixed: { start: 0, end: 0 },
  interlude: { start: 0, end: 0 },
  leadin: { start: 0, end: 0 },
};

const defaultSalePhase = {
  currentPhase: SalePhase.Interlude,
  saleStartTimestamp: 0,
  saleEndTimestamp: 0,
  endpoints: defaultEndpoints,
};

const defaultSaleData: SaleData = {
  loading: true,
  saleInfo: defaultSaleInfo,
  config: defaultSaleConfig,
  phase: defaultSalePhase,
};

const SaleDataContext = createContext<SaleData>(defaultSaleData);

interface Props {
  children: React.ReactNode;
}

const SaleInfoProvider = ({ children }: Props) => {
  const { network } = useNetwork();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, height },
    timeslicePeriod,
  } = useCoretimeApi();

  const [saleInfo, setSaleInfo] = useState<SaleInfo>(defaultSaleData.saleInfo);
  const [config, setConfig] = useState<SaleConfig>(defaultSaleData.config);

  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<SalePhase>(
    SalePhase.Interlude
  );
  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);
  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const [endpoints, setEndpoints] = useState<PhaseEndpoints>(defaultEndpoints);

  useEffect(() => {
    const fetchSaleInfo = async () => {
      if (
        !coretimeApi ||
        coretimeApiState !== ApiState.READY ||
        !coretimeApi.query.broker
      )
        return;

      const saleInfoRaw = await coretimeApi.query.broker.saleInfo();
      const saleInfo = saleInfoRaw.toJSON() as SaleInfo;

      if (!saleInfo) return;

      setSaleInfo(saleInfo);

      const configRaw = await coretimeApi.query.broker.configuration();
      const config = configRaw.toJSON() as SaleConfig;
      setConfig(config);
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return;
      setLoading(true);

      const _saleStart = getSaleStartInBlocks(saleInfo);
      const _saleEnd = getSaleEndInBlocks(saleInfo, timeslicePeriod, network);
      const _saleStartTimestamp = await getBlockTimestamp(
        coretimeApi,
        _saleStart,
        network
      );
      const _saleEndTimestamp = await getBlockTimestamp(
        coretimeApi,
        _saleEnd,
        network
      );

      setSaleStartTimestamp(_saleStartTimestamp);
      setSaleEndTimestamp(_saleEndTimestamp);

      const blockTime = getBlockTime(network);

      const _endpoints = {
        interlude: {
          start: _saleStartTimestamp - config.interludeLength * blockTime,
          end: _saleStartTimestamp,
        },
        leadin: {
          start: _saleStartTimestamp,
          end: _saleStartTimestamp + config.leadinLength * blockTime,
        },
        fixed: {
          start: _saleStartTimestamp + config.leadinLength * blockTime,
          end: _saleEndTimestamp,
        },
      };
      setEndpoints(_endpoints);

      setLoading(false);
    };

    const asyncFetchSaleInfo = async () => {
      setLoading(true);
      await fetchSaleInfo();
      setLoading(false);
    };
    asyncFetchSaleInfo();
  }, [network, coretimeApi, coretimeApiState]);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(saleInfo, height));
  }, [saleInfo, height]);

  return (
    <SaleDataContext.Provider
      value={{
        loading,
        saleInfo,
        config,
        phase: {
          currentPhase,
          saleStartTimestamp,
          saleEndTimestamp,
          endpoints,
        },
      }}
    >
      {children}
    </SaleDataContext.Provider>
  );
};

const useSaleInfo = () => useContext(SaleDataContext);

export { SaleInfoProvider, useSaleInfo };
