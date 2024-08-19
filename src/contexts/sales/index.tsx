import React, { createContext, useContext, useEffect, useState } from 'react';

import { getBlockTime, getBlockTimestamp } from '@/utils/functions';
import { getCorePriceAt, getCurrentPhase } from '@/utils/sale';

import {
  BrokerStatus,
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
  status: ContextStatus | undefined;
  saleInfo: SaleInfo | undefined;
  config: SaleConfig | undefined;
  saleStatus: BrokerStatus | undefined;
  phase: SalePhaseInfo | undefined;
  fetchSaleInfo: () => void;
}

const SaleDataContext = createContext<SaleData>({
  config: undefined,
  fetchSaleInfo: () => {
    /** */
  },
  phase: undefined,
  saleInfo: undefined,
  saleStatus: undefined,
  status: undefined,
});

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

  const [saleInfo, setSaleInfo] = useState<SaleInfo | undefined>();
  const [saleStatus, setSaleStatus] = useState<BrokerStatus | undefined>();
  const [config, setConfig] = useState<SaleConfig | undefined>();

  const [status, setStatus] = useState(ContextStatus.UNINITIALIZED);
  const [currentPhase, setCurrentPhase] = useState<SalePhase>(
    SalePhase.Interlude
  );
  const [at, setAt] = useState(0);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const [endpoints, setEndpoints] = useState<PhaseEndpoints>();

  useEffect(() => {
    setSaleStatus(undefined);
    if (!saleInfo) return;
    setAt(currentPhase === SalePhase.Interlude ? saleInfo.saleStart : height);
  }, [saleInfo?.saleStart, height, currentPhase]);

  useEffect(() => {
    if (!saleInfo) return;
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
    if (height === 0 || !saleInfo) return;
    setCurrentPhase(getCurrentPhase(saleInfo, height));
  }, [saleInfo, height]);

  return (
    <SaleDataContext.Provider
      value={{
        status,
        saleInfo,
        config,
        saleStatus,
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
