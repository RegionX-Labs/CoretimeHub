import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import { Region } from 'coretime-utils';

import { TxStatusHandlers } from '@/models';

export const transferNativeToken = async (
  api: ApiPromise,
  signer: Signer,
  senderAddress: string,
  destination: string,
  amount: string,
  handlers: TxStatusHandlers
) => {
  const txTransfer = api.tx.balances.transferKeepAlive(destination, amount);

  try {
    await txTransfer.signAndSend(
      senderAddress,
      { signer },
      ({ status, events }) => {
        if (status.isReady) handlers.ready();
        else if (status.isInBlock) handlers.inBlock();
        else if (status.isFinalized) {
          handlers.finalized();
          events.forEach(({ event: { method } }) => {
            if (method === 'ExtrinsicSuccess') {
              handlers.success();
            } else if (method === 'ExtrinsicFailed') {
              handlers.error();
            }
          });
        }
      }
    );
  } catch (e) {
    handlers.error();
  }
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

  try {
    await txTransfer.signAndSend(
      senderAddress,
      { signer },
      ({ status, events }) => {
        if (status.isReady) handlers.ready();
        else if (status.isInBlock) handlers.inBlock();
        else if (status.isFinalized) {
          handlers.finalized();
          events.forEach(({ event: { method } }) => {
            if (method === 'ExtrinsicSuccess') {
              handlers.success();
            } else if (method === 'ExtrinsicFailed') {
              handlers.error();
            }
          });
        }
      }
    );
  } catch (e) {
    handlers.error();
  }
};
