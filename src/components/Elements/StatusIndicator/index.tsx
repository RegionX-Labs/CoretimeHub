import CircleIcon from '@mui/icons-material/Circle';
import { CircularProgress, Tooltip, Typography, useTheme } from '@mui/material';

import { ApiState } from '@/contexts/apis/types';

import styles from './index.module.scss';

interface StatusIndicatorProps {
  state: ApiState;
  label: string;
}

export const StatusIndicator = ({ state, label }: StatusIndicatorProps) => {
  const theme = useTheme();
  return (
    <div className={styles.container}>
      <Typography
        sx={{
          color: theme.palette.text.primary,
          fontSize: '0.8rem',
          flexGrow: 1,
        }}
      >
        {label}
      </Typography>
      {state === ApiState.CONNECTING || state === ApiState.CONNECT_INIT ? (
        <Tooltip title='connecting'>
          <CircularProgress size='0.5rem' />
        </Tooltip>
      ) : (
        <Tooltip
          title={state == ApiState.READY ? 'connected' : 'connection error'}
        >
          <CircleIcon
            sx={{ width: '0.5rem', height: '0.5rem' }}
            color={state === ApiState.READY ? 'success' : 'error'}
          />
        </Tooltip>
      )}
    </div>
  );
};
