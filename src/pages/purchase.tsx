import { LoadingButton } from '@mui/lab';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Link from 'next/link';
import { useState } from 'react';

import { formatBalance } from '@/utils/functions';

import { Progress, SaleInfoGrid } from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';

import useBalance from '@/components/Hooks/balance';
import useSalePhase from '@/components/Hooks/salePhase';
import useSalePrice from '@/components/Hooks/salePrice';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const { activeSigner, activeAccount } = useInkathon();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState, symbol },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const balance = useBalance();
  const currentPrice = useSalePrice();
  const { currentPhase, progress, saleEnd, saleEndTimestamp, saleSections } =
    useSalePhase();

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    const txPurchase = api.tx.broker.purchase(currentPrice);

    try {
      setWorking(true);
      await txPurchase.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Transaction successful');
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to purchase the region`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to purchase the region. ${e}`);
      setWorking(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
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
            Purchase a core directly from the Coretime chain
          </Typography>
        </Box>
        <Typography variant='h6' sx={{ color: theme.palette.text.primary }}>
          {`Your balance: ${formatBalance(balance.toString(), false)} ${symbol}`}
        </Typography>
      </Box>
      <Box>
        {loading ||
        !currentPhase ||
        !saleEnd ||
        !progress ||
        !saleEndTimestamp ? (
          <>
            <Typography variant='h5' align='center'>
              Connect your wallet
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <SaleInfoGrid
                currentPhase={currentPhase}
                currentPrice={currentPrice}
                saleInfo={saleInfo}
                saleEnd={saleEnd}
              />
            </Box>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h6'>Current Bulk Sale:</Typography>
                <Typography>Ends {timeAgo.format(saleEndTimestamp)}</Typography>
              </Box>
              <Box sx={{ marginTop: '1em' }}>
                <Progress progress={progress} sections={saleSections} />
              </Box>
            </Box>
            <Box
              sx={{
                marginTop: '4em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Link href='/regions'>
                <Button variant='outlined'>Manage your regions</Button>
              </Link>
              <LoadingButton
                onClick={purchase}
                variant='contained'
                loading={working}
              >
                Purchase
              </LoadingButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
