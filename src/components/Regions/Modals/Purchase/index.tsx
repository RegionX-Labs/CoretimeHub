import { Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material';
import { BN } from '@polkadot/util';
import { Button, RegionCardHeader } from '@region-x/components';
import { humanizer } from 'humanize-duration';
import { useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';
import { getTimeStringShort } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { useMarket } from '@/contexts/market';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { Listing } from '@/models';

interface PurchaseModalProps extends DialogProps {
  onClose: () => void;
  listing: Listing;
}

export const PurchaseModal = ({ open, onClose, listing }: PurchaseModalProps) => {
  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api: regionXApi, isApiReady: isRegionXReady, symbol, decimals },
  } = useRegionXApi();
  const { fetchMarket } = useMarket();
  const { fetchRegions } = useRegions();

  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const [working, setWorking] = useState(false);

  const { region } = listing;

  const purchaseRegion = async () => {
    if (!activeAccount) {
      return;
    }

    if (!regionXApi || !isRegionXReady) {
      return;
    }
    if (!activeAccount || !activeSigner) {
      toastWarning('Please connect your wallet');
      return;
    }

    const regionDuration = new BN(listing.region.getEnd() - listing.region.getBegin());
    const maxPrice = listing.timeslicePrice.mul(regionDuration);

    const txPurchase = regionXApi.tx.market.purchaseRegion(
      listing.region.getOnChainRegionId(),
      maxPrice.toString()
    );

    submitExtrinsicWithFeeInfo(symbol, decimals, txPurchase, activeAccount.address, activeSigner, {
      ready: () => {
        setWorking(true);
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Successfully purchased the region');
        fetchMarket();
        fetchRegions();
        onClose();
      },
      fail: () => {
        toastError('Failed to purchase the region');
      },
      error: (e) => {
        toastError(
          `Failed to purchase the region. Error: ${
            e.errorMessage === 'Error' ? 'Please check your balance.' : e.errorMessage
          }`
        );
        setWorking(false);
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <RegionCardHeader
          coreIndex={region.getCore()}
          duration={formatDuration(listing.endTimestamp - listing.beginTimestamp)}
          name={`Region ${region.getCore()}`}
          regionStart={getTimeStringShort(listing.beginTimestamp)}
          regionEnd={getTimeStringShort(listing.endTimestamp)}
        />
      </DialogContent>
      <DialogActions
        sx={{
          '& > button': {
            flexBasis: '100%',
          },
          mt: '1rem',
          pb: '1rem',
          width: '400px',
        }}
      >
        <Button onClick={onClose} color='dark'>
          Cancel
        </Button>
        <Button onClick={() => purchaseRegion()} loading={working}>
          Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};
