import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
} from '@mui/material';
import { SubstrateWallet, isWalletInstalled } from '@scio-labs/use-inkathon';
import { allSubstrateWallets, useInkathon } from '@scio-labs/use-inkathon';
import Image from 'next/image';

import styles from './index.module.scss';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export const WalletModal = (props: WalletModalProps) => {
  const { connect } = useInkathon();

  const onConnect = (wallet: SubstrateWallet) => {
    connect?.(undefined, wallet);
    props.onClose();
  };

  return (
    <Dialog {...props} fullWidth maxWidth='sm'>
      <DialogTitle>Choose your wallet extension</DialogTitle>
      <DialogContent>
        <List>
          {allSubstrateWallets.map((wallet, index) => (
            <ListItemButton
              key={index}
              onClick={() => onConnect(wallet)}
              disabled={!isWalletInstalled(wallet)}
            >
              <Image
                className={styles.logo}
                alt='logo'
                src={wallet.logoUrls[0]}
                width={32}
                height={32}
              />
              {wallet.name}
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
