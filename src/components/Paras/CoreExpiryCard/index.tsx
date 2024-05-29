import { Stack, Typography, useTheme } from '@mui/material';
import { humanizer } from 'humanize-duration';

import { useRenewableParachains } from '@/hooks';

import { useCoretimeApi } from '@/contexts/apis';
import { RELAY_CHAIN_BLOCK_TIME } from '@/models';

interface CoreExpiryProps {
  paraId: number;
  height: number;
}

export const CoreExpiryCard = ({ paraId, height }: CoreExpiryProps) => {
  const theme = useTheme();

  const { parachains } = useRenewableParachains();
  const { timeslicePeriod } = useCoretimeApi();

  const formatDuration = humanizer({ units: ['w', 'd'], round: true });

  const chain = parachains.find((item) => item.paraId === paraId);

  if (!chain) return <></>;

  const { when, core } = chain;
  const until = when * timeslicePeriod;

  if (height > until) return <></>;

  return (
    <Stack direction='column' gap='0.5rem' alignItems='start'>
      <Typography
        sx={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}
      >
        {`Core #${core} expires in ${formatDuration(
          (until - height) * RELAY_CHAIN_BLOCK_TIME
        )}`}
      </Typography>
    </Stack>
  );
};
