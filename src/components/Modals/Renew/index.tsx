import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';

import {
  formatBalance,
  parseHNStringToString,
  sendTx,
} from '@/utils/functions';

import { RegionCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionMetadata } from '@/models';

interface RenewModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const RenewModal = ({
  open,
  onClose,
  regionMetadata,
}: RenewModalProps) => {
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { symbol, api, apiState },
  } = useCoretimeApi();
  const [working, setWorking] = useState(false);

  const { fetchRegions } = useRegions();
  const { toastInfo, toastError, toastWarning, toastSuccess } = useToast();

  const [renewalPrice, setRenewalPrice] = useState('');

  const renew = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    if (!renewalPrice) {
      toastWarning('Region not renewable');
      return;
    }

    const txPurchase = api.tx.broker.renew(regionMetadata.region.getCore());

    sendTx(txPurchase, activeAccount.address, activeSigner, {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo(`In Block`),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Transaction successful');
        fetchRegions();
        onClose();
      },
      error: () => {
        toastError(`Failed to renew the region`);
      },
    });
  };

  const getRenewalPrice = useCallback(
    async (api: ApiPromise) => {
      const renewalId = {
        core: regionMetadata.region.getCore(),
        when: regionMetadata.region.getEnd(),
      };
      const renewalInfo = (
        await api.query.broker.allowedRenewals(renewalId)
      ).toHuman() as any;

      if (renewalInfo && renewalInfo.price) {
        setRenewalPrice(parseHNStringToString(renewalInfo.price));
      }
    },
    [regionMetadata]
  );

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;

    getRenewalPrice(api);
  }, [getRenewalPrice, api, apiState]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionCard regionMetadata={regionMetadata} bordered={false} />
          <Stack direction='column' gap={1} alignItems='center'>
            <Typography>Renew Region</Typography>
            <ArrowDownwardOutlinedIcon />
          </Stack>
        </Stack>
      </DialogContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1em',
        }}
      >
        <Typography variant='h6'>
          Renewal price: {`${formatBalance(renewalPrice, false)} ${symbol}`}
        </Typography>
        <DialogActions>
          <LoadingButton onClick={renew} variant='contained' loading={working}>
            Renew region
          </LoadingButton>
          <Button onClick={onClose} variant='outlined'>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
