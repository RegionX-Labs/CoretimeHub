import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { transferRegionOnCoretimeChain } from '@/utils/native/transfer';

import { RegionCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionLocation, RegionMetadata } from '@/models';

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
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionCard regionMetadata={regionMetadata} bordered={false} />
          <Stack direction='column' gap={1} alignItems='center'>
            <Typography>Transfer to</Typography>
            <ArrowDownwardOutlinedIcon />
          </Stack>
          <Stack direction='column' gap={2}>
            <Typography>New owner:</Typography>
            <TextField
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={onTransfer}
          variant='contained'
          loading={working}
        >
          Transfer
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
