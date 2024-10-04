import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModeOutlinedIcon from '@mui/icons-material/ModeOutlined';
import {
  Box,
  Divider,
  IconButton,
  Input,
  LinearProgress,
  Link,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { clsx } from 'clsx';
import { humanizer } from 'humanize-duration';
import React, { useEffect, useState } from 'react';

import { getRelativeTimeString, timesliceToTimestamp } from '@/utils/functions';

import { SUSBCAN_RELAY_URL } from '@/consts';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useTasks } from '@/contexts/tasks';
import { POOLING_TASK_ID, RegionLocation, RegionMetadata } from '@/models';

import { Label } from '../..';
import { RegionCard } from '@region-x/components';

interface RegionMetaCardProps {
  regionMetadata: RegionMetadata;
  editable?: boolean;
  active?: boolean;
  bordered?: boolean;
  updateName?: (_newName: string) => void;
}

interface RegionCardInnerProps {
  regionMetadata: RegionMetadata;
  editable?: boolean;
  updateName?: (_newName: string) => void;
}

export const RegionMetaCard = ({
  regionMetadata,
  editable = false,
  updateName,
}: RegionCardInnerProps) => {
  const { tasks } = useTasks();

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });
  const { region, taskId, location } = regionMetadata;

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const {
    state: { api, apiState },
  } = useRelayApi();

  const { timeslicePeriod } = useCoretimeApi();

  useEffect(() => {
    if (!api || apiState !== ApiState.READY || !api.isConnected) {
      return;
    }

    const fetchTimestamps = async () => {
      const begin = await timesliceToTimestamp(api, region.getBegin(), timeslicePeriod);
      const end = await timesliceToTimestamp(api, region.getEnd(), timeslicePeriod);

      setBeginTimestamp(begin);
      setEndTimestamp(end);
    };
    fetchTimestamps();
  }, [api, apiState, region, timeslicePeriod]);

  const locationToLabel = (location: RegionLocation): string => {
    if (location === RegionLocation.REGIONX_CHAIN) {
      return 'RegionX Chain';
    } else {
      return 'Coretime Chain';
    }
  };

  const getTask = (taskId: number | null): string => {
    if (taskId === POOLING_TASK_ID) return 'Instantaneous Pool';
    const getTaskName = (taskId: number) => {
      return tasks.find(({ id }) => id === taskId)?.name || '';
    };

    if (taskId !== null) {
      return getTaskName(taskId) ? getTaskName(taskId) : `Parachain ${taskId}`;
    }
    return 'Unassigned';
  };

  return (
    <div>
      <RegionCard
        regionData={{
          name: regionMetadata.name || `Region ${regionMetadata.region.getCore()}`,
          regionStart: getRelativeTimeString(beginTimestamp),
          regionEnd: getRelativeTimeString(endTimestamp),
          coreIndex: region.getCore(),
          consumed: regionMetadata.consumed,
          chainLabel: locationToLabel(location),
          chainColor: location === RegionLocation.CORETIME_CHAIN ? 'purpleDark' : 'blueDark',
          coreOcupaccy: regionMetadata.coreOccupancy * 100,
          duration: formatDuration(endTimestamp - beginTimestamp),
          currentUsage: regionMetadata.currentUsage * 100,
        }}
      />
    </div>
  );
};
