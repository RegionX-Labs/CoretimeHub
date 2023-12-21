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
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { clsx } from 'clsx';
import { humanizer } from 'humanize-duration';
import TimeAgo from 'javascript-time-ago';
// English.
import en from 'javascript-time-ago/locale/en';
import React, { useState } from 'react';

import { RegionMetadata, RegionOrigin } from '@/models';

import styles from './index.module.scss';
import { Label } from '../elements';

interface RegionCardProps {
  region: RegionMetadata;
  active?: boolean;
  updateName: (_newName: string) => void;
}

export const RegionCard = ({
  region,
  active = false,
  updateName,
}: RegionCardProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const formatDuration = humanizer();
  const { begin, end, task, consumed, ownership, paid, origin, core } = region;
  const theme = useTheme();

  const [isEdit, setEdit] = useState(false);
  const [name, setName] = useState('');

  const progress = [
    {
      label: 'Core Ownership',
      value: ownership ?? 0,
      color: 'warning',
    },
    {
      label: 'Consumed',
      value: consumed ?? 0,
      color: 'success',
    },
    {
      label: 'Current Usage',
      value: task?.usage ?? 0,
      color: 'primary',
    },
  ];

  const onEdit = () => {
    setEdit(true);
    setName(region.name ?? '');
  };

  const onSave = () => {
    setEdit(false);
    setName('');
    updateName(name);
  };

  const onCancel = () => {
    setEdit(false);
    setName('');
  };

  return (
    <Paper className={clsx(styles.container, active ? styles.active : '')}>
      <div className={styles.regionInfo}>
        <div
          className={styles.duration}
          style={{
            borderColor: theme.palette.grey[200],
            color: theme.palette.grey[200],
          }}
        >
          <AccessTimeIcon sx={{ fontSize: '1.25em' }} />
          {`Duration: ${formatDuration(end - begin)}`}
        </div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '2rem',
          }}
        >
          {isEdit ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              size='small'
            />
          ) : (
            <Typography variant='subtitle2'>{region.name}</Typography>
          )}
          {isEdit ? (
            <Box style={{ display: 'flex', gap: '0.5rem' }}>
              <IconButton onClick={onSave} sx={{ px: 0, py: '4px' }}>
                <CheckOutlinedIcon sx={{ fontSize: '0.7em' }} />
              </IconButton>
              <IconButton onClick={onCancel} sx={{ px: 0, py: '4px' }}>
                <CloseOutlinedIcon sx={{ fontSize: '0.7em' }} />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <IconButton onClick={onEdit}>
                <ModeOutlinedIcon sx={{ fontSize: '0.7em' }} />
              </IconButton>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: theme.palette.grey[200],
          }}
        >
          <Typography variant='h2'>{`Core Index: #${core}`}</Typography>
          <Typography variant='h2'>Begin: {timeAgo.format(begin)}</Typography>
          <Typography variant='h2'>End: {timeAgo.format(end)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Label text={paid ? 'Renewable' : 'Non-Renewable'} color='primary' />
          <Label
            text={
              origin === RegionOrigin.CORETIME_CHAIN
                ? 'Coretime Chain'
                : 'Contracts Chain'
            }
            color='success'
          />
        </Box>
      </div>
      <Divider orientation='vertical' flexItem />
      <Box sx={{ color: theme.palette.grey[200] }}>
        {task !== undefined ? (
          <Typography variant='subtitle2'>{`Task: ${
            task.name ?? task.taskId
          }`}</Typography>
        ) : (
          <></>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            mt: '2rem',
          }}
        >
          {progress.map(({ label, value, color }, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
            >
              <LinearProgress
                value={value * 100}
                valueBuffer={100}
                sx={{
                  width: '8rem',
                  height: '0.8em',
                }}
                variant='buffer'
                color={color as 'warning' | 'success' | 'info'}
              />
              <Typography
                variant='h2'
                sx={{
                  color: theme.palette.text.primary,
                  width: '3rem',
                  fontWeight: 400,
                }}
              >
                {`${(value * 100).toFixed(1)}%`}
              </Typography>
              <Typography variant='h2' sx={{ fontWeight: 400 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
