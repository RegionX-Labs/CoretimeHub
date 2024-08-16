import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { countMaskOnes } from 'coretime-utils';
import { useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';
import { getBalanceString } from '@/utils/functions';

import { ActionButton } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useRegionXApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useOrders } from '@/contexts/orders';
import { useToast } from '@/contexts/toast';
import { Order, Region } from '@/models';

import styles from './index.module.scss';
import { OrderCard } from '../../OrderCard';

interface OrderProcessorModalProps extends DialogProps {
  onClose: () => void;
  order: Order;
  regions: Array<Region>;
}

export const OrderProcessorModal = ({
  open,
  onClose,
  order,
  regions,
}: OrderProcessorModalProps) => {
  const theme = useTheme();

  const { fetchOrders } = useOrders();
  const { toastInfo, toastError, toastWarning, toastSuccess } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api, apiState, symbol, decimals },
  } = useRegionXApi();
  const {
    state: { decimals: relayDecimals, symbol: relaySymbol },
  } = useRelayApi();

  const [regionSelected, selectRegion] = useState<Region | null>(
    regions.length ? regions[0] : null
  );
  const [working, setWorking] = useState(false);

  const onProcess = async () => {
    if (!api || apiState !== ApiState.READY) {
      toastWarning('Please check the API connection');
      return;
    }

    if (!activeAccount || !activeSigner) {
      toastWarning('Please connect your wallet');
      return;
    }

    if (!regionSelected) {
      toastWarning('Please select a region.');
      return;
    }

    try {
      const tx = api.tx.processor.fulfillOrder(order.orderId, {
        begin: regionSelected.begin,
        core: regionSelected.core,
        mask: regionSelected.mask,
      });

      submitExtrinsicWithFeeInfo(
        symbol,
        decimals,
        tx,
        activeAccount.address,
        activeSigner,
        {
          ready: () => {
            setWorking(true);
            toastInfo('Transaction was initiated');
          },
          inBlock: () => toastInfo('In Block'),
          finalized: () => setWorking(false),
          success: () => {
            toastSuccess('Successfully fulfilled an order');
            onClose();
            fetchOrders();
          },
          fail: () => {
            toastError('Failed to fulfill an order');
          },
          error: (e) => {
            toastError(`Failed to fulfill an order ${e}`);
            setWorking(false);
          },
        }
      );
    } catch (e: any) {
      toastError(`Failed to fulfill the order. ${e.toString()}`);
      setWorking(false);
    }
  };

  const checkRequirements = (order: Order, region: Region | null) => {
    if (!region) return false;
    return (
      region.begin !== null &&
      region.end !== null &&
      region.begin <= order.begin &&
      region.end >= order.end &&
      countMaskOnes(region.mask) * 720 >= order?.coreOccupancy
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      data-cy='order-processor-modal'
    >
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Order #{order.orderId}
          </Typography>
        </Box>
        <Box>
          {
            <Stack gap='1rem'>
              <OrderCard order={order} simplified />
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography>Reward for fulfilling</Typography>
                <Typography
                  sx={{ color: theme.palette.common.black, fontWeight: 500 }}
                >
                  {getBalanceString(
                    order.totalContribution.toString(),
                    relayDecimals,
                    relaySymbol
                  )}
                </Typography>
              </Stack>
              <Typography>Region to sell</Typography>
              <Select
                defaultValue={regions.length ? 0 : ''}
                sx={{
                  borderRadius: '1rem',
                  color: theme.palette.common.black,
                  fontWeight: 500,
                }}
                onChange={(e) => selectRegion(regions[Number(e.target.value)])}
                disabled={working}
              >
                {regions.map((region, idx) => (
                  <MenuItem key={idx} value={idx}>
                    {`Begin: ${region.begin}, End: ${
                      region.end
                    }, CoreOccupancy: ${
                      (countMaskOnes(region.mask) * 100) / 80
                    }%`}
                  </MenuItem>
                ))}
              </Select>
              {regions.length === 0 ? (
                <Alert severity='error'>No region avilable</Alert>
              ) : (
                !checkRequirements(order, regionSelected) && (
                  <Alert severity='error'>
                    The selected region does not match requirements
                  </Alert>
                )
              )}
            </Stack>
          }
        </Box>
      </DialogContent>
      <DialogActions>
        <Stack width='100%' gap='0.5rem' mt='1.5rem'>
          <Button
            fullWidth
            variant='contained'
            sx={{
              borderRadius: '1rem',
            }}
            onClick={onProcess}
            disabled={!checkRequirements(order, regionSelected) || working}
          >
            Fulfill
          </Button>
          <ActionButton
            label='Close'
            onClick={onClose}
            data-cy='btn-close-order-processor-modal'
          />
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
