import { Box, Stack, Typography, useTheme } from '@mui/material';

import { Order } from '@/models';

import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  alignHeader?: 'left' | 'center';
}

export const OrderCard = ({
  order,
  alignHeader = 'center',
}: OrderCardProps) => {
  const theme = useTheme();

  const { requirements, paraId } = order;

  return (
    <Box className={styles.container}>
      <Stack
        direction='column'
        gap='0.5rem'
        alignItems={alignHeader === 'left' ? 'flex-start' : 'center'}
        justifyContent='center'
      >
        {/** Show logo */}
        <Typography sx={{ fontSize: 14 }}>Para ID</Typography>
        <Typography
          sx={{ fontSize: '1rem', color: theme.palette.common.black }}
        >
          {`# ${paraId}`}
        </Typography>
      </Stack>
      <Box className={styles.timeInfo}>
        <Box className={styles.timeItem}>
          <Typography>Begin: </Typography>
          <Typography
            sx={{ color: theme.palette.common.black, fontWeight: 500 }}
          >
            {requirements.begin}
          </Typography>
        </Box>
        <Box className={styles.timeItem}>
          <Typography>End: </Typography>
          <Typography
            sx={{ color: theme.palette.common.black, fontWeight: 500 }}
          >
            {requirements.end}
          </Typography>
        </Box>
      </Box>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography>Core Occupancy</Typography>
        <Typography sx={{ color: theme.palette.common.black, fontWeight: 500 }}>
          {`${((requirements.coreOccupancy / 57600) * 100).toFixed(2)} %`}
        </Typography>
      </Stack>
    </Box>
  );
};
