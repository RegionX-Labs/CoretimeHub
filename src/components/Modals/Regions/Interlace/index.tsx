import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Paper,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import { maskFromBin, maskFromChunk, maskToBin } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';

import { ProgressButton } from '@/components/Elements';
import { RegionOverview } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { COREMASK_BIT_LEN, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface InterlaceModalProps extends DialogProps {
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
    state: { api, symbol, decimals },
  } = useCoretimeApi();
  const { toastError, toastSuccess, toastInfo } = useToast();
  const { fetchRegions } = useRegions();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

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
    if (!activeAccount || !activeSigner) return;

    const mask = maskFromBin(newMask);

    const txInterlace = api!.tx.broker.interlace(
      regionMetadata.region.getOnChainRegionId(),
      mask
    );
    submitExtrinsicWithFeeInfo(
      symbol,
      decimals,
      txInterlace,
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
          toastSuccess('Successfully interlaced the region');
          onClose();
          fetchRegions();
        },
        fail: () => {
          toastError('Failed to interlace the region');
        },
        error: (e) => {
          toastError(`Failed to interlace the region ${e}`);
          setWorking(false);
        },
      }
    );
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
            sx={{
              color: theme.palette.text.primary,
              textWrap: 'wrap',
              maxWidth: '35rem',
            }}
          >
            Interlace your region into two new regions, each of which can be
            assigned to a different task while both run on the same core.
          </Typography>
          <br></br>
          <Typography
            variant='subtitle2'
            sx={{
              color: theme.palette.text.primary,
              textWrap: 'wrap',
              maxWidth: '35rem',
            }}
          >
            Select the percentage of core resources that will be allocated to
            one of the newly created regions, while the rest will be allocated
            to the other.
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
        size='12rem'
        variant='determinate'
        value={100}
        style={{ position: 'absolute', color: '#d3d3d3' }} // Secondary color
      />
      <CircularProgress
        className={styles.circular}
        size='12rem'
        variant='determinate'
        value={getCircularProgressValue(position, oneStart, oneEnd)}
      />
    </Box>
  );
};
