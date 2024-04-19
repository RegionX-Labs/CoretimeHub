import { Typography, useTheme } from '@mui/material';
import { formatBalance } from '@/utils/functions';

interface BalanceProps {
  coretimeBalance: Number,
  relayBalance: Number,
};

const Balance = ({ relayBalance, coretimeBalance }: BalanceProps) => {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Relay chain: ${formatBalance(relayBalance.toString(), false)} ROC`}
      </Typography>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Coretime chain: ${formatBalance(coretimeBalance.toString(), false)} ROC`}
      </Typography>
    </div>
  );
};

export default Balance;
