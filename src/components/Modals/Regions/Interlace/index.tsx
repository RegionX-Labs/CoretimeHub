import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import { maskFromBin, maskFromChunk, maskToBin } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { ProgressButton, RegionOverview } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { COREMASK_BIT_LEN, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface InterlaceModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const InterlaceModal = ({
  open,
  onClose,
  regionMetadata,
}: InterlaceModalProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const {
    state: { api },
  } = useCoretimeApi();
  const { toastError, toastSuccess, toastInfo } = useToast();
  const { fetchRegions } = useRegions();

  const currentMask = maskToBin(regionMetadata.region.getMask());
  // Represents the first active bit in the bitmap.
  const oneStart = currentMask.indexOf('1');
  // Represents the last active bit in the bitmap.
  const oneEnd = currentMask.lastIndexOf('1');
  const activeBits = oneEnd - oneStart + 1;

  const [working, setWorking] = useState(false);
  const [position, setPosition] = useState(oneStart);

  const newMask =
    oneStart <= position + 1
      ? maskToBin(maskFromChunk(oneStart, position + 1))
      : '';

  const onInterlace = async () => {
    if (!api || !activeAccount || !activeSigner) return;

    const mask = maskFromBin(newMask);

    const txInterlace = api.tx.broker.interlace(
      regionMetadata.region.getOnChainRegionId(),
      mask
    );
    try {
      setWorking(true);
      await txInterlace.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Transaction successful');
                onClose();
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to interlace the region`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to interlace the region. ${e}`);
      setWorking(false);
    }
  };

  useEffect(() => {
    open && setPosition(oneStart);
  }, [open, oneStart]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Region Interlacing
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Interlace your region
          </Typography>
        </Box>
        <RegionOverview regionMetadata={regionMetadata} />
        <Paper className={styles.content}>
          <Typography
            variant='subtitle2'
            sx={{
              color: theme.palette.common.black,
              fontWeight: 500,
            }}
          >
            Current Mask:
          </Typography>
          <Typography className={styles.mask}>{currentMask}</Typography>
          {activeBits > 1 && (
            <>
              <Box display='flex' justifyContent='center'>
                <CoremaskCircularProgress
                  position={position}
                  oneStart={oneStart}
                  oneEnd={oneEnd}
                />
              </Box>
              <Slider
                min={oneStart}
                max={oneEnd - 1}
                step={1}
                value={position}
                onChange={(_e, v) => setPosition(Number(v))}
                valueLabelDisplay='on'
                valueLabelFormat={(v) =>
                  `${(((v - oneStart + 1) / COREMASK_BIT_LEN) * 100).toFixed(
                    2
                  )}%`
                }
                className={styles.slider}
              />
              <Typography
                variant='subtitle2'
                sx={{
                  color: theme.palette.common.black,
                  fontWeight: 500,
                }}
              >
                New Mask:
              </Typography>
              <Typography className={styles.mask}>{newMask}</Typography>
            </>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <ProgressButton
          onClick={onInterlace}
          loading={working}
          disabled={activeBits === 1}
          label='Interlace'
        />
      </DialogActions>
    </Dialog>
  );
};

interface CoremaskCircularProgressProps {
  position: number;
  oneStart: number;
  oneEnd: number;
}

const CoremaskCircularProgress = ({
  position,
  oneStart,
  oneEnd,
}: CoremaskCircularProgressProps) => {
  const getCircularProgressValue = (
    value: number,
    minValue: number,
    maxValue: number
  ) => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <Box position='relative' display='inline-flex'>
      <CircularProgress
        className={styles.circular}
        size='200px'
        variant='determinate'
        value={100}
        style={{ position: 'absolute', color: '#d3d3d3' }} // Secondary color
      />
      <CircularProgress
        className={styles.circular}
        size='200px'
        variant='determinate'
        value={getCircularProgressValue(position, oneStart, oneEnd)}
      />
    </Box>
  );
};
