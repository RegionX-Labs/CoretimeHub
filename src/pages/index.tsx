import { Sync } from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  Backdrop,
  Box,
  Button,
  Card,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useBurnInfo, usePurchaseHistory } from '@/hooks';
import { getBalanceString } from '@/utils/functions';

import { PurchaseHistoryTable } from '@/components';

import Chart from '@/assets/chart.png';
import Config from '@/assets/config.png';
import Manage from '@/assets/manage.png';
import Trade from '@/assets/trade.png';
import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { ContextStatus } from '@/models';

const Home = () => {
  const theme = useTheme();
  const { push, query } = useRouter();

  const { network } = useNetwork();
  const {
    state: { decimals, symbol, apiState },
  } = useCoretimeApi();
  const {
    status,
    saleInfo: { regionBegin, coresSold, coresOffered },
    phase: { currentPrice },
  } = useSaleInfo();

  const { data: purchaseHistoryData } = usePurchaseHistory(
    network,
    regionBegin,
    0,
    1000
  );

  const renewals = purchaseHistoryData.filter(
    (item) => item.type === 'renewed'
  );
  const numRenewals = renewals.length;
  const renewalCost =
    numRenewals === 0
      ? 0
      : Math.floor(
          renewals.reduce((sum, item) => sum + item.price, 0) / numRenewals
        );

  const {
    currentBurn,
    prevBurn,
    totalBurn,
    loading: loadingBurnInfo,
  } = useBurnInfo(network);

  const formatBalance = (value: number): string => {
    return getBalanceString(value.toString(), decimals, symbol);
  };

  const buttons = [
    {
      label: 'Purchase a Core',
      image: Trade,
      url: `/purchase?network=${network}`,
      dataCy: 'btn-purchase-a-core',
    },
    {
      label: 'Manage Your Regions',
      image: Config,
      url: '/regions',
      dataCy: 'btn-manage-regions',
    },
    {
      label: 'Parachain Dashboard',
      image: Manage,
      url: '/paras',
      dataCy: 'btn-manage-paras',
    },
    {
      label: 'Track Coretime Consumption',
      image: Chart,
      url: 'https://www.polkadot-weigher.com/',
      dataCy: 'btn-track-consumption',
    },
  ];

  const sections = [
    {
      top: [
        {
          label: 'Upcoming Burn',
          value: formatBalance(currentBurn),
          icon: <WhatshotIcon />,
          dataCy: 'upcoming-burn',
        },
        {
          label: 'Previous Burn',
          value: formatBalance(prevBurn),
          icon: <WhatshotIcon />,
          dataCy: 'previous-burn',
        },
      ],
      bottom: {
        label: 'Total Burn',
        value: formatBalance(totalBurn),
        dataCy: 'total-burn',
      },
    },
    {
      top: [
        {
          label: 'Cores Sold',
          value: coresSold,
          icon: <ShoppingCartIcon />,
          dataCy: 'cores-sold',
        },
        {
          label: 'Cores On Sale',
          value: coresOffered,
          icon: <ShoppingCartIcon />,
          dataCy: 'cores-on-sale',
        },
      ],
      bottom: {
        label: 'Current Price',
        value: formatBalance(currentPrice),
        dataCy: 'current-price',
      },
    },
    {
      top: [
        {
          label: 'Renewals',
          value: numRenewals,
          icon: <Sync />,
          dataCy: 'renewals',
        },
        {
          label: 'Renewal Cost',
          value: formatBalance(renewalCost),
          icon: <MonetizationOnIcon />,
          dataCy: 'renewal-cost',
        },
      ],
      bottom: {
        label: 'Price Increase',
        value: '2%',
        dataCy: 'price-increase',
      },
    },
  ];

  return status !== ContextStatus.LOADED ||
    apiState !== ApiState.READY ||
    loadingBurnInfo ? (
    <Backdrop open>
      <CircularProgress data-cy='loading' />
    </Backdrop>
  ) : (
    <Stack direction='column' gap='1.5rem'>
      <Card
        sx={{
          padding: '1.25rem',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{
              color: theme.palette.common.black,
              fontWeight: 600,
            }}
          >
            RegionX | CoreHub
          </Typography>
          <Typography>
            Explore all the possibilities RegionX Corehub offers
          </Typography>
        </Box>
        <Stack direction='row' gap='1.25rem'>
          {sections.map(({ top, bottom }, index) => (
            <Paper
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1rem 1.25rem',
                flex: '1 0 0',
              }}
            >
              {top.map(({ icon, label, value, dataCy }, index) => (
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'
                  key={index}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: theme.palette.common.black,
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                      data-cy={dataCy}
                    >
                      {value}
                    </Typography>
                    <Typography>{label}</Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: theme.palette.primary.contrastText,
                      borderRadius: '2rem',
                      width: '44px',
                      height: '44px',
                      padding: '10px',
                    }}
                  >
                    {icon}
                  </Box>
                </Stack>
              ))}
              <Box
                sx={{
                  background: theme.palette.primary.contrastText,
                  borderRadius: '0.25rem',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                }}
              >
                <Typography sx={{ color: theme.palette.common.black }}>
                  {bottom.label}
                </Typography>
                <Typography
                  sx={{ color: theme.palette.common.black, fontWeight: 600 }}
                  data-cy={bottom.dataCy}
                >
                  {bottom.value}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Card>
      <Stack direction='row' gap='1rem'>
        {buttons.map(({ label, image, url, dataCy }, index) => (
          <Button
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.5rem',
              background: theme.palette.common.white,
              color: theme.palette.common.black,
              borderRadius: '0.75rem',
              py: '1.25rem',
              flex: '1 0 0',
            }}
            variant='outlined'
            onClick={() => push({ pathname: url, query })}
            data-cy={dataCy}
          >
            <Image src={image} width={32} height={32} alt='' />
            {label}
          </Button>
        ))}
      </Stack>
      {status === ContextStatus.LOADED && (
        <Card sx={{ padding: '1.5rem' }} data-cy='purchase-history-table'>
          <Stack direction='column' gap='1rem'>
            <Box>
              <Typography
                variant='subtitle1'
                sx={{ color: theme.palette.common.black }}
              >
                Purchase History
              </Typography>
              <Typography
                variant='subtitle2'
                sx={{ color: theme.palette.text.primary }}
              >
                Get an insight into all purchases and renewals made during the
                current bulk period
              </Typography>
            </Box>
            <PurchaseHistoryTable data={purchaseHistoryData} />
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default Home;
