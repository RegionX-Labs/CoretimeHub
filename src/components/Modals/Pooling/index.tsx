import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  InputAdornment,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { isValidAddress } from '@/utils/functions';

import {
  FinalitySelector,
  ProgressButton,
  SimpleRegionCard,
} from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { FinalityType, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface PoolingModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const PoolingModal = ({
  open,
  onClose,
  regionMetadata,
}: PoolingModalProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { fetchRegions } = useRegions();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [finality, setFinality] = useState<FinalityType>(FinalityType.FINAL);
  const [payee, setPayee] = useState<string>('');

  const [working, setWorking] = useState(false);

  const onPool = async () => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;

    const txPooling = coretimeApi.tx.broker.pool(
      regionMetadata.region.getOnChainRegionId(), // region id
      activeAccount.address, // payee
      finality
    );

    try {
      setWorking(true);
      await txPooling.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess(
                  'Successfully contributed to the instantaneous region pool'
                );
                onClose();
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(
                  `Failed to contribute to the instantaneous region pool`
                );
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to contribute to the instantaneous region pool ${e}`);
      setWorking(false);
    }
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
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Task Pooling
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            You can contribute your region to the pool of instantaneous regions
          </Typography>
        </Box>
        <Box className={styles.content}>
          <SimpleRegionCard regionMetadata={regionMetadata} />
        </Box>
        <Paper className={styles.options}>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Contribution options
          </Typography>
          <Box className={styles.optionItem}>
            <Typography className={styles.optionKey}>Finality:</Typography>
            <FinalitySelector {...{ finality, setFinality }} />
          </Box>
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
                    onClick={() =>
                      activeAccount && setPayee(activeAccount.address)
                    }
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
