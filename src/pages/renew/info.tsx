import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { humanizer } from 'humanize-duration';
import { useEffect, useState } from 'react';

import { RenewableParachain } from '@/hooks';
import { getBalanceString, timesliceToTimestamp } from '@/utils/functions';
import theme from '@/utils/muiTheme';

import { Banner } from '@/components';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { useSaleInfo } from '@/contexts/sales';
import { ContextStatus } from '@/models';

interface RenewableParaInfoProps {
  parachain: RenewableParachain;
}

export const RenewableParaInfo = ({ parachain }: RenewableParaInfoProps) => {
  const [expiryTimestamp, setExpiryTimestamp] = useState(0);

  const { saleInfo, saleStatus, status: saleInfoStatus, phase } = useSaleInfo();

  const {
    state: { api: relayApi, isApiReady: isRelayReady },
  } = useRelayApi();
  const {
    state: { api: coretimeApi, isApiReady: isCoretimeReady, decimals, symbol },
    timeslicePeriod,
  } = useCoretimeApi();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getExpiry = async () => {
      setLoading(true);
      if (
        !coretimeApi ||
        !isCoretimeReady ||
        !relayApi ||
        !isRelayReady ||
        !parachain ||
        saleInfoStatus !== ContextStatus.LOADED
      )
        return;

      const now = await timesliceToTimestamp(
        relayApi,
        saleStatus.lastCommittedTimeslice,
        timeslicePeriod
      );
      const expiry = await timesliceToTimestamp(relayApi, parachain.when, timeslicePeriod);

      if (expiry - now < 0) {
        setExpiryTimestamp(phase.endpoints.fixed.end - now);
      } else {
        setExpiryTimestamp(expiry - now);
      }

      setLoading(false);
    };

    getExpiry();
  }, [
    coretimeApi,
    isCoretimeReady,
    relayApi,
    isRelayReady,
    timeslicePeriod,
    saleInfoStatus,
    saleStatus,
    phase,
  ]);

  return (
    <>
      <Stack direction='column' gap='1.5rem' margin='1rem 0' width='75%' sx={{ mx: 'auto' }}>
        <ParachainInfo parachain={parachain} expiryTimestamp={expiryTimestamp} expiryLoading={loading} />
        {/* If all cores are sold warn the user: */}
        {saleInfo.coresSold === saleInfo.coresOffered && (
          <Banner
            content={
              'No more cores are on sale! Attempting to renew will fail. To avoid these kind of \
                  issues in the future, please renew during the interlude phase. '
            }
            link={{
              title: 'Renewal FAQ',
              href: 'https://docs.regionx.tech/docs/faq/renewal-questions',
            }}
            severity='warning'
          />
        )}
        {/* If not all cores are sold inform the user to renew: */}
        {saleInfo.coresSold < saleInfo.coresOffered && (
          <Banner
            content={
              'It is highly recommended to renew during the interlude phase, as doing so guarantees \
                  that the core will be available for renewal. '
            }
            link={{
              title: 'Renewal FAQ',
              href: 'https://docs.regionx.tech/docs/faq/renewal-questions',
            }}
            severity='info'
          />
        )}
      </Stack>
    </>
  );
};

interface ParachainInfoProps {
  parachain: RenewableParachain;
  expiryTimestamp: number;
  expiryLoading: boolean;
}

const ParachainInfo = ({ parachain, expiryTimestamp, expiryLoading }: ParachainInfoProps) => {
  const {
    state: { decimals, symbol },
  } = useCoretimeApi();

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  return (
    <>
      <Stack
        direction='column'
        padding='1rem'
        mt={'1rem'}
        gap='0.5rem'
        border='1px solid'
        borderColor={theme.palette.grey[400]}
        borderRadius='1rem'
      >
        <Property property='Core number:' value={parachain.core.toString()} />
        <Property
          tooltip='The parachain will stop with block production once it expires.'
          property='Expiry in:'
          value={expiryLoading ? '...' : formatDuration(expiryTimestamp)}
        />
        <Property
          property='Renewal price: '
          value={getBalanceString(parachain.price.toString(), decimals, symbol)}
        />
      </Stack>
    </>
  );
};

interface PropertyProps {
  property: string;
  value: string;
  tooltip?: string;
}

const Property = ({ property, value, tooltip }: PropertyProps) => {
  return (
    <Box display='flex' justifyContent='space-between' mx='1rem'>
      <Typography fontWeight='light' color='black'>
        {property}
      </Typography>
      <Box display='flex'>
        {tooltip && (
          <Tooltip title={tooltip} arrow sx={{ fontSize: '1rem' }}>
            <Typography color='black' mr='.5rem' sx={{ cursor: 'default' }}>
              &#9432;
            </Typography>
          </Tooltip>
        )}
        <Typography fontWeight='bold' color='black'>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};
