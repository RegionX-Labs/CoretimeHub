import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAccounts } from '../account';
import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';

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
  const { state: coretimeState } = useCoretimeApi();
  const { state: relayState } = useRelayApi();
  const { api: coretimeApi, apiState: coretimeApiState } = coretimeState;
  const { api: relayApi, apiState: relayApiState } = relayState;

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
