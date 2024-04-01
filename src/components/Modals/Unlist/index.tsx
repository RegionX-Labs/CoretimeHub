import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from '@mui/material';
import { contractTx, useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useState } from 'react';

import { RegionCard } from '@/components/Elements';

import { CONTRACT_MARKET } from '@/contexts/apis/consts';
import { useMarket } from '@/contexts/market';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import MarketMetadata from '@/contracts/market.json';
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
  const { activeAccount, api: contractsApi } = useInkathon();

  const { contract: marketContract } = useContract(
    MarketMetadata,
    CONTRACT_MARKET
  );

  const { fetchRegions } = useRegions();
  const { fetchMarket } = useMarket();
  const { toastError, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);

  const unlistRegion = async (region: Region) => {
    if (!contractsApi || !activeAccount || !marketContract) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = region.getEncodedRegionId(contractsApi);

      const id = contractsApi.createType('Id', {
        U128: rawRegionId.toString(),
      });

      await contractTx(
        contractsApi,
        activeAccount.address,
        marketContract,
        'unlist_region',
        {},
        [id]
      );

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
          <RegionCard regionMetadata={regionMetadata} bordered={false} />
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
