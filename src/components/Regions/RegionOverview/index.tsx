import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { humanizer } from 'humanize-duration';
import { useEffect, useState } from 'react';

import { getRelativeTimeString, timesliceToTimestamp } from '@/utils/functions';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface RegionOverviewProps {
  regionMetadata: RegionMetadata;
}

export const RegionOverview = ({ regionMetadata }: RegionOverviewProps) => {
  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  const {
    state: { api: relayApi, isApiReady: isRelayReady },
  } = useRelayApi();

  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const { region } = regionMetadata;
  const { timeslicePeriod } = useCoretimeApi();

  useEffect(() => {
    if (!relayApi || !isRelayReady) {
      return;
    }
    const fetchTimestamps = async () => {
      const begin = await timesliceToTimestamp(
        relayApi,
        region.getBegin(),
        timeslicePeriod
      );
      const end = await timesliceToTimestamp(
        relayApi,
        region.getEnd(),
        timeslicePeriod
      );

      setBeginTimestamp(begin);
      setEndTimestamp(end);
    };
    fetchTimestamps();
  }, [relayApi, isRelayReady, region, timeslicePeriod]);
  return (
    <Paper className={styles.container}>
      <Box className={styles.regionInfo}>
        <Box>
          <Typography
            sx={{
              color: theme.palette.common.black,
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            {regionMetadata.name}
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            {`Duration: ${formatDuration(endTimestamp - beginTimestamp)}`}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{ color: theme.palette.common.black }}
          >{`Core Index: #${region.getCore()}`}</Typography>
        </Box>
      </Box>
      <Box className={styles.timeInfo}>
        <Stack direction='column'>
          <Typography>Begin:</Typography>
          <Typography sx={{ color: theme.palette.common.black }}>
            {getRelativeTimeString(beginTimestamp)}
          </Typography>
        </Stack>
        <Stack direction='column'>
          <Typography>End:</Typography>
          <Typography sx={{ color: theme.palette.common.black }}>
            {getRelativeTimeString(endTimestamp)}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
