import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { BN } from '@polkadot/util';
import { useState } from 'react';

import { MarketRegion } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { ApiState } from '@/contexts/apis/types';
import { useMarket } from '@/contexts/market';
import { useRegions } from '@/contexts/regions';
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
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api: regionXApi, apiState: regionXApiState },
  } = useRegionXApi();
  const { fetchMarket } = useMarket();
  const { fetchRegions } = useRegions();

  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();

  const [working, setWorking] = useState(false);

  const purchaseRegion = async () => {
    if (!activeAccount) {
      return;
    }

    try {
      if (!regionXApi || regionXApiState !== ApiState.READY) {
        return;
      }
      if (!activeAccount || !activeSigner) {
        toastWarning('Please connect your wallet');
        return;
      }

      try {
        setWorking(true);
        const regionDuration = new BN(
          listing.region.getEnd() - listing.region.getBegin()
        );
        const maxPrice = listing.timeslicePrice.mul(regionDuration);

        const txPurchase = regionXApi.tx.market.purchaseRegion(
          listing.region.getOnChainRegionId(),
          maxPrice.toString()
        );

        await txPurchase.signAndSend(
          activeAccount.address,
          { signer: activeSigner },
          ({ status, events }) => {
            if (status.isReady) toastInfo('Transaction was initiated');
            else if (status.isInBlock) toastInfo(`In Block`);
            else if (status.isFinalized) {
              setWorking(false);
              events.forEach(({ event: { method } }) => {
                if (method === 'ExtrinsicSuccess') {
                  toastSuccess('Transaction successful');
                  fetchMarket();
                  fetchRegions();
                  onClose();
                } else if (method === 'ExtrinsicFailed') {
                  toastError(`Failed to unlist the region.`);
                }
              });
            }
          }
        );
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
    } catch (e: any) {
      toastError(
        `Failed to unlist the region. Error: ${
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
        <MarketRegion listing={listing} />
      </DialogContent>
      <DialogActions
        sx={{
          '& > button': {
            flexBasis: '100%',
          },
          mt: '1rem',
          pb: '1rem',
        }}
      >
        <LoadingButton
          onClick={() => purchaseRegion()}
          variant='contained'
          loading={working}
        >
          Purchase
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
