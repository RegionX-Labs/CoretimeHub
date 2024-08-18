import { ApiPromise, Keyring } from '@polkadot/api';
import { useState } from 'react';

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
import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { AssetType, ChainType } from '@/models';

import { assetType } from '../common';
import { useTransferState } from '../contexts/transferState';

export const useTransferHandlers = () => {
  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const { originChain, destinationChain, selectedRegion } = useTransferState();

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: regionXApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: {
      api: relayApi,
      apiState: relayApiState,
      decimals: relayTokenDecimals,
    },
  } = useRelayApi();

  const { fetchRegions } = useRegions();
  const [working, setWorking] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [transferAmount, setTransferAmount] = useState<number | undefined>();
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const defaultHandler = (regionTransfer = false) => {
    return {
      ready: () => toastInfo('Transaction was initiated'),
      inBlock: () => toastInfo('In Block'),
      finalized: () => {
        setWorking(false);
      },
      success: () => {
        toastSuccess('Successfully transferred');
        regionTransfer && fetchRegions();
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
  };

  const handleTransfer = async () => {
    if (!newOwner) {
      toastError('Recipient must be selected');
      return;
    }

    setWorking(true);
    if (assetType(originChain, destinationChain) === AssetType.REGION) {
      await handleRegionTransfer();
    } else if (assetType(originChain, destinationChain) === AssetType.TOKEN) {
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

    const amount = transferAmount * Math.pow(10, relayTokenDecimals);
    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(newOwner);

    if (originChain === destinationChain) {
      if (!coretimeApi || !(coretimeApiState === ApiState.READY)) return;
      await transferNativeToken(
        coretimeApi,
        activeSigner,
        activeAccount.address,
        newOwner,
        amount.toString(),
        defaultHandler()
      );
    } else {
      let transferFunction: any;
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

      const transfer = (api: ApiPromise) =>
        transferFunction(
          api,
          { address: activeAccount.address, signer: activeSigner },
          amount.toString(),
          receiverKeypair.pairs[0].publicKey,
          defaultHandler()
        );

      if (
        originChain === ChainType.CORETIME &&
        coretimeApi &&
        coretimeApiState === ApiState.READY
      ) {
        transfer(coretimeApi);
      } else if (
        originChain === ChainType.RELAY &&
        relayApi &&
        relayApiState === ApiState.READY
      ) {
        transfer(relayApi);
      } else if (
        originChain === ChainType.REGIONX &&
        regionXApi &&
        regionxApiState === ApiState.READY
      ) {
        transfer(regionXApi);
      }
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
        defaultHandler(true)
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
        defaultHandler(true)
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
        defaultHandler(true)
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
  };
};
