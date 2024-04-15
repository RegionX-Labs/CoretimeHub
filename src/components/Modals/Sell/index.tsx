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
import { useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { AmountInput, RegionCard } from '@/components/Elements';
import { RecipientSelector } from '@/components/Elements/Selectors/RecipientSelector';

import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { CONTRACT_DECIMALS, LISTING_DEPOSIT, RegionMetadata } from '@/models';

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
  const { activeAccount, api } = useInkathon();

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

  const approveXcRegion = async (region: Region) => {
    if (!api || !activeAccount) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = region.getEncodedRegionId(api);
      const id = api.createType('Id', { U128: rawRegionId });

      /*
      await contractTx(
        api,
        activeAccount.address,
        xcRegionsContract,
        'PSP34::approve',
        {},
        [CONTRACT_MARKET, id, true]
      );
      */

      toastSuccess(`Successfully approved region to the market.`);
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to approve the region. Error: ${e.errorMessage === 'Error' ? 'Please check your balance.' : e
        }`
      );
      setWorking(false);
    }
  };

  const listRegion = async (region: Region) => {
    if (!api || !activeAccount) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = region.getEncodedRegionId(api);

      const id = api.createType('Id', {
        U128: rawRegionId.toString(),
      });
      const regionDuration = region.getEnd() - region.getBegin();
      const timeslicePrice = (
        (Number(regionPrice) * Math.pow(10, CONTRACT_DECIMALS)) /
        regionDuration /
        region.coreOccupancy()
      ).toFixed(0);

      /*
      await contractTx(
        api,
        activeAccount.address,
        marketContract,
        'list_region',
        { value: LISTING_DEPOSIT },
        [id, timeslicePrice, saleRecipient ? saleRecipient : null]
      );
      */

      toastSuccess(`Successfully listed region on sale.`);
      onClose();
      fetchRegions();
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to list the region. Error: ${e.errorMessage === 'Error'
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
              currency='ROC'
              setAmount={setRegionPrice}
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <RecipientSelector
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
