import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';

import { RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface RegionCardProps {
  region: RegionMetadata;
}

export const RegionCard = ({ region }: RegionCardProps) => {
  const { length } = region;
  const theme = useTheme();

  return (
    <Paper className={styles.container}>
      <div className={styles.regionInfo}>
        <div className={styles.duration}>
          <AccessTimeIcon sx={{ fontSize: '1.25em' }} />
          {`Duration: ${length}`}
        </div>
        <Typography variant='h2'>Region 1 </Typography>
        <Box>
          <div>Begin: 5 days ago</div>
          <div>End: 15 days later</div>
        </Box>
      </div>
      <Divider orientation='vertical' flexItem />
      <Box sx={{ color: theme.palette.grey[200] }}></Box>
    </Paper>
  );
};
