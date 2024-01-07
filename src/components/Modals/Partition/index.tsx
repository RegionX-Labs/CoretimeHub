import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Select,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { RegionCard } from '@/components/elements';

import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  DAY,
  HOUR,
  MINUTE,
  RegionMetadata,
  RELAY_CHAIN_BLOCK_TIME,
} from '@/models';

import styles from './index.module.scss';

interface PartitionModalProps {
  open: boolean;
  onClose: () => void;
  region: RegionMetadata;
}

export const PartitionModal = ({
  open,
  onClose,
  region,
}: PartitionModalProps) => {
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

  const { activeSigner, activeAccount } = useInkathon();

  const theme = useTheme();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const {
    config: { timeslicePeriod },
    fetchRegions,
  } = useRegions();

  const { toastError, toastSuccess, toastInfo } = useToast();

  const [unitIdx, setUnitIdx] = useState(0);
  const [pivot, setPivot] = useState(1);
  const [working, setWorking] = useState(false);

  const { unit } = timeUnits[unitIdx];
  const duration = region.end - region.begin;
  const maxSteps = Math.floor(duration / unit) - 1;

  useEffect(() => {
    setUnitIdx(0);
  }, [open]);

  useEffect(() => {
    setPivot(1);
  }, [unitIdx]);

  const onPartition = async () => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;
    const pivotInTimeslice = Math.floor(
      Math.floor((pivot * unit) / RELAY_CHAIN_BLOCK_TIME) / timeslicePeriod
    );
    const txPartition = coretimeApi.tx.broker.partition(
      region.rawId,
      pivotInTimeslice
    );

    try {
      setWorking(true);
      await txPartition.signAndSend(
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
                toastError(`Failed to partition the region`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to partition the region. ${e}`);
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <RegionCard region={region} bordered={false} />
        <Box className={styles.unitContainer}>
          <Typography variant='h2' sx={{ color: theme.palette.text.secondary }}>
            Time units
          </Typography>
          <Select
            value={unitIdx}
            onChange={(e) => setUnitIdx(Number(e.target.value))}
          >
            {timeUnits
              .filter(({ unit }) => unit < duration)
              .map(({ label }, idx) => (
                <MenuItem value={idx} key={idx}>
                  {label}
                </MenuItem>
              ))}
          </Select>
          <Slider
            min={1}
            max={maxSteps}
            step={1}
            value={pivot}
            onChange={(_e, v) => setPivot(v as number)}
            marks
            valueLabelDisplay='on'
            valueLabelFormat={(v) =>
              `Pivot: ${v} ${timeUnits[unitIdx].strUnit}${v > 1 ? 's' : ''}`
            }
            size='medium'
            className={styles.timeSlider}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={onPartition}
          variant='contained'
          loading={working}
        >
          Partition
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
