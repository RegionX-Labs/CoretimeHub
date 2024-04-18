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
import { useInkathon } from '@scio-labs/use-inkathon';
import React, { useEffect, useState } from 'react';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';

import styles from './index.module.scss';
import { WalletModal } from '../Modals/WalletConnect';

export const Header = () => {
  const theme = useTheme();

  const { activeAccount, disconnect, accounts, setActiveAccount } =
    useInkathon();
  const [accountsOpen, openAccounts] = useState(false);
  const [walletModalOpen, openWalletModal] = useState(false);

  const { connectRelay } = useRelayApi();
  const { connectCoretime } = useCoretimeApi();

  useEffect(() => {
    connectRelay();
    connectCoretime();
  }, [connectRelay, connectCoretime]);

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
        <div className={styles.menu}>
          {activeAccount ? (
            <List component='div' className={styles.listWrapper}>
              {!accountsOpen && (
                <ListItemButton
                  onClick={() => openAccounts(true)}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {activeAccount.name}
                  <ExpandMore />
                </ListItemButton>
              )}

              <Collapse in={accountsOpen} className={styles.accountsWrapper}>
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
                        >
                          {account.name}
                        </ListItemButton>
                      )
                  )}
                </List>
                <Divider />
                <ListItemButton onClick={onDisconnect}>
                  Disconnect
                </ListItemButton>
              </Collapse>
            </List>
          ) : (
            <Button
              variant='contained'
              className={styles.connectWallet}
              onClick={() => openWalletModal(true)}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </Box>
      <WalletModal
        open={walletModalOpen}
        onClose={() => openWalletModal(false)}
      />
    </>
  );
};
