import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { SalePriceChart } from '@/components/Charts';
import { ActionButton, CountDown } from '@/components/Elements';

import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

import styles from './index.module.scss';

interface PriceModalProps {
  open: boolean;
  onClose: () => void;
  saleInfo: {
    phase: SalePhase;
  };
}

export const PriceModal = ({
  open,
  onClose,
  saleInfo: { phase },
}: PriceModalProps) => {
  const theme = useTheme();

  const {
    phase: { saleStartTimestamp },
  } = useSaleInfo();

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Price Analysis
          </Typography>
        </Box>
        {phase === SalePhase.Interlude ? (
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
                remainingTime={(saleStartTimestamp - Date.now()) / 1000}
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
          <ActionButton label='Close' onClick={onClose} />
        </Box>
      </DialogActions>
    </Dialog>
  );
};
