import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  Box,
  Divider,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

import { RegionMetadata } from '@/models';

import styles from './index.module.scss';
import { Label } from '../elements';

interface RegionCardProps {
  region: RegionMetadata;
}

export const RegionCard = ({ region }: RegionCardProps) => {
  const { length, task } = region;
  const theme = useTheme();
  const progress = [
    {
      label: 'Core Ownership',
      value: region.ownership,
      color: 'warning',
    },
    {
      label: 'Consumed',
      value: region.consumed,
      color: 'success',
    },
    {
      label: 'Current Usage',
      value: task?.usage ?? 0,
      color: 'primary',
    },
  ];

  return (
    <Paper className={styles.container}>
      <div className={styles.regionInfo}>
        <div
          className={styles.duration}
          style={{
            borderColor: theme.palette.grey[200],
            color: theme.palette.grey[200],
          }}
        >
          <AccessTimeIcon sx={{ fontSize: '1.25em' }} />
          {`Duration: ${length}`}
        </div>
        <Typography variant='subtitle2'>
          {region.name ?? `Region #${region.id}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: theme.palette.grey[200],
          }}
        >
          <Typography variant='h2'>{region.begin}</Typography>
          <Typography variant='h2'>{region.end}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Label text='Non-Renewable' color='primary' />
          <Label text='Coretime Chain' color='success' />
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
