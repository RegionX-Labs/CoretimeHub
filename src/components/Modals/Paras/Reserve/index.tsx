import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { getBalanceString, sendTx } from '@/utils/functions';

import { ProgressButton } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import styles from './index.module.scss';

interface ReserveModalProps {
  open: boolean;
  onClose: () => void;
  paraId: number;
  reservationCost: string;
}

export const ReserveModal = ({
  open,
  onClose,
  paraId,
  reservationCost,
}: ReserveModalProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api, apiState, decimals, symbol },
  } = useRelayApi();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);

  const onReserve = async () => {
    if (!api || apiState !== ApiState.READY) {
      toastError('Please check the connection to the relay chain');
      return;
    }
    if (!activeAccount || !activeSigner) {
      toastError('Please connect your wallet');
      return;
    }
    const txReserve = api.tx.registrar.reserve();
    setWorking(true);
    sendTx(txReserve, activeAccount.address, activeSigner, {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Reservation success');
        onClose();
      },
      fail: () => {
        toastError('Failed to reserve a parathread');
      },
      error: () => {
        toastError('Failed to reserve a parathread');
        setWorking(false);
      },
    });
  };

  const items = [
    {
      label: 'Next parald available to reserve:',
      value: paraId,
    },
    {
      label: 'Reservation cost:',
      value: getBalanceString(reservationCost, decimals, symbol),
    },
  ];

  return (
    <Dialog {...{ open, onClose }}>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Reserve Para ID
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Reserve your Para ID for the future
          </Typography>
        </Box>
        <Box className={styles.info}>
          {items.map(({ label, value }, index) => (
            <Paper className={styles.infoItem} key={index}>
              <Typography className={styles.itemKey}>{label}</Typography>
              <Typography
                sx={{ color: theme.palette.common.black }}
                className={styles.itemValue}
              >
                {value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton onClick={onReserve} label='Reserve' loading={working} />
      </DialogActions>
    </Dialog>
  );
};
