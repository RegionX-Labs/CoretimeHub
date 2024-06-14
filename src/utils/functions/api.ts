import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer } from '@polkadot/types/types';

import { TxStatusHandlers } from '@/models';

export const sendTx = (
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  account: AddressOrPair,
  signer: Signer,
  handlers: TxStatusHandlers
) => {
  try {
    tx.signAndSend(account, { signer }, ({ status, events }) => {
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
      }
    });
  } catch (e) {
    handlers.error(e);
  } finally {
    handlers.finally && handlers.finally();
  }
};
