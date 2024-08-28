import { Box, Button, CircularProgress, useTheme } from '@mui/material';
import { useState } from 'react';

import { getBalanceString, getTimeStringShort } from '@/utils/functions';

import { PriceModal, SalePhaseCard } from '@/components';

import DollarIcon from '@/assets/dollar.png';
import ListIcon from '@/assets/list.png';
import ShoppingIcon from '@/assets/shopping.png';
import { useCoretimeApi } from '@/contexts/apis';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

import { DetailCard } from './DetailCard';
import styles from './index.module.scss';

export const SaleInfoPanel = () => {
  const theme = useTheme();

  const {
    state: { symbol, decimals },
  } = useCoretimeApi();

  const {
    phase: { currentPhase, currentPrice, endpoints: saleEndpoints },
    saleInfo,
  } = useSaleInfo();

  const [priceModalOpen, openPriceModal] = useState(false);

  const nextPhase = (phase: SalePhase): SalePhase => {
    const phases = Object.values(SalePhase);
    const currentIndex = phases.indexOf(phase);

    // Calculate the index of the next phase
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  const onAnalyze = () => {
    openPriceModal(true);
  };

  const formatBalance = (x: number) => getBalanceString(x.toString(), decimals, symbol);

  return (
    <>
      <Box className={styles.grid} data-cy='sale-info'>
        <DetailCard
          icon={ShoppingIcon}
          title='Sale details'
          items={{
            left: {
              label: 'Leadin start',
              value: getTimeStringShort(saleEndpoints.leadin.start),
            },
            right: {
              label: 'Sale end',
              value: getTimeStringShort(saleEndpoints.fixed.end),
            },
          }}
        />
        <DetailCard icon={ListIcon} title='Phase details'>
          <SalePhaseCard
            label='Current phase'
            value={currentPhase}
            cyLabel='txt-current-phase'
            loading={currentPrice === undefined}
          />
          <SalePhaseCard
            label='Upcoming phase'
            value={nextPhase(currentPhase)}
            cyLabel='txt-upcoming-phase'
            loading={currentPrice === undefined}
          />
        </DetailCard>
        <DetailCard
          icon={DollarIcon}
          title='Price details'
          items={{
            left: {
              label: currentPhase === SalePhase.Interlude ? 'Start price' : 'Current price',
              value:
                currentPrice !== undefined ? (
                  formatBalance(currentPrice)
                ) : (
                  <CircularProgress data-cy='loading-current-price' size={16} />
                ),
            },
            right: {
              label: 'Floor price',
              value: saleInfo.price !== undefined ? formatBalance(saleInfo.price) : '---',
            },
          }}
          button={
            <Button
              onClick={onAnalyze}
              size='small'
              variant='text'
              className={styles.buttonWrapper}
              sx={{
                background: '#e8eff7',
                color: theme.palette.text.primary,
              }}
              data-cy='btn-analyze-price'
            >
              Analyze
            </Button>
          }
        />
      </Box>
      <PriceModal
        open={priceModalOpen}
        onClose={() => openPriceModal(false)}
        data-cy='price-modal'
      />
    </>
  );
};
