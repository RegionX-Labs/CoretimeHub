import theme from "@/utils/muiTheme";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { RenewableParachain } from "@/hooks";
import { getBalanceString, timesliceToTimestamp } from "@/utils/functions";
import { useEffect, useState } from "react";
import { useCoretimeApi, useRelayApi } from "@/contexts/apis";
import { useSaleInfo } from "@/contexts/sales";
import { ContextStatus } from "@/models";
import { Banner } from "@/components";
import { humanizer } from "humanize-duration";

interface RenewableParaInfoProps {
  parachain: RenewableParachain,
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

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

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
      const expiry = await timesliceToTimestamp(
        relayApi,
        parachain.when,
        timeslicePeriod
      );

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
      <Stack direction='column' gap={1} margin='1rem 0' width='75%' sx={{ mx: 'auto' }}>
        <Stack
          direction='column'
          padding='1rem'
          mt={'2rem'}
          gap='0.5rem'
          border='1px solid'
          borderColor={theme.palette.grey[400]}
          borderRadius='1rem'
        >
          <Property property='Core number:' value={parachain.core} />
          <Property
            tooltip='The parachain will stop with block production once it expires.'
            property='Expiry in:'
            value={loading ? '...' : formatDuration(expiryTimestamp)}
          />
          <Property
            property='Renewal price: '
            value={getBalanceString(parachain.price.toString(), decimals, symbol)}
          />
        </Stack>
      </Stack>
      {saleInfo.coresSold === saleInfo.coresOffered && (
        <Stack width='75%' margin='0 auto' mt='1rem'>
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
        </Stack>
      )}
      {/* If not all cores are sold inform the user: */}
      {saleInfo.coresSold < saleInfo.coresOffered && (
        <Stack width='75%' margin='0 auto' mt='1rem'>
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
        </Stack>
      )}
    </>
  )
}

interface PropertyProps {
  property: string;
  value: any;
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
