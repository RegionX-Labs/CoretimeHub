import CircleIcon from '@mui/icons-material/Circle';
import { CircularProgress, Typography, useTheme } from '@mui/material';

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
        variant='subtitle2'
        sx={{ color: theme.palette.text.secondary }}
      >
        {label}
      </Typography>
      {state === ApiState.CONNECTING || state === ApiState.CONNECT_INIT ? (
        <CircularProgress size='1rem' />
      ) : (
        <CircleIcon color={state === ApiState.READY ? 'success' : 'error'} />
      )}
    </div>
  );
};
