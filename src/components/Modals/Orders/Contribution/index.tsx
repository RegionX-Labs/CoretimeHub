import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { ProgressButton } from '@/components/Elements';
import { OrderCard } from '@/components/Orders';

import { Order } from '@/models';

import styles from './index.module.scss';

interface ContributionModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

export const ContributionModal = ({
  open,
  onClose,
  order,
}: ContributionModalProps) => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);

  const onContribute = () => {
    setWorking(true);
    setWorking(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Contribute to order
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Here you can contribute or cancel your contribution
          </Typography>
        </Box>
        <Stack direction='column' gap='1rem'>
          <OrderCard order={order} alignHeader='left' />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton
          onClick={onContribute}
          label='Contribute'
          loading={working}
        />
      </DialogActions>
    </Dialog>
  );
};
