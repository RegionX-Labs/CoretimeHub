import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useCallback, useEffect, useState } from 'react';

import { timesliceToTimestamp } from '@/utils/functions';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useCommon } from '@/contexts/common';
import { ISMPRecordStatus, RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface IsmpRegionProps {
  regionMetadata: RegionMetadata;
}

export const IsmpRegionCard = ({ regionMetadata }: IsmpRegionProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);

  const { region, coreOccupancy, status } = regionMetadata;
  const { timeslicePeriod } = useCommon();

  const setTimestamps = useCallback(
    (api: ApiPromise) => {
      timesliceToTimestamp(api, region.getBegin(), timeslicePeriod).then(
        (value) => setBeginTimestamp(value)
      );
    },
    [region, timeslicePeriod]
  );

  useEffect(() => {
    if (!relayApi || relayApiState !== ApiState.READY) {
      return;
    }

    setTimestamps(relayApi);
  }, [relayApi, relayApiState, setTimestamps]);
  return (
    <Paper className={styles.container}>
      <Box
        className={styles.infoContainer}
        sx={{
          opacity: status !== ISMPRecordStatus.AVAILABLE ? 0.3 : 1,
        }}
      >
        <Box className={styles.regionInfo}>
          <Box>
            <Typography className={styles.regionName}>
              {regionMetadata.name}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: theme.palette.common.black }}>
              {`Core Index: #${region.getCore()}`}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.timeInfo}>
          <Stack direction='column'>
            <Typography>Begin:</Typography>
            <Typography sx={{ color: theme.palette.common.black }}>
              {timeAgo.format(beginTimestamp)}
            </Typography>
          </Stack>
          <Stack direction='column' gap='0.2rem'>
            <Typography>Core Occupancy</Typography>
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <LinearProgress
                value={coreOccupancy * 100}
                valueBuffer={100}
                sx={{
                  width: '15rem',
                  height: '0.8em',
                }}
                variant='buffer'
                color='success'
              />
              <Typography
                variant='h2'
                sx={{
                  color: theme.palette.text.primary,
                  width: '3rem',
                  fontWeight: 400,
                }}
              >
                {`${(coreOccupancy * 100).toFixed(2)}%`}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Box className={styles.statusContainer}>
        {status === ISMPRecordStatus.PENDING ? (
          <>
            <CircularProgress size='1.5rem' />
            <Typography sx={{ color: theme.palette.primary.main }}>
              Fetching region record...
            </Typography>
          </>
        ) : status === ISMPRecordStatus.UNAVAILABLE ? (
          <>
            <Stack direction='row' gap='0.5rem'>
              <WarningAmberOutlinedIcon color='error' />
              <Typography sx={{ color: theme.palette.error.main }}>
                Failed to fetch region record
              </Typography>
            </Stack>
            <Button variant='outlined'>Request again</Button>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Paper>
  );
};
