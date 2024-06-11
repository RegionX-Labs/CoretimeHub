import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { sendTx } from '@/utils/functions';

import {
  Balance,
  CoreDetailsPanel,
  ProgressButton,
  SaleInfoPanel,
  SalePhaseInfoPanel,
} from '@/components';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useBalances } from '@/contexts/balance';
import { useNetwork } from '@/contexts/network';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { ContextStatus, SalePhase } from '@/models';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  TimeAgo.addLocale(en);
  // Create formatter (English).

  const {
    state: { activeSigner, activeAccount },
  } = useAccounts();
  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();

  const {
    saleInfo,
    status,
    phase: { currentPhase, currentPrice },
  } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const router = useRouter();
  const { network } = useNetwork();

  const { fetchRegions } = useRegions();

  const { balance } = useBalances();

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    if (currentPhase === SalePhase.Interlude) {
      toastWarning(
        'Sales start after the interlude period ends. Purchases can then be made.'
      );
      return;
    }

    const txPurchase = api.tx.broker.purchase(currentPrice);

    setWorking(true);
    sendTx(txPurchase, activeAccount.address, activeSigner, {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo(`In Block`),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Transaction successful');
        fetchRegions();
      },
      error: () => {
        toastError(`Failed to purchase a region`);
        setWorking(false);
      },
    });
  };

  const onManage = () => {
    router.push({
      pathname: '/regions',
      query: { network },
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Purchase a core
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Buy a core straight from the Coretime chain
          </Typography>
        </Box>
        <Balance
          coretimeBalance={balance.coretime}
          relayBalance={balance.relay}
        />
      </Box>
      <Box>
        {status !== ContextStatus.LOADED ? (
          <Backdrop open data-cy='loading'>
            <CircularProgress />
          </Backdrop>
        ) : (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <SaleInfoPanel />
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <CoreDetailsPanel saleInfo={saleInfo} />
              <SalePhaseInfoPanel />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'space-between',
              }}
            >
              <Button
                size='small'
                variant='outlined'
                sx={{
                  bgcolor: theme.palette.common.white,
                  padding: '0.5rem 0.75rem',
                  borderRadius: 100,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
                onClick={onManage}
              >
                Manage your regions
              </Button>
              <ProgressButton
                onClick={purchase}
                loading={working}
                label='Purchase Core'
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
