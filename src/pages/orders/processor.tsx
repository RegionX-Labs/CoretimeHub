import {
  Backdrop,
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useProcessedOrders } from '@/hooks/order';
import { enableRegionX } from '@/utils/functions';

import { OrderProcessorTable } from '@/components';

import { useRegionXApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';

const OrderProcessor = () => {
  const theme = useTheme();
  const router = useRouter();

  const { network } = useNetwork();
  const {
    state: { apiState },
  } = useRegionXApi();

  const { data: processedOrderData, loading: loadingProcessedOrders } =
    useProcessedOrders();

  useEffect(() => {
    if (!enableRegionX(network)) {
      router.push('/');
    }
  }, [network, router]);

  return apiState !== ApiState.READY || loadingProcessedOrders ? (
    <Backdrop open>
      <CircularProgress data-cy='loading' />
    </Backdrop>
  ) : (
    <Stack direction='column' gap='1.5rem'>
      <Card sx={{ padding: '1.5rem' }} data-cy='purchase-history-table'>
        <Stack direction='column' gap='1rem'>
          <Box>
            <Typography
              variant='subtitle1'
              sx={{ color: theme.palette.common.black }}
            >
              Order Processor UI
            </Typography>
            <Typography
              variant='subtitle2'
              sx={{ color: theme.palette.text.primary }}
            >
              See all the orders that were fulfilled
            </Typography>
          </Box>
          <OrderProcessorTable data={processedOrderData} />
        </Stack>
      </Card>
    </Stack>
  );
};

export default OrderProcessor;
