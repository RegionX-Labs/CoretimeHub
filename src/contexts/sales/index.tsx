import React, { createContext, useContext, useEffect, useState } from 'react';

import { getBlockTime, getBlockTimestamp } from '@/utils/functions';
import { getCorePriceAt, getCurrentPhase } from '@/utils/sale';

import {
  ContextStatus,
  PhaseEndpoints,
  RELAY_CHAIN_BLOCK_TIME,
  SaleConfig,
  SaleInfo,
  SalePhase,
  SalePhaseInfo,
} from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';
import { useNetwork } from '../network';

interface SaleData {
  status: ContextStatus;
  saleInfo: SaleInfo;
  config: SaleConfig;
  phase: SalePhaseInfo;
  fetchSaleInfo: () => void;
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
  currentPrice: undefined,
  endpoints: defaultEndpoints,
};

const defaultSaleData: SaleData = {
  status: ContextStatus.UNINITIALIZED,
  saleInfo: defaultSaleInfo,
  config: defaultSaleConfig,
  phase: defaultSalePhase,
  fetchSaleInfo: () => {
    /** */
  },
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

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const [saleInfo, setSaleInfo] = useState<SaleInfo>(defaultSaleData.saleInfo);
  const [config, setConfig] = useState<SaleConfig>(defaultSaleData.config);

  const [status, setStatus] = useState(ContextStatus.UNINITIALIZED);
  const [currentPhase, setCurrentPhase] = useState<SalePhase>(
    SalePhase.Interlude
  );
  const [at, setAt] = useState(0);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const [endpoints, setEndpoints] = useState<PhaseEndpoints>(defaultEndpoints);

  useEffect(() => {
    setAt(currentPhase === SalePhase.Interlude ? saleInfo.saleStart : height);
  }, [saleInfo.saleStart, height, currentPhase]);

  useEffect(() => {
    setCurrentPrice(
      status !== ContextStatus.LOADED || height === 0
        ? undefined
        : getCorePriceAt(at, saleInfo)
    );
  }, [status, at, height, network, saleInfo]);

  const fetchSaleInfo = async () => {
    try {
      setStatus(ContextStatus.LOADING);
      if (
        !coretimeApi ||
        coretimeApiState !== ApiState.READY ||
        !relayApi ||
        relayApiState !== ApiState.READY ||
        !coretimeApi.query.broker
      ) {
        setStatus(ContextStatus.UNINITIALIZED);
        return;
      }

      const saleInfoRaw = await coretimeApi.query.broker.saleInfo();
      const saleInfo = saleInfoRaw.toJSON() as SaleInfo;
      // On Rococo we have `endPrice` while on Kusama we still have `price`.
      saleInfo.price = saleInfo.price || (saleInfo as any).endPrice;
      setSaleInfo(saleInfo);

      const configRaw = await coretimeApi.query.broker.configuration();
      const config = configRaw.toJSON() as SaleConfig;
      setConfig(config);

      const saleStart = saleInfo.saleStart;
      // Sale start != bulk phase start. sale_start = bulk_phase_start + interlude_length.
      const saleStartTimestamp = await getBlockTimestamp(
        coretimeApi,
        saleStart,
        network
      );

      const regionDuration = saleInfo.regionEnd - saleInfo.regionBegin;
      const blockTime = getBlockTime(network); // Block time on the coretime chain

      const saleEndTimestamp =
        saleStartTimestamp -
        config.interludeLength * blockTime +
        regionDuration * timeslicePeriod * RELAY_CHAIN_BLOCK_TIME;

      const _endpoints = {
        interlude: {
          start: saleStartTimestamp - config.interludeLength * blockTime,
          end: saleStartTimestamp,
        },
        leadin: {
          start: saleStartTimestamp,
          end: saleStartTimestamp + config.leadinLength * blockTime,
        },
        fixed: {
          start: saleStartTimestamp + config.leadinLength * blockTime,
          end: saleEndTimestamp,
        },
      };
      setEndpoints(_endpoints);
      setStatus(ContextStatus.LOADED);
    } catch (e) {
      /** empty error handler */
    }
  };

  useEffect(() => {
    fetchSaleInfo();
  }, [
    network,
    coretimeApi,
    coretimeApiState,
    relayApi,
    relayApiState,
    timeslicePeriod,
  ]);

  useEffect(() => {
    if (height === 0) return;
    setCurrentPhase(getCurrentPhase(saleInfo, height));
  }, [saleInfo, height]);

  return (
    <SaleDataContext.Provider
      value={{
        status,
        saleInfo,
        config,
        phase: {
          currentPhase,
          currentPrice,
          endpoints,
        },
        fetchSaleInfo,
      }}
    >
      {children}
    </SaleDataContext.Provider>
  );
};

const useSaleInfo = () => useContext(SaleDataContext);

export { SaleInfoProvider, useSaleInfo };
