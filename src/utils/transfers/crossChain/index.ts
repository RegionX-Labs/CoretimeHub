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
  RegionXChainFromRelayPerspective,
  RelayChainFromParachainPerspective,
} from './consts';
import { fungibleAsset, nonFungibleAsset, versionWrap } from './utils';
import { sendTx } from '../../functions';

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
      versionWrap([
        fungibleAsset(RcTokenFromParachainPerspective, '2500000000'), // Fee payment asset
        nonFungibleAsset(
          CoretimeRegionFromCoretimePerspective,
          rawRegionId.toString()
        ),
      ]),
      feeAssetItem,
      weightLimit
    );

  const { address, signer } = sender;
  sendTx(reserveTransfer, address, signer, handlers);
}

export function coretimeFromRegionXTransfer(
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
    versionWrap([
      fungibleAsset(RcTokenFromParachainPerspective, '2500000000'), // Fee payment asset
      nonFungibleAsset(
        CoretimeRegionFromRegionXPerspective,
        rawRegionId.toString()
      ),
    ]),
    feeAssetItem,
    weightLimit
  );

  const { address, signer } = sender;
  sendTx(reserveTransfer, address, signer, handlers);
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
    versionWrap([fungibleAsset(RcTokenFromParachainPerspective, amount)]),
    feeAssetItem,
    weightLimit
  );

  const { address, signer } = sender;

  sendTx(teleportTransfer, address, signer, handlers);
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
    versionWrap([fungibleAsset(RcTokenFromRelayPerspective, amount)]),
    feeAssetItem,
    weightLimit
  );

  const { address, signer } = sender;

  sendTx(teleportTransfer, address, signer, handlers);
}

export function transferTokensFromRegionXToRelay(
  regionXApi: ApiPromise,
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

  const teleportTransfer =
    regionXApi.tx.polkadotXcm.limitedReserveTransferAssets(
      versionWrap(RelayChainFromParachainPerspective),
      versionWrap(beneficiary),
      versionWrap([fungibleAsset(RcTokenFromParachainPerspective, amount)]),
      feeAssetItem,
      weightLimit
    );

  const { address, signer } = sender;

  sendTx(teleportTransfer, address, signer, handlers);
}

export function transferTokensFromRelayToRegionX(
  regionXApi: ApiPromise,
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

  const teleportTransfer = regionXApi.tx.xcmPallet.limitedReserveTransferAssets(
    versionWrap(RegionXChainFromRelayPerspective),
    versionWrap(beneficiary),
    versionWrap([fungibleAsset(RcTokenFromRelayPerspective, amount)]),
    feeAssetItem,
    weightLimit
  );

  const { address, signer } = sender;

  sendTx(teleportTransfer, address, signer, handlers);
}
