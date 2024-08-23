import { Box, CircularProgress, Tooltip, Typography, useTheme } from '@mui/material';

import { SalePhase } from '@/models';

interface SalePhaseProps {
  loading: boolean;
  label: string;
  value: SalePhase;
  cyLabel?: string;
}
export const SalePhaseCard = ({ label, loading, value, cyLabel }: SalePhaseProps) => {
  const theme = useTheme();

  const tooltip = {
    [SalePhase.Interlude]:
      'During the interlude phase, renewals take place. Regular purchases cannot be made.',
    [SalePhase.Leadin]:
      'During the leadin phase, the price decreases from the start price to the floor price.',
    [SalePhase.Regular]: 'During the fixed price phase, cores are sold for the floor price.',
  };

  return (
    <Box>
      <Typography sx={{ color: theme.palette.text.primary }}>{label}</Typography>
      <Tooltip title={tooltip[value]} arrow sx={{ fontSize: '1rem' }}>
        {loading ? (
          <CircularProgress size={16} />
        ) : (
          <Typography
            sx={{
              fontWeight: 700,
              marginRight: '0.2em',
              color: 'inherit',
              cursor: 'default',
            }}
            data-cy={cyLabel}
          >
            &#9432; {value}
          </Typography>
        )}
      </Tooltip>
    </Box>
  );
};
