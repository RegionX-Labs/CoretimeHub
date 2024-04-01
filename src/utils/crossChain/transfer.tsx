import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Sender, TxStatusHandlers } from '@/models';

import {
  ContractsChain,
  CoretimeChain,
  CoretimeRegionFromContractsPerspective,
  CoretimeRegionFromCoretimePerspective,
} from './consts';
import { versionedNonfungibleAssetWrap, versionedWrap } from './utils';

export async function coretimeToContractsTransfer(
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
      versionedWrap(ContractsChain),
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

export function contractsToCoretimeTransfer(
  contractsApi: ApiPromise,
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
    contractsApi.tx.polkadotXcm.limitedReserveTransferAssets(
      versionedWrap(CoretimeChain),
      versionedWrap(beneficiary),
      versionedNonfungibleAssetWrap(
        CoretimeRegionFromContractsPerspective,
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
