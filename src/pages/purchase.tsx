import BorderLinearProgress from '@/components/elements/BorderLinearProgress';
import DataCardComponent from '@/components/elements/DataCard';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { SalePhase } from '@/models';
import { formatBalance, leadinFactorAt, parseHNString } from '@/utils/functions';
import { LoadingButton } from '@mui/lab';
import { Box, Typography, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(SalePhase.Interlude);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [saleEnd, setSaleEnd] = useState(0);
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0);

  const { activeSigner, activeAccount } = useInkathon();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const {
    config: { timeslicePeriod },
  } = useRegions();

  useEffect(() => {
    fetchCurrentPhase();
    fetchCurreentPrice();
  }, [api, apiState, saleInfo]);

  const fetchCurrentPhase = async () => {
    if (!api || apiState !== ApiState.READY) return;
    const blockNumber = parseHNString(((await api.query.system.number()).toHuman() as any).toString());
    console.log(saleInfo);
    console.log(saleInfo.saleStart + saleInfo.leadinLength);
    const saleEnd = saleInfo.saleStart + (timeslicePeriod * (saleInfo.regionEnd - saleInfo.regionBegin));
    console.log(saleEnd);

    setCurrentBlockNumber(blockNumber);
    setSaleEnd(saleEnd);

    if (saleInfo.saleStart > currentBlockNumber) {
      setCurrentPhase(SalePhase.Interlude)
    } else if (saleInfo.saleStart + saleInfo.leadinLength > currentBlockNumber) {
      setCurrentPhase(SalePhase.Leadin)
    } else {
      setCurrentPhase(SalePhase.Regular)
    }
  }

  const fetchCurreentPrice = async () => {
    if (!api || apiState !== ApiState.READY) return;
    const blockNumber = parseHNString(((await api.query.system.number()).toHuman() as any).toString());

    const num = Math.min(blockNumber - saleInfo.saleStart, saleInfo.leadinLength);
    const through = num / saleInfo.leadinLength;
    setCurrentPrice(Number((leadinFactorAt(through) * saleInfo.price).toFixed()));
  }

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner) return;
    console.log(currentPrice);
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
  }

  return (
    <Box>
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
      <Box>
        {loading ? (
          <>
            <Typography variant='h4' align='center'>
              Connect your wallet
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                marginTop: '2em',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Typography variant='h6'>
                {`Current phase: ${currentPhase}`}
              </Typography>
              <Typography variant='h6'>
                {`Current price: ${formatBalance(currentPrice)}`} ROC
              </Typography>
            </Box>
            <Box
              sx={{
                marginTop: '4em',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Box>
                <DataCardComponent
                  title={`Cores offered: ${saleInfo.coresOffered}`}
                  content='Number of cores which are offered for sale.'
                />
              </Box>
              <Box sx={{ borderLeft: "1px solid black", borderRight: "1px solid black" }}>
                <DataCardComponent
                  title={`Cores sold: ${saleInfo.coresSold}`}
                  content='Number of cores which have been sold; never more than cores offered.'
                />
              </Box>
              <Box>
                <DataCardComponent
                  title={`Ideal cores sold: ${saleInfo.idealCoresSold}`}
                  content='The number of cores ideally sold. Selling this amount would result in no change to the price for the next sale.'
                />
              </Box>
            </Box>
            <Box sx={{
              marginTop: '4em',
            }}>
              <BorderLinearProgress variant="determinate" value={(currentBlockNumber / saleEnd) * 100} />
            </Box>
            <Box
              sx={{
                marginTop: '2em',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
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
