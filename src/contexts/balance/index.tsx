import React, { createContext, useContext, useEffect, useState } from 'react';

import { enableRegionX } from '@/utils/functions';

import { useAccounts } from '../account';
import { useCoretimeApi, useRegionXApi, useRelayApi } from '../apis';
import { useNetwork } from '../network';

interface Props {
  children: React.ReactNode;
}

interface BalanceData {
  balance: {
    coretime: number;
    relay: number;
    rxNativeBalance: number;
    rxRcCurrencyBalance: number;
  };
}

const defaultBalanceData: BalanceData = {
  balance: {
    coretime: 0,
    relay: 0,
    rxNativeBalance: 0,
    rxRcCurrencyBalance: 0,
  },
};

const BalanceContext = createContext<BalanceData>(defaultBalanceData);

const BalanceProvider = ({ children }: Props) => {
  const { network } = useNetwork();
  const {
    state: { activeAccount },
  } = useAccounts();
  const {
    state: { api: coretimeApi, isApiReady: isCoretimeReady },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, isApiReady: isRelayReady },
  } = useRelayApi();
  const {
    state: { api: regionxApi, isApiReady: isRegionXReady },
  } = useRegionXApi();

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);
  const [rxNativeBalance, setRxNativeBalance] = useState(0);
  const [rxRcCurrencyBalance, setRxCurrencyBalance] = useState(0);

  useEffect(() => {
    let unsubscribeCoretime: any = null;
    let unsubscribeRelay: any = null;
    let unsubscribeRegionx: any = null;

    const subscribeBalances = async () => {
      try {
        if (!activeAccount) {
          setCoretimeBalance(0);
          setRelayBalance(0);
          setRxNativeBalance(0);
          setRxCurrencyBalance(0);
          return;
        }

        if (!isCoretimeReady || !isRelayReady || !coretimeApi || !relayApi) return;

        const { address } = activeAccount;

        // Coretime subscription
        unsubscribeCoretime = await coretimeApi.queryMulti(
          [[coretimeApi.query.system.account, address]],
          ([
            {
              data: { free },
            },
          ]: [any]) => {
            setCoretimeBalance(free as number);
          }
        );

        // Relay subscription
        unsubscribeRelay = await relayApi.queryMulti(
          [[relayApi.query.system.account, address]],
          ([
            {
              data: { free },
            },
          ]: [any]) => {
            setRelayBalance(free as number);
          }
        );

        // RegionX subscription (optional)
        if (enableRegionX(network)) {
          if (!regionxApi || !isRegionXReady) return;
          unsubscribeRegionx = await regionxApi.queryMulti(
            [
              [regionxApi.query.system?.account, address],
              [regionxApi.query.tokens?.accounts, [address, 1]], // RELAY_ASSET_ID
            ],
            ([
              {
                data: { free: freeNative },
              },
              { free: freeRelayCurrency },
            ]: any) => {
              setRxNativeBalance(freeNative.toJSON() as number);
              setRxCurrencyBalance(freeRelayCurrency.toJSON() as number);
            }
          );
        }
      } catch (error) {
        /** */
      }
    };

    subscribeBalances();

    // Cleanup function to unsubscribe
    return () => {
      if (unsubscribeCoretime) unsubscribeCoretime();
      if (unsubscribeRelay) unsubscribeRelay();
      if (unsubscribeRegionx) unsubscribeRegionx();
    };
  }, [
    activeAccount,
    coretimeApi,
    isCoretimeReady,
    relayApi,
    isRelayReady,
    regionxApi,
    isRegionXReady,
    network,
  ]);

  return (
    <BalanceContext.Provider
      value={{
        balance: {
          coretime: coretimeBalance,
          relay: relayBalance,
          rxRcCurrencyBalance,
          rxNativeBalance,
        },
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

const useBalances = () => useContext(BalanceContext);

export { BalanceProvider, useBalances };
