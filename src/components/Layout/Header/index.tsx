import { ExpandMore } from '@mui/icons-material';
import HistoryIcon from '@mui/icons-material/History';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Stack,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

import { Address, NetworkSelector, ProgressButton, TxHistoryModal } from '@/components';

import { KeyringState, useAccounts } from '@/contexts/account';

import styles from './index.module.scss';
import { WalletModal } from '@/components/Wallet';

export const Header = () => {
  const theme = useTheme();
  const {
    state: { accounts, activeAccount, status },
    setActiveAccount,
    disconnectWallet,
    connectWallet,
  } = useAccounts();

  const [accountsOpen, openAccounts] = useState(false);
  const [txHistoryModalOpen, openTxHistoryModal] = useState(false);

  const [walletModalOpen, openWalletModal] = useState(false);

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
          <div>
            <NetworkSelector />
          </div>
          {activeAccount ? (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Stack direction='row' gap='0.25rem' alignItems='center'>
                <Address value={activeAccount.address} isCopy isShort />
                <IconButton onClick={() => openTxHistoryModal(true)}>
                  <HistoryIcon />
                </IconButton>
              </Stack>
              <List component='div' className={styles.listWrapper}>
                {!accountsOpen && (
                  <ListItemButton
                    data-cy='accounts-open'
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
                            data-cy={`account-${index}`}
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
                    data-cy='disconnect-wallet'
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
            </Box>
          ) : (
            <ProgressButton
              data-cy='connect-wallet'
              onClick={() => openWalletModal(true)}
              label='Connect Wallet'
              loading={status === KeyringState.LOADING}
            />
          )}
        </Box>
      </Box>
      {activeAccount?.address ? (
        <TxHistoryModal
          open={txHistoryModalOpen}
          onClose={() => openTxHistoryModal(false)}
          account={activeAccount.address}
        />
      ) : (
        <></>
      )}
      {walletModalOpen &&
        <WalletModal
          open={walletModalOpen}
          onClose={() => openWalletModal(false)}
        />
      }
    </>
  );
};
