import { Warning } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@region-x/components';
import React from 'react';

import { usePurchaseHistory } from '@/hooks';

import { PurchaseHistoryTable } from '@/components/Tables';

import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';

import styles from './index.module.scss';

interface PurchaseHistoryModalProps extends DialogProps {
  onClose: () => void;
}

export const PurchaseHistoryModal = ({ open, onClose }: PurchaseHistoryModalProps) => {
  const theme = useTheme();
  const { network } = useNetwork();
  const {
    saleInfo: { regionBegin },
  } = useSaleInfo();
  const { loading, data, isError } = usePurchaseHistory(network, regionBegin);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' data-cy='purchase-history-modal'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Purchase History
          </Typography>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.primary }}>
            Get an insight into all purchases and renewals made during the current bulk period.
          </Typography>
        </Box>
        {loading || isError ? (
          <Stack alignItems='center' minHeight='10rem' justifyContent='center'>
            {loading ? (
              <CircularProgress />
            ) : (
              <Stack alignItems='center' direction='row' gap='1rem'>
                <Warning color='error' />
                <Typography>Failed to fetch purchase history</Typography>
              </Stack>
            )}
          </Stack>
        ) : (
          <Box className={styles.tableContainer}>
            <PurchaseHistoryTable data={data} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box>
          <Button onClick={onClose} disabled={loading} data-cy='btn-close-purchase-history-modal'>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
