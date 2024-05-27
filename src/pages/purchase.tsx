import {
  Backdrop,
  Box,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { useEffect, useState } from 'react';

import useSalePhase from '@/hooks/salePhase';
import useSalePrice from '@/hooks/salePrice';
import { parseHNString, sendTx } from '@/utils/functions';

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
  const { saleStartTimestamp, saleEndTimestamp } = useSalePhase();
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const { balance } = useBalances();
  const currentPrice = useSalePrice(at);
  const {
    saleStart,
    currentPhase,
    loading: loadingSalePhase,
    endpoints,
  } = useSalePhase();

  useEffect(() => {
    if (!currentPhase) return;

    // If the sale hasn't started yet, get the price from when the sale begins.
    if (currentPhase === SalePhase.Interlude) {
      setAt(saleStart);
    } else {
      if (!api || apiState !== ApiState.READY) return;
      api.query.system.number().then((height) => {
        setAt(parseHNString(height.toHuman() as string));
      });
    }
  }, [api, apiState, saleStart, currentPhase]);

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

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
        />
      </Box>
      <Box>
        {loading || loadingSalePhase ? (
          <Backdrop open>
            <CircularProgress />
          </Backdrop>
        ) : !currentPhase ? (
          <>
            <Typography variant='h5' align='center'>
              Check your network conection and connect your wallet
            </Typography>
          </>
        ) : (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <SaleInfoPanel
              currentPhase={currentPhase}
              saleStartTimestamp={saleStartTimestamp}
              saleEndTimestamp={saleEndTimestamp}
              floorPrice={saleInfo.price}
              currentPrice={currentPrice}
            />
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <CoreDetailsPanel saleInfo={saleInfo} />
              {endpoints && (
                <SalePhaseInfoPanel
                  {...{
                    currentPhase,
                    endpoints,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <ProgressButton
                onClick={purchase}
                loading={working}
                label='Purchase Core'
                disabled={currentPhase === SalePhase.Interlude}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
