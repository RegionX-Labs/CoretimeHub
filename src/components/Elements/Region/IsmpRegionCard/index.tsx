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
import { makeResponse, queryRequest } from '@/utils/ismp';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { ApiState } from '@/contexts/apis/types';
import { useCommon } from '@/contexts/common';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
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
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: regionxApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const { fetchRegions } = useRegions();

  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);

  const { region, coreOccupancy, status } = regionMetadata;
  const { timeslicePeriod } = useCommon();
  const { toastWarning, toastSuccess, toastInfo, toastError } = useToast();

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

  useEffect(() => {
    if (
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !regionxApi ||
      regionxApiState !== ApiState.READY ||
      !activeAccount
    ) {
      return;
    }

    const onError = () =>
      toastWarning(
        `Failed to fulfill ISMP request. Wait 5 minutes to re-request`
      );

    const respond = async (commitment: string) => {
      try {
        const request = await queryRequest(regionxApi, commitment);
        await makeResponse(
          regionxApi,
          coretimeApi,
          request,
          activeAccount.address
        );
        toastSuccess('ISMP request fulfilled');
        fetchRegions();
      } catch {
        onError();
      }
    };

    if (status === ISMPRecordStatus.PENDING) {
      regionMetadata.requestCommitment
        ? respond(regionMetadata.requestCommitment)
        : onError();
    }
  }, [coretimeApi, regionxApi, coretimeApiState, regionxApiState]);

  const requestRegionRecord = async () => {
    if (
      !regionxApi ||
      regionxApiState !== ApiState.READY ||
      !activeAccount ||
      !activeSigner
    ) {
      return;
    }

    const request = regionxApi.tx.regions.requestRegionRecord(
      region.getRegionId()
    );
    try {
      await request.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Transaction successful');
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to request region record`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to interlace the region. ${e}`);
    }
  };

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
            <Button variant='outlined' onClick={requestRegionRecord}>
              Request again
            </Button>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Paper>
  );
};
