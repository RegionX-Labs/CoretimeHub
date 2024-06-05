import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAccounts } from '../account';
import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';
import { useToast } from '../toast';

interface Props {
  children: React.ReactNode;
}

interface BalanceData {
  balance: {
    coretime: number;
    relay: number;
  };
}

const defaultBalanceData: BalanceData = {
  balance: {
    coretime: 0,
    relay: 0,
  },
};

const BalanceContext = createContext<BalanceData>(defaultBalanceData);

const BalanceProvider = ({ children }: Props) => {
  const {
    state: { activeAccount },
  } = useAccounts();
  const { toastWarning } = useToast();
  const {
    state: {
      api: coretimeApi,
      apiState: coretimeApiState,
      symbol: coretimeSymbol,
      name: coretimeChain,
    },
  } = useCoretimeApi();
  const {
    state: {
      api: relayApi,
      apiState: relayApiState,
      symbol: relaySymbol,
      name: relayChain,
    },
  } = useRelayApi();

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);

  useEffect(() => {
    const subscribeBalances = async () => {
      if (
        coretimeApiState !== ApiState.READY ||
        relayApiState !== ApiState.READY ||
        !coretimeApi ||
        !relayApi
      )
        return;

      if (!activeAccount) {
        setCoretimeBalance(0);
        setRelayBalance(0);
        return;
      }

      const { address } = activeAccount;
      const unsubscribeCoretime = await coretimeApi.queryMulti(
        [[coretimeApi.query.system.account, address]],
        ([
          {
            data: { free },
          },
        ]: [any]) => {
          setCoretimeBalance(free as number);
          free === 0 &&
            toastWarning(
              `The selected account does not have any ${coretimeSymbol} tokens on ${coretimeChain}.`
            );
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
          free === 0 &&
            toastWarning(
              `The selected account does not have any ${relaySymbol} tokens on ${relayChain}.`
            );
        }
      );
      return () => {
        unsubscribeCoretime();
        unsubscribeRelay();
      };
    };
    subscribeBalances();
  }, [activeAccount, coretimeApi, coretimeApiState, relayApi, relayApiState]);

  return (
    <BalanceContext.Provider
      value={{
        balance: {
          coretime: coretimeBalance,
          relay: relayBalance,
        },
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

const useBalances = () => useContext(BalanceContext);

export { BalanceProvider, useBalances };
