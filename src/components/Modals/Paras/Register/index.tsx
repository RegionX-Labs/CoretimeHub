import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { ProgressButton } from '@/components/Elements';

import styles from './index.module.scss';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;

  paraId: number;
  regCost: string;
}

export const RegisterModal = ({
  open,
  onClose,
  paraId,
  regCost,
}: RegisterModalProps) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setLoading(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Register Parachain
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Fill out the detail to register parachain
          </Typography>
        </Box>
        <Box className={styles.info}>
          <Box className={styles.infoItem}>
            <Typography className={styles.itemKey}>PARA ID:</Typography>
            <Typography
              sx={{ color: theme.palette.common.black }}
              className={styles.itemValue}
            >
              {paraId}
            </Typography>
          </Box>
          <Box className={styles.infoItem}>
            <Typography className={styles.itemKey}>
              Registration Cost:
            </Typography>
            <Typography
              sx={{ color: theme.palette.common.black }}
              className={styles.itemValue}
            >
              {regCost}
            </Typography>
          </Box>
        </Box>
        {/* TODO: buttons */}
        <Box className={styles.buttons}></Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>

        <ProgressButton
          onClick={onRegister}
          label='Register'
          loading={loading}
        />
      </DialogActions>
    </Dialog>
  );
};
