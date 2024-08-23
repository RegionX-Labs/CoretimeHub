import { Warning } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

import { useSaleDetails } from '@/hooks';
import { getBalanceString, getTimeStringShort } from '@/utils/functions';

import { ActionButton, InfoItem } from '@/components/Elements';
import { PurchaseHistoryTable } from '@/components/Tables';

import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { SalesHistoryItem } from '@/models';

import styles from './index.module.scss';

interface SaleDetailsModalProps extends DialogProps {
  onClose: () => void;
  info: SalesHistoryItem;
}

export const SaleDetailsModal = ({ open, onClose, info }: SaleDetailsModalProps) => {
  const theme = useTheme();
  const { network } = useNetwork();
  const {
    state: { decimals, symbol },
  } = useCoretimeApi();
  const {
    saleCycle,
    regionBegin,
    regionEnd,
    startPrice,
    endPrice,
    startTimestamp,
    endTimestamp,
    startBlock,
    endBlock,
  } = info;

  const { loading, data, isError } = useSaleDetails(network, saleCycle);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' data-cy='sale-details-modal'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Coretime Sale#{saleCycle}
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
            <Stack direction='row' justifyContent='space-between'>
              <InfoItem label='Region Begin' value={regionBegin.toLocaleString()} />
              <InfoItem label='Length' value={(regionEnd - regionBegin).toLocaleString()} />
              <InfoItem
                label='Start Price'
                value={getBalanceString(startPrice.toString(), decimals, symbol)}
              />
              <InfoItem
                label='End Price'
                value={getBalanceString(endPrice.toString(), decimals, symbol)}
              />
            </Stack>
            <Stack direction='row' alignItems='center'>
              <Typography sx={{ color: theme.palette.text.primary }}>
                {endTimestamp ? 'Sale Ended' : 'Sale Started'}
              </Typography>
              <Typography
                sx={{
                  color: theme.palette.common.black,
                  fontWeight: 700,
                  ml: '1rem',
                }}
              >
                {endTimestamp
                  ? `${getTimeStringShort(startTimestamp)} ~ ${getTimeStringShort(endTimestamp)}`
                  : getTimeStringShort(startTimestamp)}
              </Typography>
              <Tooltip
                title={`Start Block: ${startBlock.toLocaleString()}${
                  endBlock ? ' End Block: ' + endBlock.toLocaleString() : ''
                }`}
                placement='right'
              >
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Stack>
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
