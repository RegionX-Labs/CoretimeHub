import { Box, Typography, useTheme } from '@mui/material';

import { getBalanceString } from '@/utils/functions';

import { EXPERIMENTAL } from '@/consts';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { useBalances } from '@/contexts/balance';
import { useNetwork } from '@/contexts/network';
import { NetworkType } from '@/models';

import styles from './index.module.scss';

interface BalanceProps {
  rcBalance?: boolean;
  ctBalance?: boolean;
  rxNativeBalance?: boolean;
  rxRcCurrencyBalance?: boolean;
}

export const Balance = ({
  rcBalance,
  ctBalance,
  rxNativeBalance,
  rxRcCurrencyBalance,
}: BalanceProps) => {
  const { balance } = useBalances();
  const theme = useTheme();
  const {
    state: { activeAccount },
  } = useAccounts();
  const { network } = useNetwork();
  const { state: relayState } = useRelayApi();
  const { state: coretimeState } = useCoretimeApi();
  const { state: regionxState } = useRegionXApi();

  const enableRegionx = network === NetworkType.ROCOCO || EXPERIMENTAL;

  const items = [
    ...(rcBalance
      ? [
          {
            label: relayState.name,
            value: balance.relay,
            symbol: relayState.symbol,
            decimals: relayState.decimals,
          },
        ]
      : []),
    ...(ctBalance
      ? [
          {
            label: coretimeState.name,
            value: balance.coretime,
            symbol: coretimeState.symbol,
            decimals: coretimeState.decimals,
          },
        ]
      : []),
    ...(enableRegionx
      ? [
          // Relay asset:
          ...(rxRcCurrencyBalance
            ? [
                {
                  label: regionxState.name,
                  value: balance.rxRcCurrencyBalance,
                  symbol: relayState.symbol,
                  decimals: relayState.decimals,
                },
              ]
            : []),
          // RegionX native asset:
          ...(rxNativeBalance
            ? [
                {
                  label: regionxState.name,
                  value: balance.rxNativeBalance,
                  symbol: regionxState.symbol,
                  decimals: regionxState.decimals,
                },
              ]
            : []),
        ]
      : []),
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
