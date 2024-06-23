import { Sync } from '@mui/icons-material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  Box,
  Button,
  Card,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { usePurchaseHistory } from '@/hooks';

import { PurchaseHistoryTable } from '@/components';

import Chart from '@/assets/chart.png';
import Config from '@/assets/config.png';
import Manage from '@/assets/manage.png';
import Trade from '@/assets/trade.png';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { ContextStatus } from '@/models';

const Home = () => {
  const theme = useTheme();
  const { network } = useNetwork();
  const { push, query } = useRouter();
  const {
    status,
    saleInfo: { regionBegin },
  } = useSaleInfo();

  const { data: purchaseHistoryData } = usePurchaseHistory(
    network,
    regionBegin,
    0,
    1000
  );

  const buttons = [
    {
      label: 'Purchase a Core',
      image: Trade,
      url: `/purchase?network=${network}`,
    },
    {
      label: 'Manage Your Regions',
      image: Config,
      url: '/regions',
    },
    {
      label: 'Parachain Dashboard',
      image: Manage,
      url: '/paras',
    },
    {
      label: 'Track Coretime Consumption',
      image: Chart,
      url: 'https://www.polkadot-weigher.com/',
    },
  ];

  const sections = [
    {
      top: [
        {
          label: 'Upcoming Burn',
          value: '600 KSM', // We can obtain this by summing the amount spent in the current sale(we are already reading this data from Subscan for the Purchase History).
          icon: <WhatshotIcon />,
        },
        {
          label: 'Previous Burn',
          value: '500 KSM', // Same way as for 'Upcoming Burn', but we read the data from the previous sale.
          icon: <WhatshotIcon />,
        },
      ],
      bottom: {
        label: 'Total Burn',
        value: '??? KSM', // Would it be reasonably efficient to add up the sum of tokens spent in each sale?
      },
    },
    {
      top: [
        {
          label: 'Cores Sold',
          value: '10', // TODO: Fetch data from chain (Can be done the same way as on the purchase page)
          icon: <ShoppingCartIcon />,
        },
        {
          label: 'Cores On Sale',
          value: '15', // TODO: Fetch data from chain (Can be done the same way as on the purchase page)
          icon: <ShoppingCartIcon />,
        },
      ],
      bottom: {
        label: 'Current Price',
        value: '20.5 KSM', // TODO: Fetch current price.
      },
    },
    {
      top: [
        {
          label: 'Renewals',
          value: '10',
          icon: <Sync />,
        },
        {
          label: 'Renewal Cost',
          value: '10 KSM',
          icon: <MonetizationOnIcon />,
        },
      ],
      bottom: {
        label: 'Price Increase',
        value: '2%',
      },
    },
  ];

  return (
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
              {top.map(({ icon, label, value }, index) => (
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
                >
                  {bottom.value}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Card>
      <Stack direction='row' gap='1rem'>
        {buttons.map(({ label, image, url }, index) => (
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
            variant='text'
            onClick={() => push({ pathname: url, query })}
          >
            <Image src={image} width={32} height={32} alt='' />
            {label}
          </Button>
        ))}
      </Stack>
      {status === ContextStatus.LOADED && (
        <Card sx={{ padding: '1.5rem' }}>
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
