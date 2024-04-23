import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  useTheme,
} from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import React, { useState } from 'react';

import styles from './index.module.scss';
import { ActionButton } from '../Elements';
import { WalletModal } from '../Modals/WalletConnect';

export const Header = () => {
  const theme = useTheme();

  const { activeAccount, disconnect, accounts, setActiveAccount } =
    useInkathon();
  const [accountsOpen, openAccounts] = useState(false);
  const [walletModalOpen, openWalletModal] = useState(false);

  const onDisconnect = () => {
    openAccounts(false);
    disconnect && disconnect();
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          background: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box className={styles.menu}>
          {activeAccount ? (
            <List component='div' className={styles.listWrapper}>
              {!accountsOpen && (
                <ListItemButton
                  onClick={() => openAccounts(true)}
                  sx={{
                    justifyContent: 'space-between',
                    background: theme.palette.background.default,
                    borderRadius: 4,
                  }}
                >
                  {activeAccount.name}
                  <ExpandMore />
                </ListItemButton>
              )}

              <Collapse
                in={accountsOpen}
                sx={{
                  position: 'absolute',
                  borderRadius: '0.5rem',
                  top: 0,
                  width: '100%',
                }}
              >
                <List component='div' className={styles.accountsList}>
                  {accounts?.map(
                    (account, index) =>
                      account.type == 'sr25519' && (
                        <ListItemButton
                          key={index}
                          onClick={() => {
                            setActiveAccount && setActiveAccount(account);
                            openAccounts(false);
                          }}
                          sx={{
                            borderRadius: '0.5rem',
                            background: theme.palette.grey['100'],
                          }}
                        >
                          {account.name}
                        </ListItemButton>
                      )
                  )}
                </List>
                <Divider sx={{ borderColor: theme.palette.common.white }} />
                <ListItemButton
                  onClick={onDisconnect}
                  sx={{
                    borderRadius: '0.5rem',
                    background: theme.palette.grey['100'],
                  }}
                >
                  Disconnect
                </ListItemButton>
              </Collapse>
            </List>
          ) : (
            <ActionButton
              onClick={() => openWalletModal(true)}
              label='Connect Wallet'
            />
          )}
        </Box>
      </Box>
      <WalletModal
        open={walletModalOpen}
        onClose={() => openWalletModal(false)}
      />
    </>
  );
};
