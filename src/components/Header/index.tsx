import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

import { KeyringState, useAccounts } from '@/contexts/account';

import styles from './index.module.scss';
import { Address, ProgressButton } from '../Elements';
import NetworkSelector from '../Elements/Selectors/NetworkSelector';

export const Header = () => {
  const theme = useTheme();
  const {
    state: { accounts, activeAccount, status },
    setActiveAccount,
    disconnectWallet,
    connectWallet,
  } = useAccounts();

  const [accountsOpen, openAccounts] = useState(false);

  const onDisconnect = () => {
    openAccounts(false);
    disconnectWallet();
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
          {activeAccount && (
            <Address value={activeAccount.address} isCopy isShort />
          )}
          <div>
            <NetworkSelector />
          </div>
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
                  {`${activeAccount.meta.name}(${activeAccount.meta.source})`}
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
                            setActiveAccount(account);
                            openAccounts(false);
                          }}
                          sx={{
                            borderRadius: '0.5rem',
                            background: theme.palette.grey['100'],
                          }}
                        >
                          {`${account.meta.name}(${account.meta.source})`}
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
            <ProgressButton
              onClick={() => connectWallet()}
              label='Connect Wallet'
              loading={status === KeyringState.LOADING}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
