import { LoadingButton } from '@mui/lab';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { useInkathon } from '@scio-labs/use-inkathon';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { getBlockTimestamp, parseHNString, sendTx } from '@/utils/functions';

import { Progress, SaleInfoGrid, Section } from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { SalePhase } from '@/models';

import {
  getCurrentPhase,
  getCurrentPrice,
  getSaleEndInBlocks,
  getSaleProgress,
  getSaleStartInBlocks,
} from '../utils/sale/utils';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<SalePhase | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [saleEnd, setSaleEnd] = useState<number | null>(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(
    null
  );
  const [progress, setProgress] = useState<number | null>(0);
  const [saleSections, setSaleSections] = useState<Section[]>([]);

  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const { activeSigner, activeAccount } = useInkathon();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const { saleInfo, config, loading } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const fetchCurrentPhase = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = (await api.query.system.number()).toJSON() as number;
      const lastCommittedTimeslice = parseHNString(
        (
          (await api.query.broker.status()).toHuman() as any
        ).lastCommittedTimeslice.toString()
      );

      const _saleStart = getSaleStartInBlocks(saleInfo, config);
      const _saleEnd = getSaleEndInBlocks(
        saleInfo,
        blockNumber,
        lastCommittedTimeslice
      );

      setCurrentBlockNumber(blockNumber);
      setSaleEnd(_saleEnd);
      getBlockTimestamp(api, _saleEnd).then((value) =>
        setSaleEndTimestamp(value)
      );

      const progress = getSaleProgress(
        saleInfo,
        config,
        blockNumber,
        lastCommittedTimeslice
      );
      setProgress(progress);

      setCurrentPhase(getCurrentPhase(saleInfo, blockNumber));

      const saleDuration = _saleEnd - _saleStart;

      setSaleSections([
        { name: 'Interlude', value: 0 },
        {
          name: 'Leadin phase',
          value: (config.interludeLength / saleDuration) * 100,
        },
        {
          name: 'Fixed price phase',
          value:
            ((config.interludeLength + config.leadinLength) / saleDuration) *
            100,
        },
      ]);
    },
    [saleInfo, config]
  );

  const fetchCurrentPrice = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = (await api.query.system.number()).toJSON() as number;

      const price = getCurrentPrice(saleInfo, blockNumber);
      setCurrentPrice(price);
    },
    [saleInfo]
  );

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;

    const txPurchase = api.tx.broker.purchase(currentPrice);

    sendTx(txPurchase, activeAccount.address, activeSigner, {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo(`In Block`),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Transaction successful');
        fetchRegions();
      },
      error: () => {
        toastError(`Failed to purchase the region`);
      },
    });
  };

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;

    fetchCurrentPhase(api);
    fetchCurrentPrice(api);
  }, [api, apiState, fetchCurrentPrice, fetchCurrentPhase]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Purchase a core directly from the Coretime chain
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Purchase a core
          </Typography>
        </Box>
      </Box>
      <Box>
        {loading ||
        !currentPhase ||
        !saleEnd ||
        !currentBlockNumber ||
        !progress ||
        !saleEndTimestamp ? (
          <>
            <Typography variant='h5' align='center'>
              Connect your wallet
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <SaleInfoGrid
                currentPhase={currentPhase}
                currentPrice={currentPrice}
                saleInfo={saleInfo}
                saleEnd={saleEnd}
              />
            </Box>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h6'>Current Bulk Sale:</Typography>
                <Typography>Ends {timeAgo.format(saleEndTimestamp)}</Typography>
              </Box>
              <Box sx={{ marginTop: '1em' }}>
                <Progress progress={progress} sections={saleSections} />
              </Box>
            </Box>
            <Box
              sx={{
                marginTop: '4em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Link href='/regions'>
                <Button variant='outlined'>Manage your regions</Button>
              </Link>
              <LoadingButton
                onClick={purchase}
                variant='contained'
                loading={working}
              >
                Purchase
              </LoadingButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
