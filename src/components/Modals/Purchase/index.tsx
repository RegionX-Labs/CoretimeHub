import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from '@mui/material';
import { contractTx, useContract, useInkathon } from '@scio-labs/use-inkathon';
import { useState } from 'react';

import { ListingCard } from '@/components/elements/ListingCard';

import { CONTRACT_MARKET } from '@/contexts/apis/consts';
import { useMarket } from '@/contexts/market';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import MarketMetadata from '@/contracts/market.json';
import { Listing } from '@/models';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  listing: Listing;
}

export const PurchaseModal = ({ open, onClose, listing }: PurchaseModalProps) => {
  const { activeAccount, api: contractsApi } = useInkathon();

  const { contract: marketContract } = useContract(
    MarketMetadata,
    CONTRACT_MARKET
  );

  const { fetchRegions } = useRegions();
  const { fetchMarket } = useMarket();

  const { toastError, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);

  const purchaseRegion = async () => {
    if (!contractsApi || !activeAccount || !marketContract) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = listing.region.getEncodedRegionId(contractsApi);

      const id = contractsApi.createType('Id', {
        U128: rawRegionId.toString(),
      });

      await contractTx(
        contractsApi,
        activeAccount.address,
        marketContract,
        'purchase_region',
        { value: listing.currentPrice },
        [id, listing.region.getMetadataVersion()]
      );

      toastSuccess(`Successfully purchased region from sale.`);
      onClose();
      fetchMarket();
      fetchRegions();
      setWorking(false);
    } catch (e: any) {
      toastError(
        `Failed to purchase region from sale. Error: ${e.errorMessage === 'Error'
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
