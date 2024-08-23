import { Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import Image from 'next/image';

import { getBalanceString } from '@/utils/functions';

import { Address } from '@/components/Elements';

import { chainData } from '@/chaindata';
import { useRelayApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { Order } from '@/models';

import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  direction?: 'vertical' | 'horizontal';
  simplified?: boolean;
}

export const OrderCard = ({
  order,
  direction = 'vertical',
  simplified = false,
}: OrderCardProps) => {
  const theme = useTheme();
  const {
    state: { decimals, symbol },
  } = useRelayApi();
  const { network } = useNetwork();
  const { begin, end, coreOccupancy, paraId } = order;

  const logo = chainData[network][order.paraId]?.logo;

  const formatBalance = (balance: number) => getBalanceString(balance.toString(), decimals, symbol);

  return (
    <Box className={styles.container}>
      <Stack
        direction={direction === 'vertical' ? 'column' : 'row'}
        gap='0.5rem'
        justifyContent={direction === 'horizontal' ? 'flex-start' : 'center'}
        alignItems='center'
      >
        {logo !== undefined && <Image src={logo} alt='chain icon' width={64} height={64} />}
        <Box>
          <Typography sx={{ fontSize: 14 }}>Para ID</Typography>
          <Typography sx={{ fontSize: '1rem', color: theme.palette.common.black }}>
            {`# ${paraId}`}
          </Typography>
        </Box>
      </Stack>
      <Box className={styles.timeInfo}>
        <Box className={styles.timeItem}>
          <Typography>Begin: </Typography>
          <Typography sx={{ color: theme.palette.common.black, fontWeight: 500 }}>
            {begin}
          </Typography>
        </Box>
        <Box className={styles.timeItem}>
          <Typography>End: </Typography>
          <Typography sx={{ color: theme.palette.common.black, fontWeight: 500 }}>{end}</Typography>
        </Box>
      </Box>

      {!simplified && (
        <>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography>Contribution</Typography>
            <Typography sx={{ color: theme.palette.common.black }}>
              {`${formatBalance(order.contribution)} / ${formatBalance(order.totalContribution)}`}
            </Typography>
          </Stack>
          <LinearProgress
            value={
              order.totalContribution === 0
                ? 0
                : (order.contribution / order.totalContribution) * 100
            }
            variant='determinate'
          />
        </>
      )}
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography>Core Occupancy</Typography>
        <Typography sx={{ color: theme.palette.common.black, fontWeight: 500 }}>
          {`${((coreOccupancy / 57600) * 100).toFixed(2)} %`}
        </Typography>
      </Stack>
      {!simplified && (
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography>Created by:</Typography>
          <Address value={order.creator} isShort isCopy size={24} />
        </Stack>
      )}
    </Box>
  );
};
