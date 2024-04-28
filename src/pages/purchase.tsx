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
import Link from 'next/link';
import { useEffect, useState } from 'react';

import useSalePhase from '@/hooks/salePhase';
import useSalePrice from '@/hooks/salePrice';
import { getBlockTimestamp, parseHNString, sendTx } from '@/utils/functions';

import { CoreDetailsPanel, ProgressButton, SaleInfoPanel } from '@/components';
import Balance from '@/components/Elements/Balance';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useBalances } from '@/contexts/balance';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { SalePhase } from '@/models';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  const [at, setAt] = useState<number | undefined>(undefined);
  TimeAgo.addLocale(en);
  // Create formatter (English).

  const {
    state: { activeSigner, activeAccount },
  } = useAccounts();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState, symbol },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const { balance } = useBalances();
  const currentPrice = useSalePrice({ at });
  const {
    saleStart,
    currentPhase,
    progress,
    saleStartTimestamp,
    saleEndTimestamp,
    loading: loadingSalePhase,
  } = useSalePhase();

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;

    api.query.system.number().then((height) => {
      if (currentPhase === SalePhase.Interlude) {
        console.log(saleStart);
        setAt(saleStart);
      } else {
        setAt(parseHNString(height.toHuman() as string));
      }
    });
  }, [saleStart, currentPhase]);

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    const txPurchase = api.tx.broker.purchase(currentPrice);

    sendTx(txPurchase, activeAccount.address, activeSigner, {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo(`In Block`),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Transaction successful');
        fetchRegions();
      },
      error: () => {
        toastError(`Failed to purchase the region`);
      },
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
          symbol={symbol}
        />
      </Box>
      <Box>
        {loading || loadingSalePhase ? (
          <Backdrop open>
            <CircularProgress />
          </Backdrop>
        ) : !currentPhase ||
          !progress ||
          !saleStartTimestamp ||
          !saleEndTimestamp ? (
          <>
            <Typography variant='h5' align='center'>
              Check your network conection and connect your wallet
            </Typography>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SaleInfoPanel
              currentPhase={currentPhase}
              currentPrice={currentPrice}
              saleInfo={saleInfo}
              saleStartTimestamp={saleStartTimestamp}
              saleEndTimestamp={saleEndTimestamp}
            />
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <CoreDetailsPanel saleInfo={saleInfo} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <Link href='/regions'>
                <Button variant='outlined'>Manage your regions</Button>
              </Link>
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
