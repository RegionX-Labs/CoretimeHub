import { Box, Typography, useTheme } from '@mui/material';

import { formatBalance } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';

import styles from './index.module.scss';

interface BalanceProps {
  coretimeBalance: number;
  relayBalance: number;
  symbol: string;
}

const Balance = ({ relayBalance, coretimeBalance, symbol }: BalanceProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount },
  } = useAccounts();

  const items = [
    {
      label: 'Relay Chain',
      value: relayBalance,
    },
    {
      label: 'Coretime Chain',
      value: coretimeBalance,
    },
  ];

  return activeAccount ? (
    <Box className={styles.container}>
      {items.map(({ label, value }, index) => (
        <Box key={index} className={styles.balanceItem}>
          <Typography sx={{ color: theme.palette.text.primary }}>
            {label}
          </Typography>
          <Box
            sx={{
              bgcolor: theme.palette.common.white,
              color: theme.palette.common.black,
            }}
            className={styles.balanceWrapper}
          >
            {`${formatBalance(value.toString(), false)} ${symbol}`}
          </Box>
        </Box>
      ))}
    </Box>
  ) : (
    <></>
  );
};

export default Balance;
