import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { transferRegionOnCoretimeChain } from '@/utils/native/transfer';

import { ProgressButton, SimpleRegionCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionLocation, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const TransferModal = ({
  open,
  onClose,
  regionMetadata,
}: TransferModalProps) => {
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const { fetchRegions } = useRegions();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();

  const [newOwner, setNewOwner] = useState('');
  const [working, setWorking] = useState(false);

  const onTransfer = () => {
    if (regionMetadata.location === RegionLocation.CORETIME_CHAIN) {
      transferCoretimeRegion(regionMetadata.region);
    }
  };

  const transferCoretimeRegion = async (region: Region) => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;
    if (!newOwner) {
      toastError('Please input the new owner.');
      return;
    }

    setWorking(true);
    transferRegionOnCoretimeChain(
      coretimeApi,
      region,
      activeSigner,
      activeAccount.address,
      newOwner,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo(`In Block`),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Successfully transferred the region.');
          onClose();
          fetchRegions();
        },
        error: () => {
          toastError(`Failed to transfer the region.`);
          setWorking(false);
        },
      }
    );
  };

  useEffect(() => {
    setNewOwner('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Transfer Region
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Here you can transfer region to new owner
          </Typography>
        </Box>
        <Box className={styles.content}>
          <SimpleRegionCard regionMetadata={regionMetadata} />
          <Paper
            className={styles.addressContainer}
            sx={{ color: theme.palette.common.black }}
          >
            <Typography sx={{ fontWeight: 500 }}>Transfer to</Typography>
            <Typography>New owner:</Typography>
            <TextField
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              fullWidth
            />
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions className={styles.buttons}>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton
          onClick={onTransfer}
          loading={working}
          label='Transfer'
        />
      </DialogActions>
    </Dialog>
  );
};
