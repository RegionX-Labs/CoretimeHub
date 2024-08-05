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
import React from 'react';

import { useSaleDetails } from '@/hooks';

import { ActionButton } from '@/components/Elements';
import { PurchaseHistoryTable } from '@/components/Tables';

import { useNetwork } from '@/contexts/network';

import styles from './index.module.scss';

interface SaleDetailsModalProps extends DialogProps {
  onClose: () => void;
  saleCycle: number;
}

export const SaleDetailsModal = ({
  open,
  onClose,
  saleCycle,
}: SaleDetailsModalProps) => {
  const theme = useTheme();
  const { network } = useNetwork();
  const { loading, data, isError } = useSaleDetails(network, saleCycle);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      data-cy='sale-details-modal'
    >
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Sale Details
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
            data-cy='btn-close-sale-details-modal'
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
