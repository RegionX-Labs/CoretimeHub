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

import { useAccountExtrinsics } from '@/hooks';

import { ActionButton } from '@/components/Elements';
import { TxHistoryTable } from '@/components/Tables';

import { useNetwork } from '@/contexts/network';
import { Address } from '@/models';

import styles from './index.module.scss';

interface TxHistoryModalProps extends DialogProps {
  onClose: () => void;
  account: Address;
}

export const TxHistoryModal = ({
  open,
  onClose,
  account,
}: TxHistoryModalProps) => {
  const theme = useTheme();

  const { network } = useNetwork();
  const { loading, isError, data } = useAccountExtrinsics(network, account);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Transaction History
          </Typography>
        </Box>
        {loading || isError ? (
          <Stack alignItems='center' minHeight='10rem' justifyContent='center'>
            {loading ? (
              <CircularProgress />
            ) : (
              <Stack alignItems='center' direction='row' gap='1rem'>
                <Warning color='error' />
                <Typography>Failed to fetch transaction history</Typography>
              </Stack>
            )}
          </Stack>
        ) : (
          <Box className={styles.tableContainer}>
            <TxHistoryTable data={data} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box>
          <ActionButton label='Close' onClick={onClose} disabled={loading} />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
