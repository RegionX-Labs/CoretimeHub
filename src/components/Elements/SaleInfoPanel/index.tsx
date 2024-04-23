import { Box } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import moment from 'moment';

import { formatBalance } from '@/utils/functions';

import DollarIcon from '@/assets/dollar.png';
import ListIcon from '@/assets/list.png';
import ShoppingIcon from '@/assets/shopping.png';
import { useCoretimeApi } from '@/contexts/apis';
import { SaleInfo, SalePhase } from '@/models';

import { DetailCard } from './DetailCard';

interface SaleInfoGridProps {
  saleInfo: SaleInfo;
  currentPhase: SalePhase;
  currentPrice: number;
  saleEndTimestamp: number;
  saleStartTimestamp: number;
}

export const SaleInfoPanel = ({
  saleInfo,
  currentPhase,
  currentPrice,
  saleEndTimestamp,
  saleStartTimestamp,
}: SaleInfoGridProps) => {
  TimeAgo.addLocale(en);
  const {
    state: { symbol },
  } = useCoretimeApi();

  const nextPhase = (): SalePhase => {
    const phases = Object.values(SalePhase);
    const currentIndex = phases.indexOf(currentPhase);

    // Calculate the index of the next phase
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        mt: '2rem',
        gap: '1rem',
      }}
    >
      <DetailCard
        icon={ShoppingIcon}
        title='Sale details'
        left={{
          label: 'Started at',
          value: moment(saleStartTimestamp).format('D MMM yyyy'),
        }}
        right={{
          label: 'End at',
          value: moment(saleEndTimestamp).format('D MMM yyyy'),
        }}
      />
      <DetailCard
        icon={ListIcon}
        title='Phase details'
        left={{ label: 'Current phase', value: currentPhase }}
        right={{ label: 'Upcoming phase', value: nextPhase() }}
      />
      <DetailCard
        icon={DollarIcon}
        title='Price details'
        left={{
          label: 'Current price',
          value: `${formatBalance(currentPrice.toString(), false)} ${symbol}`,
        }}
        right={{
          label: 'Floor price',
          value: `${formatBalance(saleInfo.price.toString(), false)} ${symbol}`,
        }}
      />
    </Box>
  );
};
