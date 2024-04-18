import { Typography, useTheme } from '@mui/material';
import { formatBalance, parseHNString } from '@/utils/functions';
import { useCallback, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useToast } from '@/contexts/toast';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';

const Balance = () => {
  const theme = useTheme();

  const { activeAccount } = useInkathon();
  const [coretimeBalance, setCoretimeBalance] = useState<number>(0);
  const [relayBalance, setRelayBalance] = useState<number>(0);
  const { toastWarning } = useToast();

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const fetchBalance = useCallback(
    async (
      relayApi: ApiPromise,
      coretimeApi: ApiPromise,
      activeAccount: InjectedAccount
    ) => {
      const coretimeAccount = (
        await coretimeApi.query.system.account(activeAccount.address)
      ).toHuman() as any;
      const relayAccount = (
        await relayApi.query.system.account(activeAccount.address)
      ).toHuman() as any;

      const ctBalance = parseHNString(coretimeAccount.data.free.toString());
      const rcBalance = parseHNString(relayAccount.data.free.toString());
      setCoretimeBalance(ctBalance);
      setRelayBalance(rcBalance);

      if (ctBalance == 0) {
        toastWarning(
          'The selected account does not have any ROC tokens on the Coretime chain.'
        );
      }
    },
    [toastWarning]
  );

  useEffect(() => {
    if (
      !relayApi ||
      relayApiState !== ApiState.READY ||
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !activeAccount
    )
      return;

    fetchBalance(relayApi, coretimeApi, activeAccount);
  }, [
    relayApi,
    relayApiState,
    coretimeApi,
    coretimeApiState,
    activeAccount,
    fetchBalance,
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Relay chain: ${formatBalance(relayBalance.toString(), false)} ROC`}
      </Typography>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Coretime chain: ${formatBalance(coretimeBalance.toString(), false)} ROC`}
      </Typography>
    </div>
  );
};

export default Balance;
