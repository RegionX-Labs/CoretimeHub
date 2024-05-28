import React, { createContext, useContext, useEffect, useState } from 'react';

import { getBlockTime, getBlockTimestamp } from '@/utils/functions';
import {
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleStartInBlocks,
} from '@/utils/sale';

import {
  BrokerStatus,
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

  const [saleInfo, setSaleInfo] = useState<SaleInfo>(defaultSaleData.saleInfo);
  const [config, setConfig] = useState<SaleConfig>(defaultSaleData.config);

  const [loading, setLoading] = useState(true);
  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<SalePhase>(
    SalePhase.Interlude
  );
  const [endpoints, setEndpoints] = useState<PhaseEndpoints>(defaultEndpoints);

  const {
    state: { api: coretimeApi, apiState: coretimeApiState, height },
  } = useCoretimeApi();

  useEffect(() => {
    const fetchSaleInfo = async () => {
      setLoading(true);

      if (
        !coretimeApi ||
        coretimeApiState !== ApiState.READY ||
        !coretimeApi.query.broker
      )
        return;

      const infoRaw = await coretimeApi.query.broker.saleInfo();
      const info = infoRaw.toJSON() as SaleInfo;

      if (info && Object.keys(info).length) {
        setSaleInfo(info);

        const configRaw = await coretimeApi.query.broker.configuration();
        const config = configRaw.toJSON() as SaleConfig;
        setConfig(config);
      } else {
        setSaleInfo(defaultSaleData.saleInfo);
        setConfig(defaultSaleData.config);
      }

      const statusRaw = await coretimeApi.query.broker.status();
      const { lastCommittedTimeslice } = statusRaw.toJSON() as BrokerStatus;

      const _saleStart = getSaleStartInBlocks(saleInfo);
      const _saleEnd = getSaleEndInBlocks(
        saleInfo,
        height,
        lastCommittedTimeslice,
        network
      );
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

      setCurrentPhase(getCurrentPhase(saleInfo, height));

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

    fetchSaleInfo();
  }, [network, coretimeApi, coretimeApiState]);

  return (
    <SaleDataContext.Provider
      value={{
        loading,
        saleInfo,
        config,
        phase: {
          saleStartTimestamp,
          currentPhase,
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
