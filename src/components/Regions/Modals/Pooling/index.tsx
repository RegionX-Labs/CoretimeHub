import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Input,
  InputAdornment,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';
import { isValidAddress } from '@/utils/functions';

import { FinalitySelector, ProgressButton } from '@/components/Elements';
import { RegionOverview } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { FinalityType, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface PoolingModalProps extends DialogProps {
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const PoolingModal = ({ open, onClose, regionMetadata }: PoolingModalProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const {
    state: { api, symbol, decimals },
  } = useCoretimeApi();
  const { fetchRegions } = useRegions();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const [finality, setFinality] = useState<FinalityType>(FinalityType.FINAL);
  const [payee, setPayee] = useState<string>('');

  const [working, setWorking] = useState(false);

  const onPool = async () => {
    if (!api || !activeAccount || !activeSigner) return;

    const txPooling = api.tx.broker.pool(
      regionMetadata.region.getOnChainRegionId(), // region id
      activeAccount.address, // payee
      finality
    );

    submitExtrinsicWithFeeInfo(symbol, decimals, txPooling, activeAccount.address, activeSigner, {
      ready: () => {
        setWorking(true);
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Successfully contributed to the instantaneous region pool');
        onClose();
        fetchRegions();
      },
      fail: () => {
        toastError('Failed to contribute to the instantaneous region pool');
      },
      error: () => {
        toastError('Failed to contribute to the instantaneous region pool');
        setWorking(false);
      },
    });
  };

  useEffect(() => {
    if (!open) return;
    setFinality(FinalityType.FINAL);
    setPayee('');
    setWorking(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Task Pooling
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{
              color: theme.palette.text.primary,
              textWrap: 'wrap',
              maxWidth: '35rem',
            }}
          >
            You can contribute your region to the instantaneous coretime pool to earn rewards.
          </Typography>
        </Box>
        <Box className={styles.content}>
          <RegionOverview regionMetadata={regionMetadata} />
        </Box>
        <Paper className={styles.options}>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Contribution options
          </Typography>
          <Box className={styles.optionItem}>
            <Typography className={styles.optionKey}>Finality:</Typography>
            <FinalitySelector {...{ finality, setFinality }} />
          </Box>
          <Alert className={styles.alert} severity='info'>
            Finally pooled regions can no longer be managed. <br />
            They will not be displayed on the Region Management page anymore.
          </Alert>
          <Box className={styles.optionItem}>
            <Typography className={styles.optionKey}>Payee:</Typography>
            <Input
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              fullWidth
              type='text'
              placeholder='Address of the payee'
              endAdornment={
                <InputAdornment position='end'>
                  <Button
                    variant='text'
                    color='info'
                    onClick={() => activeAccount && setPayee(activeAccount.address)}
                  >
                    Me
                  </Button>
                </InputAdornment>
              }
              sx={{ height: '3rem' }}
              error={payee.length > 0 && !isValidAddress(payee)}
            />
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton onClick={onPool} label='Pool' loading={working} />
      </DialogActions>
    </Dialog>
  );
};
