import { Tooltip, Typography } from '@mui/material';

import { ParaState } from '@/models';

export const ParaStateCard = ({ state }: { state: ParaState }) => {
  const styles = {
    [ParaState.RESERVED]: {
      color: '#008000',
      background: 'rgba(0, 128, 0, 0.1)',
      tooltip:
        'A parachain with a reserved para ID that is not yet registered.',
    },
    [ParaState.ONBOARDING]: {
      color: '#7472D8',
      background: 'rgba(116, 114, 216, 0.1)',
      tooltip: 'A parachain awaiting code validation.',
    },
    [ParaState.ONDEMAND_PARACHAIN]: {
      color: '#2D57C3',
      background: 'rgba(45, 87, 195, 0.1)',
      tooltip: 'Parachain that utilizes on-demand coretime.',
    },
    [ParaState.IDLE_PARA]: {
      color: '#008000',
      background: 'rgba(0, 128, 0, 0.1)',
      tooltip: 'A parachain currently not producing blocks.',
    },
    [ParaState.ACTIVE_PARA]: {
      color: '#9F53FF',
      background: '#EDDFFF',
      tooltip: 'An active parachain that is able to produce blocks.',
    },
    [ParaState.IN_WORKPLAN]: {
      color: '#5e73ff',
      background: '#e1e7ff',
      tooltip: 'Parachain scheduled for execution',
    },
    [ParaState.LEASE_HOLDING]: {
      color: '#5e9b53',
      background: '#f1ffe1',
      tooltip:
        'Parachain that secured coretime through the legacy slot auction model.',
    },
    [ParaState.SYSTEM]: {
      color: '#ff7f53',
      background: '#ffe9df',
      tooltip: 'Parachain responsible for core Polkadot protocol features.',
    },
  };
  return (
    <Tooltip title={styles[state].tooltip} arrow>
      <Typography
        sx={{
          color: styles[state].color,
          bgcolor: styles[state].background,
          padding: '0.5rem 1rem',
          borderRadius: '1rem',
          border: `1px solid ${styles[state].color}`,
          width: '12.5rem',
          textAlign: 'center',
          height: 'fit-content',
          cursor: 'default',
        }}
      >
        {state}
      </Typography>
    </Tooltip>
  );
};
