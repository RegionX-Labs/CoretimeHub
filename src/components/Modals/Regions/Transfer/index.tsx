import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import {
  transferRegionOnCoretimeChain,
  transferRegionOnRegionXChain,
} from '@/utils/transfers/native';

import { AddressInput, ProgressButton } from '@/components/Elements';
import { RegionOverview } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionLocation, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface TransferModalProps extends DialogProps {
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
  const {
    state: { api: regionxApi },
  } = useRegionXApi();

  const [newOwner, setNewOwner] = useState('');
  const [working, setWorking] = useState(false);

  const onTransfer = () => {
    if (regionMetadata.location === RegionLocation.CORETIME_CHAIN) {
      transferOnCoretimeChain(regionMetadata.region);
    } else if (regionMetadata.location === RegionLocation.REGIONX_CHAIN) {
      transferOnRegionXChain(regionMetadata.region);
    }
  };

  const transferOnRegionXChain = (region: Region) => {
    if (!regionxApi || !activeAccount || !activeSigner) return;

    if (!newOwner) {
      toastError('Please input the new owner.');
      return;
    }

    transferRegionOnRegionXChain(
      regionxApi,
      region,
      activeSigner,
      activeAccount.address,
      newOwner,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo('In Block'),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Successfully transferred the region.');
          onClose();
          fetchRegions();
        },
        fail: () => {
          toastError('Failed to transfer the region.');
        },
        error: (e) => {
          toastError(`Failed to transfer the region. ${e}`);
          setWorking(false);
        },
      }
    );
  };

  const transferOnCoretimeChain = async (region: Region) => {
    if (!activeAccount || !activeSigner) return;
    if (!newOwner) {
      toastError('Please input the new owner.');
      return;
    }

    setWorking(true);
    transferRegionOnCoretimeChain(
      coretimeApi!,
      region,
      activeSigner,
      activeAccount.address,
      newOwner,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo('In Block'),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Successfully transferred the region.');
          onClose();
          fetchRegions();
        },
        fail: () => {
          toastError('Failed to transfer the region.');
        },
        error: (e) => {
          toastError(`Failed to transfer the region. ${e}`);
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
            Here you can transfer your region to a new owner
          </Typography>
        </Box>
        <Box className={styles.content}>
          <RegionOverview regionMetadata={regionMetadata} />
          <Paper
            className={styles.addressContainer}
            sx={{ color: theme.palette.common.black }}
          >
            <Typography sx={{ fontWeight: 500 }}>Transfer to</Typography>
            <Typography></Typography>

            <AddressInput
              label='New owner:'
              address={newOwner}
              onChange={(e) => setNewOwner(e)}
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
