import { Typography, useTheme } from '@mui/material';

import { formatBalance } from '@/utils/functions';

interface BalanceProps {
  coretimeBalance: number;
  relayBalance: number;
  symbol: string;
}

const Balance = ({ relayBalance, coretimeBalance, symbol }: BalanceProps) => {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Relay chain: ${formatBalance(
          relayBalance.toString(),
          false
        )} ${symbol}`}
      </Typography>
      <Typography sx={{ color: theme.palette.text.primary, my: '0.5em' }}>
        {`Coretime chain: ${formatBalance(
          coretimeBalance.toString(),
          false
        )} ${symbol}`}
      </Typography>
    </div>
  );
};

export default Balance;
