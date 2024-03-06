import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

import { ContractContext, Sender, TxHandlers } from '@/models';

import {
  ContractsChain,
  CoretimeRegionFromCoretimePerspective,
} from './consts';
import { versionedNonfungibleAssetWrap, versionedWrap } from './utils';

export function coretimeToContractsTransfer(
  coretimeApi: ApiPromise,
  sender: Sender,
  rawRegionId: BN,
  receiver: Uint8Array,
  handlers: TxHandlers
) {
  const beneficiary = {
    parents: 0,
    interior: {
      X1: {
        AccountId32: {
          chain: 'Any',
          id: receiver,
        },
      },
    },
  };

  const feeAssetItem = 0;
  const weightLimit = 'Unlimited';

  const reserveTransfer =
    coretimeApi.tx.polkadotXcm.limitedReserveTransferAssets(
      versionedWrap(ContractsChain),
      versionedWrap(beneficiary),
      versionedNonfungibleAssetWrap(
        CoretimeRegionFromCoretimePerspective,
        rawRegionId.toString()
      ),
      feeAssetItem,
      weightLimit
    );

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async () => {
    try {
      const unsub = await reserveTransfer.signAndSend(
        sender.address,
        { signer: sender.signer },
        (result: any) => {
          unsub();
          handlers.finalized();
          if (result.dispatchError !== undefined) {
            handlers.error();
          } else {
            handlers.success();
          }
        }
      );
    } catch (e) {
      handlers.error();
    }
  });
}
