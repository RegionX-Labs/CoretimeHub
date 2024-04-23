import { Box, Button, Typography, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Link from 'next/link';
import { useState } from 'react';

import useBalance from '@/hooks/balance';
import useSalePhase from '@/hooks/salePhase';
import useSalePrice from '@/hooks/salePrice';
import { formatBalance, sendTx } from '@/utils/functions';

import { CoreDetailsPanel, ProgressButton, SaleInfoPanel } from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import Balance from '@/components/Elements/Balance';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  TimeAgo.addLocale(en);
  // Create formatter (English).

  const { activeSigner, activeAccount } = useInkathon();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState, symbol },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const { coretimeBalance, relayBalance } = useBalance();
  const currentPrice = useSalePrice();
  const { currentPhase, progress, saleStartTimestamp, saleEndTimestamp } =
    useSalePhase();

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
        <Balance coretimeBalance={coretimeBalance} relayBalance={relayBalance} symbol={symbol} />
      </Box >
      <Box>
        {loading ||
          !currentPhase ||
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
                justifyContent: 'space-between',
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
    </Box >
  );
};

export default Purchase;
