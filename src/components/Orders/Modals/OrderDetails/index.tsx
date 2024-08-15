import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Typography,
  useTheme,
} from '@mui/material';

import { ActionButton } from '@/components/Elements';

import { useOrders } from '@/contexts/orders';

import styles from './index.module.scss';
import { OrderCard } from '../../OrderCard';

interface OrderDetailsModalProps extends DialogProps {
  onClose: () => void;
  orderId: number;
}

export const OrderDetailsModal = ({
  open,
  onClose,
  orderId,
}: OrderDetailsModalProps) => {
  const { orders } = useOrders();
  const order = orders.find((item) => item.orderId === orderId);

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      data-cy='order-details-modal'
    >
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Order #{orderId + 1}
          </Typography>
        </Box>
        <Box>
          {!order ? (
            <Typography>Failed to get the order details</Typography>
          ) : (
            <OrderCard order={order} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box>
          <ActionButton
            label='Close'
            onClick={onClose}
            data-cy='btn-close-order-details-modal'
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
