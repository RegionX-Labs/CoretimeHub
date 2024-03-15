import { LoadingButton } from '@mui/lab';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useInkathon } from '@scio-labs/use-inkathon';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import {
  formatBalance,
  getBlockTimestamp,
  leadinFactorAt,
  parseHNString,
} from '@/utils/functions';

import Progress, { Section } from '@/components/elements/Progress';
import SaleInfoGrid from '@/components/elements/SaleInfo';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { SalePhase } from '@/models';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  const [balance, setBalance] = useState<number>(0);
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
  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();

  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const { saleInfo, config, loading } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const { fetchRegions } = useRegions();

  const fetchBalance = useCallback(
    async (api: ApiPromise, activeAccount: InjectedAccount) => {
      const account = (
        await api.query.system.account(activeAccount.address)
      ).toHuman() as any;
      const balance = parseHNString(account.data.free.toString());
      setBalance(balance);
      if (balance == 0) {
        toastWarning(
          'The selected account does not have any ROC tokens on the Coretime chain.'
        );
      }
    },
    [toastWarning]
  );

  const fetchCurrentPhase = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = parseHNString(
        ((await api.query.system.number()).toHuman() as any).toString()
      );
      const lastCommittedTimeslice = parseHNString(
        (
          (await api.query.broker.status()).toHuman() as any
        ).lastCommittedTimeslice.toString()
      );
      const end =
        blockNumber + 80 * (saleInfo.regionBegin - lastCommittedTimeslice);

      setCurrentBlockNumber(blockNumber);
      setSaleEnd(end);
      getBlockTimestamp(api, end).then((value) => setSaleEndTimestamp(value));

      const saleDuration = end - saleInfo.saleStart;
      const elapsed =
        blockNumber - (saleInfo.saleStart - config.interludeLength);

      setProgress(
        (elapsed / (end - (saleInfo.saleStart + config.interludeLength))) * 100
      );

      if (saleInfo.saleStart > blockNumber) {
        setCurrentPhase(SalePhase.Interlude);
      } else if (saleInfo.saleStart + saleInfo.leadinLength > blockNumber) {
        setCurrentPhase(SalePhase.Leadin);
      } else {
        setCurrentPhase(SalePhase.Regular);
      }

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

  const fetchCurreentPrice = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = parseHNString(
        ((await api.query.system.number()).toHuman() as any).toString()
      );

      const num = Math.min(
        blockNumber - saleInfo.saleStart,
        saleInfo.leadinLength
      );
      const through = num / saleInfo.leadinLength;
      setCurrentPrice(
        Number((leadinFactorAt(through) * saleInfo.price).toFixed())
      );
    },
    [saleInfo]
  );

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;
    const txPurchase = api.tx.broker.purchase(currentPrice);

    try {
      setWorking(true);
      await txPurchase.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Transaction successful');
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to partition the region`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to partition the region. ${e}`);
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;
    fetchCurrentPhase(api);
    fetchCurreentPrice(api);
  }, [api, apiState, fetchCurreentPrice, fetchCurrentPhase]);

  useEffect(() => {
    if (!api || apiState !== ApiState.READY || !activeAccount) return;
    fetchBalance(api, activeAccount);
  }, [api, apiState, activeAccount, fetchBalance]);

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
        <Typography variant='h6' sx={{ color: theme.palette.text.primary }}>
          {`Your balance: ${formatBalance(balance.toString(), false)} ROC`}
        </Typography>
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
