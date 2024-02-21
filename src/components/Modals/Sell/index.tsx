import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { contractTx, useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { RegionCard } from '@/components/elements';
import AmountInput from '@/components/elements/AmountInput';

import { CONTRACT_MARKET, CONTRACT_XC_REGIONS } from '@/contexts/apis/consts';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import MarketMetadata from '@/contracts/market.json';
import XcRegionsMetadata from '@/contracts/xc_regions.json';
import { LISTING_DEPOSIT, RegionMetadata, UNIT_DECIMALS } from '@/models';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const SellModal = ({
  open,
  onClose,
  regionMetadata,
}: TransferModalProps) => {
  const { activeAccount, api: contractsApi } = useInkathon();

  const { contract: xcRegionsContract } = useContract(
    XcRegionsMetadata,
    CONTRACT_XC_REGIONS
  );
  const { contract: marketContract } = useContract(
    MarketMetadata,
    CONTRACT_MARKET
  );

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
    if (!contractsApi || !activeAccount || !xcRegionsContract) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = region.getEncodedRegionId(contractsApi);
      const id = contractsApi.createType('Id', { U128: rawRegionId });

      await contractTx(
        contractsApi,
        activeAccount.address,
        xcRegionsContract,
        'PSP34::approve',
        {},
        [CONTRACT_MARKET, id, true]
      );

      toastSuccess(`Successfully approved region to the market.`);
      onClose();
      fetchRegions();
    } catch (e: any) {
      toastError(
        `Failed to approve the region. Error: ${e.errorMessage === 'Error'
          ? 'Please check your balance.'
          : e
        }`
      );
      setWorking(false);
    }
  };

  const listRegion = async (region: Region) => {
    if (!contractsApi || !activeAccount || !marketContract) {
      return;
    }

    try {
      setWorking(true);
      const rawRegionId = region.getEncodedRegionId(contractsApi);

      const id = contractsApi.createType('Id', {
        U128: rawRegionId.toString(),
      });
      const regionDuration = region.getEnd() - region.getBegin();
      const timeslicePrice = (
        (Number(regionPrice) * UNIT_DECIMALS) /
        regionDuration
      ).toFixed(0);

      await contractTx(
        contractsApi,
        activeAccount.address,
        marketContract,
        'list_region',
        { value: LISTING_DEPOSIT },
        [id, timeslicePrice, saleRecipient ? null : [saleRecipient]]
      );

      toastSuccess(`Successfully listed region on sale.`);
      onClose();
      fetchRegions();
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
              currency='DOT'
              setAmount={setRegionPrice}
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <RecipientSelector
              setSaleRecipient={setSaleRecipient}
              saleRecipient={saleRecipient}
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

interface RecipientSelectorProps {
  setSaleRecipient: (_: string) => void;
  saleRecipient: string;
}

const RecipientSelector = ({
  setSaleRecipient,
  saleRecipient,
}: RecipientSelectorProps) => {
  const [recipientKind, setRecipientKind] = useState('Me');

  const handleRecipientKindChange = (event: any) => {
    setSaleRecipient('');
    setRecipientKind(event.target.value);
  };

  const handleOtherRecipientChange = (event: any) => {
    setSaleRecipient(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id='recipient-selector-label'>Sale Recipient</InputLabel>
        <Select
          labelId='recipient-selector-label'
          id='recipient-selector'
          value={recipientKind}
          label='Recipient'
          onChange={handleRecipientKindChange}
        >
          <MenuItem value='Me'>Me</MenuItem>
          <MenuItem value='Other'>Other</MenuItem>
        </Select>
      </FormControl>
      {recipientKind === 'Other' && (
        <TextField
          label='Specify sale recipient'
          fullWidth
          margin='normal'
          value={saleRecipient}
          onChange={handleOtherRecipientChange}
        />
      )}
    </div>
  );
};
