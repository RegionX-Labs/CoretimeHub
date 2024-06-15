import { Warning } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

import { usePurchaseHistory } from '@/hooks';

import { ActionButton } from '@/components/Elements';
import { PurchaseHistoryTable } from '@/components/Tables';

import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';

import styles from './index.module.scss';

interface PurchaseHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export const PurchaseHistoryModal = ({
  open,
  onClose,
}: PurchaseHistoryModalProps) => {
  const theme = useTheme();
  const { network } = useNetwork();
  const {
    saleInfo: { regionBegin },
  } = useSaleInfo();
  const { loading, data, isError } = usePurchaseHistory(
    network,
    regionBegin,
    0,
    1000
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      data-cy='purchase-history-modal'
    >
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Purchase History
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Get an insight into all purchases and renewals made during the
            current bulk period.
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
          <ActionButton
            label='Close'
            onClick={onClose}
            disabled={loading}
            data-cy='btn-close-purchase-history-modal'
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
