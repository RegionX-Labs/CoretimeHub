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
import { useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { RegionCard } from '@/components/elements';

import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { OnChainRegionId, RegionMetadata, RegionOrigin } from '@/models';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  region: RegionMetadata;
}

export const TransferModal = ({
  open,
  onClose,
  region,
}: TransferModalProps) => {
  const { activeAccount, activeSigner } = useInkathon();

  const { fetchRegions } = useRegions();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();

  const [newOwner, setNewOwner] = useState('');
  const [working, setWorking] = useState(false);

  const onTransfer = () => {
    if (region.origin === RegionOrigin.CORETIME_CHAIN) {
      transferCoretimeRegion(region.rawId);
    }
  };

  const transferCoretimeRegion = async (regionId: OnChainRegionId) => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;
    if (!newOwner) {
      toastError('Please input the new owner.');
      return;
    }
    const txTransfer = coretimeApi.tx.broker.transfer(regionId, newOwner);

    try {
      setWorking(true);
      await txTransfer.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated.');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Successfully transferred the region.');
                onClose();
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to transfer the region.`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to transfer the region. ${e}`);
      setWorking(false);
    }
  };

  useEffect(() => {
    setNewOwner('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionCard region={region} />
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
