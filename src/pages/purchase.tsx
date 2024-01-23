import DataCardComponent from '@/components/elements/DataCard';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';
import { formatBalance, leadinFactorAt, parseHNString } from '@/utils/functions';
import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

const Purchase = () => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState(SalePhase.Interlude);
  const [currentPrice, setCurrentPrice] = useState(0);

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  useEffect(() => {
    fetchCurrentPhase();
    fetchCurreentPrice();
  }, [api, apiState, saleInfo]);

  const fetchCurrentPhase = async () => {
    if (!api || apiState !== ApiState.READY) return;
    const blockNumber: any = (await api.query.system.number()).toHuman();

    if (saleInfo.saleStart > parseHNString(blockNumber.toString())) {
      setCurrentPhase(SalePhase.Interlude)
    } else if (saleInfo.saleStart + saleInfo.leadinLength > parseHNString(blockNumber.toString())) {
      setCurrentPhase(SalePhase.Leadin)
    } else {
      setCurrentPhase(SalePhase.Regular)
    }
  }

  const fetchCurreentPrice = async () => {
    if (!api || apiState !== ApiState.READY) return;
    const blockNumber = parseHNString(((await api.query.system.number()).toHuman() as any).toString());

    console.log(saleInfo);
    const saleStart = parseHNString(saleInfo.saleStart.toString());
    const leadinLength = parseHNString(saleInfo.leadinLength.toString());

    const num = Math.min(blockNumber - saleStart, leadinLength);
    const through = num / saleInfo.leadinLength;
    setCurrentPrice(leadinFactorAt(through) * parseHNString(saleInfo.price.toString()));
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
                marginTop: '2em',
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Box>
                <DataCardComponent
                  title={`Cores offered: ${saleInfo.coresOffered}`}
                  content='Number of cores which are been offered for sale.'
                />
              </Box>
              <Box>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
