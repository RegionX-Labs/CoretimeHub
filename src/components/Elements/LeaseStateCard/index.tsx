import { LinearProgress, Stack, Typography } from '@mui/material';
import { humanizer } from 'humanize-duration';

import { leases } from '@/chaindata';
import { useNetwork } from '@/contexts/network';
import { LeaseState } from '@/models';

interface LeaseStateProps {
  paraId: number;
  height: number;
}

export const LeaseStateCard = ({ paraId, height }: LeaseStateProps) => {
  const formatDuration = humanizer({ units: ['w', 'd'], round: true });
  const { network } = useNetwork();

  const chainData: LeaseState[] =
    (leases as Record<string, LeaseState[]>)[network.toString()] ?? [];
  const chain = chainData.find((item) => item.paraId === paraId);

  if (!chain) return <></>;

  const { until } = chain;

  if (height > until) return <></>;

  return (
    <Stack direction='column' gap='0.5rem' alignItems='center'>
      <Typography>
        {`Expires in ${formatDuration((until - height) * 6 * 1000)}`}
      </Typography>
      <LinearProgress
        sx={{
          width: '15rem',
          height: '0.75rem',
        }}
        variant='determinate'
        value={(height / until) * 100}
        color='info'
      />
    </Stack>
  );
};
