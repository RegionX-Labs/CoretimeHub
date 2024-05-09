import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import { Region } from 'coretime-utils';

import { TxStatusHandlers } from '@/models';

import { sendTx } from '../../functions';

export const transferNativeToken = async (
  api: ApiPromise,
  signer: Signer,
  senderAddress: string,
  destination: string,
  amount: string,
  handlers: TxStatusHandlers
) => {
  const txTransfer = api.tx.balances.transferKeepAlive(destination, amount);
  sendTx(txTransfer, senderAddress, signer, handlers);
};

export const transferRegionOnCoretimeChain = async (
  coretimeApi: ApiPromise,
  region: Region,
  signer: Signer,
  senderAddress: string,
  newOwner: string,
  handlers: TxStatusHandlers
) => {
  const txTransfer = coretimeApi.tx.broker.transfer(
    region.getOnChainRegionId(),
    newOwner
  );
  sendTx(txTransfer, senderAddress, signer, handlers);
};
