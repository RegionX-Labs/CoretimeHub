import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useContract, useInkathon } from '@scio-labs/use-inkathon';
import { useState } from 'react';

import { RegionCard } from '@/components/elements';
import AmountInput from '@/components/elements/AmountInput';

import { useCoretimeApi } from '@/contexts/apis';
import { CONTRACT_XC_REGIONS } from '@/contexts/apis/consts';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import XcRegionsMetadata from '@/contracts/xc_regions.json';
import { RegionMetadata } from '@/models';

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
  const { activeAccount, activeSigner, api: contractsApi } = useInkathon();
  const { contract } = useContract(XcRegionsMetadata, CONTRACT_XC_REGIONS);

  const { fetchRegions } = useRegions();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();

  const [regionPrice, setRegionPrice] = useState('');
  const [paymentReceiver, setPaymentReceiver] = useState<null | string>(null);
  const [working, setWorking] = useState(false);

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
            <Typography>Total region price:</Typography>
            <AmountInput
              amount={regionPrice}
              title='Region price'
              caption='The price for the entire region'
              currency='DOT'
              setAmount={setRegionPrice}
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <Typography>Payment receiver:</Typography>
            <TextField
              value={paymentReceiver}
              onChange={(e) => setPaymentReceiver(e.target.value)}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={() => {}} variant='contained' loading={working}>
          List on sale
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
