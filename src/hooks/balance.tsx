import { ApiPromise } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

// React hook for fetching balance.
const useBalance = () => {
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const {
    state: { activeAccount },
  } = useAccounts();

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);

  const { toastWarning } = useToast();

  const fetchBalance = useCallback(
    async (api: ApiPromise): Promise<number | undefined> => {
      if (!activeAccount) {
        setCoretimeBalance(0);
        setRelayBalance(0);
        return;
      }

      const accountData: any = (
        await api.query.system.account(activeAccount.address)
      ).toHuman();
      const balance = parseHNString(accountData.data.free.toString());

      return balance;
    },
    [activeAccount]
  );

  const fetchBalances = useCallback(() => {
    if (coretimeApi && coretimeApiState == ApiState.READY) {
      fetchBalance(coretimeApi).then((balance) => {
        balance !== undefined && setCoretimeBalance(balance);
        balance === 0 &&
          toastWarning(
            `The selected account does not have any ${symbol} tokens on the Coretime chain.`
          );
      });
    }
    if (relayApi && relayApiState == ApiState.READY) {
      fetchBalance(relayApi).then((balance) => {
        balance !== undefined && setRelayBalance(balance);
      });
    }
  }, [
    fetchBalance,
    toastWarning,
    symbol,
    coretimeApi,
    coretimeApiState,
    relayApi,
    relayApiState,
  ]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { coretimeBalance, relayBalance, fetchBalances };
};

export default useBalance;
