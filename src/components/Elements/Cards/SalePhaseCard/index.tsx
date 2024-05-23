import { Box, Tooltip, Typography, useTheme } from '@mui/material';

import { SalePhase } from '@/models';

interface SalePhaseProps {
  label: string;
  value: SalePhase;
}
export const SalePhaseCard = ({ label, value }: SalePhaseProps) => {
  const theme = useTheme();

  const tooltip = {
    [SalePhase.Interlude]:
      'During the interlude phase, renewals take place. Regular purchases cannot be made.',
    [SalePhase.Leadin]:
      'During the leadin phase, the price decreases from the start price to the floor price.',
    [SalePhase.Regular]:
      'During the fixed price phase, cores are sold for the floor price.',
  };

  return (
    <Box>
      <Typography sx={{ color: theme.palette.text.primary }}>
        {label}
      </Typography>
      <Tooltip title={tooltip[value]} arrow sx={{ fontSize: '1rem' }}>
        <Typography
          sx={{
            fontWeight: 700,
            marginRight: '0.2em',
            color: 'inherit',
            cursor: 'default',
          }}
        >
          &#9432; {value}
        </Typography>
      </Tooltip>
    </Box>
  );
};
