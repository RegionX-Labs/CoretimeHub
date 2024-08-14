import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';
import { isNewPricing } from '@/utils/sale';

import {
  Balance,
  Banner,
  CoreDetailsPanel,
  ProgressButton,
  SaleInfoPanel,
  SalePhaseInfoPanel,
} from '@/components';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { ContextStatus, SalePhase } from '@/models';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);

  const {
    state: { activeSigner, activeAccount },
  } = useAccounts();
  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();

  const {
    saleInfo,
    status,
    phase: { currentPhase, currentPrice },
    fetchSaleInfo,
  } = useSaleInfo();
  const {
    state: { api, apiState, height, symbol, decimals },
  } = useCoretimeApi();
  const router = useRouter();
  const { network } = useNetwork();

  const { fetchRegions } = useRegions();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const onPurchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    if (currentPhase === SalePhase.Interlude) {
      toastWarning(
        'Sales start after the interlude period ends. Purchases can then be made.'
      );
      return;
    }

    if (currentPrice === undefined) {
      toastWarning('Wait for the price to be fetched');
      return;
    }

    const txPurchase = api.tx.broker.purchase(currentPrice);

    submitExtrinsicWithFeeInfo(
      symbol,
      decimals,
      txPurchase,
      activeAccount.address,
      activeSigner,
      {
        ready: () => {
          setWorking(true);
          toastInfo('Transaction was initiated');
        },
        inBlock: () => toastInfo('In Block'),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Transaction successful');
          fetchSaleInfo();
          fetchRegions();
        },
        fail: () => {
          toastError('Failed to purchase a core');
        },
        error: (e) => {
          toastError(`Failed to purchase a core. ${e}`);
          setWorking(false);
        },
      }
    );
  };

  const onManage = () => {
    router.push({
      pathname: '/regions',
      query: { network },
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Purchase a core
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Buy a core straight from the Coretime chain
          </Typography>
        </Box>
        <Balance ctBalance />
      </Box>
      <Box mt={'.5rem'}>
        <Banner
          content={
            isNewPricing(height, network)
              ? 'Learn about the new Coretime pricing model: '
              : 'Learn about the new Coretime pricing model coming to Kusama soon: '
          }
          link={{
            title: 'Agile Coretime Pricing Explained',
            href: 'https://grillapp.net/12935/agile-coretime-pricing-explained-166522?ref=12935',
          }}
          severity='info'
        />
      </Box>
      <Box>
        {status !== ContextStatus.LOADED ? (
          <Backdrop open data-cy='loading'>
            <CircularProgress />
          </Backdrop>
        ) : (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <SaleInfoPanel />
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <CoreDetailsPanel saleInfo={saleInfo} />
              <SalePhaseInfoPanel />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'space-between',
              }}
            >
              <Button
                size='small'
                variant='outlined'
                sx={{
                  bgcolor: theme.palette.common.white,
                  padding: '0.5rem 0.75rem',
                  borderRadius: 100,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
                onClick={onManage}
                data-cy='btn-manage-regions'
              >
                Manage your regions
              </Button>
              <ProgressButton
                onClick={onPurchase}
                loading={working}
                label='Purchase Core'
                data-cy='btn-purchase-core'
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
