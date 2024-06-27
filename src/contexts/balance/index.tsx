import React, { createContext, useContext, useEffect, useState } from 'react';

import { EXPERIMENTAL } from '@/consts';
import { NetworkType } from '@/models';

import { useAccounts } from '../account';
import { useCoretimeApi, useRegionXApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';
import { useNetwork } from '../network';

interface Props {
  children: React.ReactNode;
}

interface BalanceData {
  balance: {
    coretime: number;
    relay: number;
    regionxRcCurrencyBalance: number;
  };
}

const defaultBalanceData: BalanceData = {
  balance: {
    coretime: 0,
    relay: 0,
    regionxRcCurrencyBalance: 0,
  },
};

const BalanceContext = createContext<BalanceData>(defaultBalanceData);

const BalanceProvider = ({ children }: Props) => {
  const { network } = useNetwork();
  const {
    state: { activeAccount },
  } = useAccounts();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: regionxApi, apiState: regionxApiState },
  } = useRegionXApi();

  const enableRegionx = network === NetworkType.ROCOCO || EXPERIMENTAL;

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);
  const [regionxBalance, setRegionxBalance] = useState(0);

  useEffect(() => {
    const subscribeBalances = async () => {
      if (!activeAccount) {
        setCoretimeBalance(0);
        setRelayBalance(0);
        setRegionxBalance(0);
        return;
      }
      if (
        coretimeApiState !== ApiState.READY ||
        relayApiState !== ApiState.READY ||
        !coretimeApi ||
        !relayApi
      )
        return;

      const { address } = activeAccount;
      const unsubscribeCoretime = await coretimeApi.queryMulti(
        [[coretimeApi.query.system.account, address]],
        ([
          {
            data: { free },
          },
        ]: [any]) => {
          setCoretimeBalance(free as number);
        }
      );

      const unsubscribeRelay = await relayApi.queryMulti(
        [[relayApi.query.system.account, address]],
        ([
          {
            data: { free },
          },
        ]: [any]) => {
          setRelayBalance(free as number);
        }
      );
      let unsubscribeRegionx = null;

      if (enableRegionx) {
        if (!regionxApi || regionxApiState !== ApiState.READY) return;
        unsubscribeRegionx = await regionxApi.queryMulti(
          [[regionxApi.query.tokens.accounts, [address, 1]]], // RELAY_ASSET_ID
          ([{ free }]: [any]) => {
            setRegionxBalance(free.toJSON() as number);
          }
        );
      }

      return () => {
        unsubscribeCoretime();
        unsubscribeRelay();
        if (unsubscribeRegionx) unsubscribeRegionx();
      };
    };
    subscribeBalances();
  }, [
    activeAccount,
    coretimeApi,
    coretimeApiState,
    relayApi,
    relayApiState,
    regionxApi,
    regionxApiState,
    enableRegionx,
  ]);

  return (
    <BalanceContext.Provider
      value={{
        balance: {
          coretime: coretimeBalance,
          relay: relayBalance,
          regionxRcCurrencyBalance: regionxBalance,
        },
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

const useBalances = () => useContext(BalanceContext);

export { BalanceProvider, useBalances };
