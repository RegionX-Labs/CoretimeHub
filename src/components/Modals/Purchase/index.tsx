import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from '@mui/material';
import { useState } from 'react';

import { ListingCard } from '@/components/Elements/ListingCard';

import { useAccounts } from '@/contexts/account';
import { useToast } from '@/contexts/toast';
import { Listing } from '@/models';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  listing: Listing;
}

export const PurchaseModal = ({
  open,
  onClose,
  listing,
}: PurchaseModalProps) => {
  const {
    state: { activeAccount },
  } = useAccounts();

  const { toastError, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);

  const purchaseRegion = async () => {
    if (!activeAccount) {
      return;
    }

    try {
      setWorking(true);

      // TODO:
      toastSuccess(`Successfully purchased region from sale.`);
      onClose();
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to purchase region from sale. Error: ${
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
          <ListingCard listing={listing} readOnly={true} bordered={false} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => purchaseRegion()}
          variant='contained'
          loading={working}
        >
          Purchase from sale
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
