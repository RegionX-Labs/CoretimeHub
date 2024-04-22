import { useInkathon } from '@scio-labs/use-inkathon';
import { useCallback, useEffect, useState } from 'react';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

// React hook for fetching balance.
const useBalance = () => {
  const {
    state: { api, apiState, symbol },
  } = useCoretimeApi();
  const { activeAccount } = useInkathon();

  const [balance, setBalance] = useState(0);

  const { toastWarning } = useToast();

  const fetchBalance = useCallback(async () => {
    if (api && apiState == ApiState.READY && activeAccount) {
      const accountData: any = (
        await api.query.system.account(activeAccount.address)
      ).toHuman();
      const balance = parseFloat(accountData.data.free.toString());
      setBalance(balance);

      if (balance === 0) {
        toastWarning(
          `The selected account does not have any ${symbol} tokens on the Coretime chain.`
        );
      }
    }
  }, [api, apiState, activeAccount, toastWarning, symbol]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return balance;
};

export default useBalance;
