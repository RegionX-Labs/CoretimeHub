import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer } from '@polkadot/types/types';

import { EXPERIMENTAL } from '@/consts';
import { NetworkType, TxStatusHandlers } from '@/models';

export const sendTx = async (
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  account: AddressOrPair,
  signer: Signer,
  handlers: TxStatusHandlers
) => {
  try {
    const unsub = await tx.signAndSend(
      account,
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
              handlers.fail();
            }
          });
          unsub();
        }
      }
    );
  } catch (e) {
    handlers.error(e);
  } finally {
    handlers.finally && handlers.finally();
  }
};

export const sendUnsignedTx = async (
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  handlers: TxStatusHandlers
) => {
  try {
    const unsub = await tx.send(({ status, events }) => {
      if (status.isReady) handlers.ready();
      else if (status.isInBlock) handlers.inBlock();
      else if (status.isFinalized) {
        handlers.finalized();
        events.forEach(({ event: { method } }) => {
          if (method === 'ExtrinsicSuccess') {
            handlers.success();
          } else if (method === 'ExtrinsicFailed') {
            handlers.fail();
          }
        });
        unsub();
      }
    });
  } catch (e) {
    handlers.error(e);
  } finally {
    handlers.finally && handlers.finally();
  }
};

export const enableRegionX = (network: NetworkType): boolean => {
  return network === NetworkType.ROCOCO || EXPERIMENTAL;
};
