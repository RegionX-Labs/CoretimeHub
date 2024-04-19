import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

import { Sender, TxStatusHandlers } from '@/models';

import {
  CoretimeChain,
  CoretimeChainFromRelayPerspective,
  CoretimeRegionFromCoretimePerspective,
  CoretimeRegionFromRegionXPerspective,
  RcTokenFromParachainPerspective,
  RcTokenFromRelayPerspective,
  RegionXChain,
  RelayChainFromParachainPerspective,
} from './consts';
import {
  versionWrappeddNonfungibleAsset,
  versionWrap,
  versionWrappeddFungibleAsset,
} from './utils';

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
      versionWrap(RegionXChain),
      versionWrap(beneficiary),
      versionWrappeddNonfungibleAsset(
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
    versionWrap(CoretimeChain),
    versionWrap(beneficiary),
    versionWrappeddNonfungibleAsset(
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

export function transferTokensFromCoretimeToRelay(
  coretimeApi: ApiPromise,
  sender: Sender,
  amount: string,
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

  const teleportTransfer = coretimeApi.tx.polkadotXcm.limitedTeleportAssets(
    versionWrap(RelayChainFromParachainPerspective),
    versionWrap(beneficiary),
    versionWrappeddFungibleAsset(RcTokenFromParachainPerspective, amount),
    feeAssetItem,
    weightLimit
  );

  try {
    teleportTransfer.signAndSend(
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

export function transferTokensFromRelayToCoretime(
  coretimeApi: ApiPromise,
  sender: Sender,
  amount: string,
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

  const teleportTransfer = coretimeApi.tx.xcmPallet.limitedTeleportAssets(
    versionWrap(CoretimeChainFromRelayPerspective),
    versionWrap(beneficiary),
    versionWrappeddFungibleAsset(RcTokenFromRelayPerspective, amount),
    feeAssetItem,
    weightLimit
  );

  try {
    teleportTransfer.signAndSend(
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
