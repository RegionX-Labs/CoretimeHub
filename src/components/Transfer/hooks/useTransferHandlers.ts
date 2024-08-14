import { useState } from 'react';
import { Keyring } from '@polkadot/api';
import { ChainType, AssetType, CORETIME_DECIMALS } from '@/models';
import { useToast } from '@/contexts/toast';
import { useTransferState } from './useTransferState';
import {
  coretimeFromRegionXTransfer,
  coretimeToRegionXTransfer,
  transferTokensFromCoretimeToRelay,
  transferTokensFromRegionXToRelay,
  transferTokensFromRelayToCoretime,
  transferTokensFromRelayToRegionX,
} from '@/utils/transfers/crossChain';
import {
  transferNativeToken,
  transferRegionOnCoretimeChain,
} from '@/utils/transfers/native';
import { useAccounts } from '@/contexts/account';
import { ApiState } from '@/contexts/apis/types';

export const useTransferHandlers = () => {
  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const {
    originChain,
    destinationChain,
    selectedRegion,
    asset,
    coretimeApi,
    regionXApi,
    coretimeApiState,
    regionxApiState,
    setAsset,
    setOriginChain,
  } = useTransferState();

  const [working, setWorking] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [transferAmount, setTransferAmount] = useState<number | undefined>();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated'),
    inBlock: () => toastInfo('In Block'),
    finalized: () => setWorking(false),
    success: () => {
      toastSuccess('Successfully transferred');
      setWorking(false);
    },
    fail: () => {
      toastError('Failed to transfer');
      setWorking(false);
    },
    error: (e: any) => {
      toastError(`Failed to transfer: ${e.message}`);
      setWorking(false);
    },
  };

  const handleOriginChange = (newOrigin: ChainType) => {
    setOriginChain(newOrigin);
    if (newOrigin === ChainType.RELAY) setAsset(AssetType.TOKEN);
  };

  const handleTransfer = async () => {
    if (!newOwner) {
      toastError('Recipient must be selected');
      return;
    }

    setWorking(true);
    if (asset === AssetType.REGION) {
      await handleRegionTransfer();
    } else if (asset === AssetType.TOKEN) {
      await handleTokenTransfer();
    }
  };

  const handleTokenTransfer = async () => {
    if (!activeSigner || !activeAccount) {
      toastWarning('Please connect wallet');
      setWorking(false);
      return;
    }
    if (!transferAmount) {
      toastWarning('Please input the amount');
      setWorking(false);
      return;
    }

    const amount = transferAmount * Math.pow(10, CORETIME_DECIMALS);
    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(newOwner);

    if (originChain === destinationChain) {
      if (!(coretimeApi && coretimeApiState === ApiState.READY)) return;
      await transferNativeToken(
        coretimeApi,
        activeSigner,
        activeAccount.address,
        newOwner,
        amount.toString(),
        defaultHandler
      );
    } else {
      if (
        !(coretimeApi && coretimeApiState === ApiState.READY) ||
        !(regionXApi && regionxApiState === ApiState.READY)
      )
        return;

      let transferFunction;
      if (
        originChain === ChainType.CORETIME &&
        destinationChain === ChainType.RELAY
      ) {
        transferFunction = transferTokensFromCoretimeToRelay;
      } else if (
        originChain === ChainType.REGIONX &&
        destinationChain === ChainType.RELAY
      ) {
        transferFunction = transferTokensFromRegionXToRelay;
      } else if (
        originChain === ChainType.RELAY &&
        destinationChain === ChainType.CORETIME
      ) {
        transferFunction = transferTokensFromRelayToCoretime;
      } else if (
        originChain === ChainType.RELAY &&
        destinationChain === ChainType.REGIONX
      ) {
        transferFunction = transferTokensFromRelayToRegionX;
      } else {
        toastWarning('Currently not supported');
        setWorking(false);
        return;
      }

      transferFunction(
        originChain === ChainType.CORETIME ? coretimeApi : regionXApi,
        { address: activeAccount.address, signer: activeSigner },
        amount.toString(),
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
      );
    }
  };

  const handleRegionTransfer = async () => {
    if (!activeSigner || !activeAccount) {
      toastWarning('Please connect wallet');
      setWorking(false);
      return;
    }
    if (!selectedRegion) {
      toastError('Select a region');
      setWorking(false);
      return;
    }
    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(newOwner ? newOwner : activeAccount.address);

    if (originChain === destinationChain) {
      if (!(coretimeApi && coretimeApiState === ApiState.READY)) return;
      await transferRegionOnCoretimeChain(
        coretimeApi,
        selectedRegion.region,
        activeSigner,
        activeAccount.address,
        newOwner ?? activeAccount.address,
        defaultHandler
      );
    } else if (
      originChain === ChainType.CORETIME &&
      destinationChain === ChainType.REGIONX
    ) {
      if (!(coretimeApi && coretimeApiState === ApiState.READY)) return;
      await coretimeToRegionXTransfer(
        coretimeApi,
        { address: activeAccount.address, signer: activeSigner },
        selectedRegion.rawId,
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
      );
    } else if (
      originChain === ChainType.REGIONX &&
      destinationChain === ChainType.CORETIME
    ) {
      if (!(regionXApi && regionxApiState === ApiState.READY)) return;
      coretimeFromRegionXTransfer(
        regionXApi,
        { address: activeAccount.address, signer: activeSigner },
        selectedRegion.rawId,
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
      );
    } else {
      toastWarning('Currently not supported');
      setWorking(false);
    }
  };

  return {
    working,
    newOwner,
    setNewOwner,
    transferAmount,
    setTransferAmount,
    handleTransfer,
    handleOriginChange,
  };
};
