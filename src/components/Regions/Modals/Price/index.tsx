import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { ActionButton, CountDown, SalePriceChart } from '@/components';

import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

import styles from './index.module.scss';

interface PriceModalProps extends DialogProps {
  onClose: () => void;
}

export const PriceModal = ({ open, onClose }: PriceModalProps) => {
  const theme = useTheme();

  const {
    phase: { currentPhase, endpoints: saleEndpoints },
  } = useSaleInfo();

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' data-cy='price-modal'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Price Analysis
          </Typography>
        </Box>
        {currentPhase === SalePhase.Interlude ? (
          <Box>
            <Typography>{"Sale hasn't started yet."}</Typography>
            <Stack
              direction='column'
              alignItems='center'
              sx={{ mt: '2rem' }}
              gap='1rem'
            >
              <Typography>Sale starts in:</Typography>
              <CountDown
                remainingTime={(saleEndpoints.fixed.end - Date.now()) / 1000}
              />
            </Stack>
          </Box>
        ) : (
          <></>
        )}
        <Box className={styles.chartContainer}>
          <SalePriceChart />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box>
          <ActionButton
            label='Close'
            onClick={onClose}
            data-cy='btn-close-price-modal'
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
