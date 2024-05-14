import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import { ProgressButton } from '@/components/Elements';

import styles from './index.module.scss';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;

  paraId: number;
}

export const RegisterModal = ({
  open,
  onClose,
  paraId,
}: RegisterModalProps) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const onRegister = async () => {
    // TODO:
  };

  const onUploadGenesisHead = () => {
    // TODO:
  };

  const onUploadCode = () => {
    // TODO:
  };

  useEffect(() => {
    open && setLoading(false);
  }, [open]);

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
              0 {/**FIXME: */}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.buttons}>
          <Button className={styles.uploadButton} onClick={onUploadGenesisHead}>
            <CloudUploadOutlinedIcon />
            Upload Genesis Head
            <VisuallyHiddenInput type='file' />
          </Button>
          <Button className={styles.uploadButton} onClick={onUploadCode}>
            <CodeOutlinedIcon />
            Upload Validation Code
            {/* <VisuallyHiddenInput type='file' /> */}
          </Button>
        </Box>
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
