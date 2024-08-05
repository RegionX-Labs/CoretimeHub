import {
  Backdrop,
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { useSalesHistory } from '@/hooks';

import { SalesHistoryTable } from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { ContextStatus } from '@/models';

const Home = () => {
  const theme = useTheme();

  const { network } = useNetwork();
  const {
    state: { apiState },
  } = useCoretimeApi();
  const { status } = useSaleInfo();

  const { data: salesHistoryData, loading: loadingPurchaseHistory } =
    useSalesHistory(network);

  return status !== ContextStatus.LOADED ||
    apiState !== ApiState.READY ||
    loadingPurchaseHistory ? (
    <Backdrop open>
      <CircularProgress data-cy='loading' />
    </Backdrop>
  ) : (
    <Stack direction='column' gap='1.5rem'>
      {status === ContextStatus.LOADED && (
        <Card sx={{ padding: '1.5rem' }} data-cy='purchase-history-table'>
          <Stack direction='column' gap='1rem'>
            <Box>
              <Typography
                variant='subtitle1'
                sx={{ color: theme.palette.common.black }}
              >
                Historical sales
              </Typography>
              <Typography
                variant='subtitle2'
                sx={{ color: theme.palette.text.primary }}
              >
                Shows the full sale history
              </Typography>
            </Box>
            <SalesHistoryTable data={salesHistoryData} />
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default Home;
