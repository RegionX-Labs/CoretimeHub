import { Box } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import moment from 'moment';

import { getBalanceString } from '@/utils/functions';

import { SalePhaseCard } from '@/components/Elements';

import DollarIcon from '@/assets/dollar.png';
import ListIcon from '@/assets/list.png';
import ShoppingIcon from '@/assets/shopping.png';
import { useCoretimeApi } from '@/contexts/apis';
import { SaleInfo, SalePhase } from '@/models';

import { DetailCard } from './DetailCard';
import styles from './index.module.scss';

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
    state: { symbol, decimals },
  } = useCoretimeApi();

  const nextPhase = (): SalePhase => {
    const phases = Object.values(SalePhase);
    const currentIndex = phases.indexOf(currentPhase);

    // Calculate the index of the next phase
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  return (
    <Box className={styles.grid}>
      <DetailCard
        icon={ShoppingIcon}
        title='Sale details'
        items={{
          left: {
            label: 'Started at',
            value: moment(saleStartTimestamp).format('D MMM HH:mm'),
          },
          right: {
            label: 'End at',
            value: moment(saleEndTimestamp).format('D MMMM HH:mm'),
          },
        }}
      />
      <DetailCard icon={ListIcon} title='Phase details'>
        <SalePhaseCard label='Current phase' value={currentPhase} />
        <SalePhaseCard label='Upcoming phase' value={nextPhase()} />
      </DetailCard>
      <DetailCard
        icon={DollarIcon}
        title='Price details'
        items={{
          left: {
            label:
              (currentPhase as SalePhase) === SalePhase.Interlude
                ? 'Start price'
                : 'Current price',
            value: getBalanceString(currentPrice.toString(), decimals, symbol),
          },
          right: {
            label: 'Floor price',
            value: getBalanceString(
              saleInfo.price.toString(),
              decimals,
              symbol
            ),
          },
        }}
      />
    </Box>
  );
};
