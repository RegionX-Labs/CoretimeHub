import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { ProgressButton } from '@/components/Elements';

import styles from './index.module.scss';

interface ReserveModalProps {
  open: boolean;
  onClose: () => void;
  paraId: number;
  reserveCost: string;
}

export const ReserveModal = ({
  open,
  onClose,
  paraId,
  reserveCost,
}: ReserveModalProps) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);

  const onReserve = async () => {
    setLoading(true);
  };

  const items = [
    {
      label: 'Next parald available to reserve:',
      value: paraId,
    },
    {
      label: 'Reservation cost:',
      value: reserveCost,
    },
  ];

  return (
    <Dialog {...{ open, onClose }}>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Reserve Para ID
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Reserve your Para ID for the future
          </Typography>
        </Box>
        <Box className={styles.info}>
          {items.map(({ label, value }, index) => (
            <Paper className={styles.infoItem} key={index}>
              <Typography className={styles.itemKey}>{label}</Typography>
              <Typography
                sx={{ color: theme.palette.common.black }}
                className={styles.itemValue}
              >
                {value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton onClick={onReserve} label='Reserve' loading={loading} />
      </DialogActions>
    </Dialog>
  );
};
