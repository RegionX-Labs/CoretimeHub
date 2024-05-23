import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItemButton,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

import { KeyringState, useAccounts } from '@/contexts/account';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';

import styles from './index.module.scss';
import { ProgressButton } from '../Elements';
import NetworkSelector from '../Elements/Selectors/NetworkSelector';
import { useToast } from '@/contexts/toast';

export const Header = () => {
  const theme = useTheme();
  const {
    state: { accounts, activeAccount, status },
    setActiveAccount,
    disconnectWallet,
    connectWallet,
  } = useAccounts();

  const [accountsOpen, openAccounts] = useState(false);
  const { toastInfo } = useToast();

  const onDisconnect = () => {
    openAccounts(false);
    disconnectWallet();
  };

  const truncateAddres = (address: string) => {
    return (
      address.substring(0, 6) + '...' + address.substring(address.length - 6)
    );
  };

  const copyAddress = async () => {
    if (!activeAccount) return;

    await navigator.clipboard.writeText(activeAccount.address);
    toastInfo('Address copied');
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
            <Box display='flex' alignItems='center' sx={{ margin: '1rem' }}>
              <Button onClick={copyAddress}>
                <ContentCopyIcon sx={{ color: theme.palette.grey['600'] }} />
              </Button>
              <p>{truncateAddres(activeAccount.address)}</p>
            </Box>
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
