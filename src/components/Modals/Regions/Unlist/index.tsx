import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from '@mui/material';
import { Region } from 'coretime-utils';
import { useState } from 'react';

import { RegionMetaCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useMarket } from '@/contexts/market';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionMetadata } from '@/models';

interface UnlistModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const UnlistModal = ({
  open,
  onClose,
  regionMetadata,
}: UnlistModalProps) => {
  const {
    state: { activeAccount },
  } = useAccounts();

  const { fetchRegions } = useRegions();
  const { fetchMarket } = useMarket();
  const { toastError, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);

  const unlistRegion = async (_region: Region) => {
    if (!activeAccount) {
      return;
    }

    try {
      setWorking(true);

      // TODO

      toastSuccess(`Successfully unlisted region from sale.`);
      onClose();
      fetchRegions();
      fetchMarket();
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to unlist region from sale. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionMetaCard regionMetadata={regionMetadata} bordered={false} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => unlistRegion(regionMetadata.region)}
          variant='contained'
          loading={working}
        >
          Unlist from sale
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
