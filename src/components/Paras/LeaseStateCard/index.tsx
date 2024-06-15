import { Stack, Typography } from '@mui/material';
import { humanizer } from 'humanize-duration';

import { leases } from '@/chaindata';
import { useNetwork } from '@/contexts/network';
import { LeaseState, RELAY_CHAIN_BLOCK_TIME } from '@/models';

interface LeaseStateProps {
  paraId: number;
  height: number;
}

export const LeaseStateCard = ({ paraId, height }: LeaseStateProps) => {
  const formatDuration = humanizer({
    units: ['w', 'd', 'h'],
    round: true,
    largest: 2,
  });
  const { network } = useNetwork();

  const chainData: LeaseState[] =
    (leases as Record<string, LeaseState[]>)[network.toString()] ?? [];
  const chain = chainData.find((item) => item.paraId === paraId);

  if (!chain) return <></>;

  const { until } = chain;

  if (height > until) return <></>;

  return (
    <Stack direction='column' gap='0.5rem' alignItems='start'>
      <Typography>
        {`Lease expires in ${formatDuration(
          (until - height) * RELAY_CHAIN_BLOCK_TIME
        )}`}
      </Typography>
    </Stack>
  );
};
