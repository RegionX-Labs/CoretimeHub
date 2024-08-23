import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Paper,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';

import { ProgressButton } from '@/components/Elements';
import { RegionOverview } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { DAY, HOUR, MINUTE, RegionMetadata, RELAY_CHAIN_BLOCK_TIME } from '@/models';

import styles from './index.module.scss';

interface PartitionModalProps extends DialogProps {
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const PartitionModal = ({ open, onClose, regionMetadata }: PartitionModalProps) => {
  const timeUnits = [
    {
      label: 'Minutes',
      unit: MINUTE,
      strUnit: 'minute',
    },
    {
      label: 'Hours',
      unit: HOUR,
      strUnit: 'hour',
    },
    {
      label: 'Days',
      unit: DAY,
      strUnit: 'day',
    },
  ];

  const {
    state: { activeSigner, activeAccount },
  } = useAccounts();

  const theme = useTheme();

  const {
    state: { api: coretimeApi, symbol, decimals },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();
  const { timeslicePeriod } = useCoretimeApi();

  const { toastError, toastSuccess, toastInfo } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const [unitIdx, setUnitIdx] = useState(0);
  const [pivot, setPivot] = useState(1);
  const [working, setWorking] = useState(false);
  const [duration, setDuration] = useState(1);

  const { unit } = timeUnits[unitIdx];
  const maxSteps = Math.floor(duration / unit) - 1;

  useEffect(() => {
    const diff = regionMetadata.region.getEnd() - regionMetadata.region.getBegin();
    setDuration(diff * timeslicePeriod * RELAY_CHAIN_BLOCK_TIME);
  }, [timeslicePeriod, regionMetadata.region]);

  useEffect(() => {
    setPivot(1);
  }, [unitIdx]);

  const onPartition = async () => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;
    const pivotInTimeslice = Math.floor(
      Math.floor((pivot * unit) / RELAY_CHAIN_BLOCK_TIME) / timeslicePeriod
    );
    const txPartition = coretimeApi.tx.broker.partition(
      regionMetadata.region.getOnChainRegionId(),
      pivotInTimeslice
    );

    submitExtrinsicWithFeeInfo(symbol, decimals, txPartition, activeAccount.address, activeSigner, {
      ready: () => {
        setWorking(true);
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Successfully partitioned the region');
        onClose();
        fetchRegions();
      },
      fail: () => {
        toastError('Failed to partition the region');
      },
      error: (e) => {
        toastError(`Failed to partition the region ${e}`);
        setWorking(false);
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent className={styles.container}>
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Region Partitioning
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{
              color: theme.palette.text.primary,
              textWrap: 'wrap',
              maxWidth: '35rem',
            }}
          >
            Split your region into two new ones with different start and end points. They will be
            divided at the selected pivot point.
          </Typography>
        </Box>
        <Box className={styles.content}>
          <RegionOverview regionMetadata={regionMetadata} />
          <Paper className={styles.timeContainer}>
            <Box className={styles.unitWrapper}>
              <Typography
                variant='subtitle2'
                sx={{ color: theme.palette.common.black, fontWeight: 500 }}
              >
                Time units
              </Typography>
              <Box className={styles.unitItems}>
                {timeUnits.map(({ label }, index) => (
                  <Typography
                    key={index}
                    className={index === unitIdx ? styles.activeUnitItem : styles.unitItem}
                    onClick={() => setUnitIdx(index)}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Slider
              min={1}
              max={maxSteps}
              step={1}
              value={pivot}
              onChange={(_e, v) => setPivot(v as number)}
              marks
              valueLabelDisplay='on'
              valueLabelFormat={(v) => `${v} ${timeUnits[unitIdx].strUnit}${v > 1 ? 's' : ''}`}
              size='medium'
              className={styles.timeSlider}
            />
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <ProgressButton onClick={onPartition} loading={working} label='Partition' />
      </DialogActions>
    </Dialog>
  );
};
