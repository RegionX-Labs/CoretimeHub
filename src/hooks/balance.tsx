import { useInkathon } from '@scio-labs/use-inkathon';
import { useCallback, useEffect, useState } from 'react';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';
import { ApiPromise } from '@polkadot/api';
import { parseHNString } from '@/utils/functions';

// React hook for fetching balance.
const useBalance = () => {
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const { state: { api: relayApi, apiState: relayApiState } } = useRelayApi();

  const { activeAccount } = useInkathon();

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);

  const { toastWarning } = useToast();

  const fetchBalance = useCallback(async (api: ApiPromise): Promise<number | undefined> => {
    if (!activeAccount) return;

    const accountData: any = (
      await api.query.system.account(activeAccount.address)
    ).toHuman();
    const balance = parseHNString(accountData.data.free.toString());

    return balance;
  }, [activeAccount, toastWarning, symbol]);

  useEffect(() => {
    if (coretimeApi && coretimeApiState == ApiState.READY) {
      fetchBalance(coretimeApi).then((balance) => {
        balance !== undefined && setCoretimeBalance(balance);
        balance === 0 && toastWarning(`The selected account does not have any ${symbol} tokens on the Coretime chain.`)
      });
    }
    if (relayApi && relayApiState == ApiState.READY) {
      fetchBalance(relayApi).then((balance) => {
        balance !== undefined && setRelayBalance(balance);
      })
    }

  }, [fetchBalance, coretimeApi, coretimeApiState, relayApi, relayApiState]);

  return { coretimeBalance, relayBalance };
};

export default useBalance;
