import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Sender, TxStatusHandlers } from '@/models';

import {
  RegionXChain,
  CoretimeChain,
  CoretimeRegionFromRegionXPerspective,
  CoretimeRegionFromCoretimePerspective,
} from './consts';
import { versionedNonfungibleAssetWrap, versionedWrap } from './utils';

export async function coretimeToRegionXTransfer(
  coretimeApi: ApiPromise,
  sender: Sender,
  rawRegionId: BN,
  receiver: Uint8Array,
  handlers: TxStatusHandlers
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
      versionedWrap(RegionXChain),
      versionedWrap(beneficiary),
      versionedNonfungibleAssetWrap(
        CoretimeRegionFromCoretimePerspective,
        rawRegionId.toString()
      ),
      feeAssetItem,
      weightLimit
    );

  try {
    reserveTransfer.signAndSend(
      sender.address,
      { signer: sender.signer },
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
}

export function regionXToCoretimeTransfer(
  api: ApiPromise,
  sender: Sender,
  rawRegionId: BN,
  receiver: Uint8Array,
  handlers: TxStatusHandlers
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

  const reserveTransfer = api.tx.polkadotXcm.limitedReserveTransferAssets(
    versionedWrap(CoretimeChain),
    versionedWrap(beneficiary),
    versionedNonfungibleAssetWrap(
      CoretimeRegionFromRegionXPerspective,
      rawRegionId.toString()
    ),
    feeAssetItem,
    weightLimit
  );

  try {
    reserveTransfer.signAndSend(
      sender.address,
      { signer: sender.signer },
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
}
