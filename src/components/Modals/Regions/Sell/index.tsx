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
import { useState } from 'react';

import { AddressInput, AmountInput } from '@/components/Elements';
import { RegionMetaCard } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { ApiState } from '@/contexts/apis/types';
import { useMarket } from '@/contexts/market';
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
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { symbol },
  } = useCoretimeApi();
  const {
    state: { api: regionXApi, apiState: regionXApiState, decimals },
  } = useRegionXApi();

  const { fetchRegions } = useRegions();
  const { fetchMarket } = useMarket();
  const { toastError, toastInfo, toastSuccess, toastWarning } = useToast();

  const [price, setPrice] = useState<number | undefined>();
  const [saleRecipient, setSaleRecipient] = useState<string>('');
  const [working, setWorking] = useState(false);

  const listOnSale = async () => {
    if (
      !activeAccount ||
      !activeSigner ||
      !regionXApi ||
      regionXApiState !== ApiState.READY
    ) {
      toastWarning(
        'Please connect your wallet and check the network connection.'
      );
      return;
    }

    if (price === undefined) {
      toastWarning('Please input the price');
      return;
    }

    if (!saleRecipient) {
      toastWarning('Please input the sale recipient');
      return;
    }

    try {
      setWorking(true);

      const regionId = regionMetadata.region.getOnChainRegionId();
      const end = regionMetadata.region.getEnd();
      const durationInTimeslices = end - regionId.begin;
      const pricePerTimeslice = price / durationInTimeslices;
      const txListOnMarket = regionXApi.tx.market.listRegion(
        regionId,
        Math.floor(pricePerTimeslice * Math.pow(10, decimals)),
        saleRecipient
      );

      await txListOnMarket.signAndSend(
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
                onClose();
                fetchRegions();
                fetchMarket();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to list the region.`);
              }
            });
          }
        }
      );
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
          <RegionMetaCard regionMetadata={regionMetadata} bordered={false} />
          <Stack direction='column' gap={1} alignItems='center'>
            <Typography>List on market</Typography>
            <ArrowDownwardOutlinedIcon />
          </Stack>
          <Stack direction='column' gap={2}>
            <AmountInput
              amount={price}
              caption='Total price of the region'
              currency={symbol}
              setAmount={setPrice}
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <AddressInput onChange={setSaleRecipient} address={saleRecipient} />
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
