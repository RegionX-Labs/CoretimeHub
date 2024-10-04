import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@region-x/components';
import { useState } from 'react';

import { useParasInfo } from '@/hooks';
import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';
import { getBalanceString } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';

import styles from './index.module.scss';

interface ReserveModalProps extends DialogProps {
  onClose: () => void;
  paraId: number;
  reservationCost: string;
}

export const ReserveModal = ({ open, onClose, paraId, reservationCost }: ReserveModalProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api, apiState, decimals, symbol },
  } = useRelayApi();
  const { fetchParaStates } = useParasInfo();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

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

    submitExtrinsicWithFeeInfo(symbol, decimals, txReserve, activeAccount.address, activeSigner, {
      ready: () => {
        setWorking(true);
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Reservation success');
        fetchParaStates();
        onClose();
      },
      fail: () => {
        toastError('Failed to reserve a parathread');
      },
      error: (e) => {
        toastError(`Failed to reserve a parathread ${e}`);
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
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Reserve Para ID
          </Typography>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.primary }}>
            Reserve your Para ID for the future
          </Typography>
        </Box>
        <Box className={styles.info}>
          {items.map(({ label, value }, index) => (
            <Paper className={styles.infoItem} key={index}>
              <Typography className={styles.itemKey}>{label}</Typography>
              <Typography sx={{ color: theme.palette.common.black }} className={styles.itemValue}>
                {value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='dark'>
          Cancel
        </Button>

        <Button onClick={onReserve} loading={working}>
          Reserve
        </Button>
      </DialogActions>
    </Dialog>
  );
};
