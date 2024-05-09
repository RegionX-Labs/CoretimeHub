import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { AmountInput, RecipientInput, RegionCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionMetadata } from '@/models';

interface SellModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const SellModal = ({
  open,
  onClose,
  regionMetadata,
}: SellModalProps) => {
  const {
    state: { activeAccount },
  } = useAccounts();
  const {
    state: { symbol },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();
  const { toastError, toastSuccess } = useToast();

  const [regionPrice, setRegionPrice] = useState('');
  const [saleRecipient, setSaleRecipient] = useState<string>('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (activeAccount) {
      setSaleRecipient(activeAccount.address);
    }
  }, [activeAccount]);

  const listOnSale = async () => {
    await approveXcRegion(regionMetadata.region);
    await listRegion(regionMetadata.region);
  };

  const approveXcRegion = async (_region: Region) => {
    if (!activeAccount) {
      return;
    }

    try {
      setWorking(true);

      // TODO:

      toastSuccess(`Successfully approved region to the market.`);
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to approve the region. Error: ${
          e.errorMessage === 'Error' ? 'Please check your balance.' : e
        }`
      );
      setWorking(false);
    }
  };

  const listRegion = async (_region: Region) => {
    if (!activeAccount) {
      return;
    }

    try {
      setWorking(true);

      // TODO

      toastSuccess(`Successfully listed region on sale.`);
      onClose();
      fetchRegions();
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to list the region. Error: ${
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
          <RegionCard regionMetadata={regionMetadata} bordered={false} />
          <Stack direction='column' gap={1} alignItems='center'>
            <Typography>Sell Region</Typography>
            <ArrowDownwardOutlinedIcon />
          </Stack>
          <Stack direction='column' gap={2}>
            <AmountInput
              amount={regionPrice}
              title='Region price'
              caption='The price for the entire region'
              currency={symbol}
              setAmount={setRegionPrice}
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <RecipientInput
              setRecipient={setSaleRecipient}
              recipient={saleRecipient}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={listOnSale}
          variant='contained'
          loading={working}
        >
          List on sale
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
