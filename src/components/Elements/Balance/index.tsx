import { Box, Typography, useTheme } from '@mui/material';

import { getBalanceString } from '@/utils/functions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';

import styles from './index.module.scss';

interface BalanceProps {
  coretimeBalance: number;
  relayBalance: number;
}

export const Balance = ({ relayBalance, coretimeBalance }: BalanceProps) => {
  const theme = useTheme();
  const {
    state: { activeAccount },
  } = useAccounts();
  const {
    state: { decimals: relayDecimals, symbol: relaySymbol },
  } = useRelayApi();
  const {
    state: { decimals: coretimeDecimals, symbol: coretimeSymbol },
  } = useCoretimeApi();

  const items = [
    {
      label: 'Relay Chain',
      value: relayBalance,
      symbol: relaySymbol,
      decimals: relayDecimals,
    },
    {
      label: 'Coretime Chain',
      value: coretimeBalance,
      symbol: coretimeSymbol,
      decimals: coretimeDecimals,
    },
  ];

  return activeAccount ? (
    <Box className={styles.container}>
      {items.map(({ label, value, symbol, decimals }, index) => (
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
            {getBalanceString(value.toString(), decimals, symbol)}
          </Box>
        </Box>
      ))}
    </Box>
  ) : (
    <></>
  );
};
