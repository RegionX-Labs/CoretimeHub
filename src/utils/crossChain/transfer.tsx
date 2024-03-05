import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

import { ContractContext } from '@/models';

import {
  ContractsChain,
  CoretimeRegionFromCoretimePerspective,
} from './consts';
import { versionedNonfungibleAssetWrap, versionedWrap } from './utils';

export function coretimeToContractsTransfer(
  coretimeApi: ApiPromise,
  senderAddress: string,
  rawRegionId: BN,
  receiver: string
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
  return new Promise(async (resolve, reject) => {
    try {
      const unsub = await reserveTransfer.signAndSend(
        senderAddress,
        (result: any) => {
          unsub();
          if (result.dispatchError !== undefined) {
            reject(result.dispatchError);
          } else {
            resolve(result);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
}

export async function initRegionMetadata(
  contractsCtx: ContractContext,
  sender: string,
  region: Region
) {
  const { contractsApi, xcRegionsContract } = contractsCtx;
  if (!contractsApi || !xcRegionsContract) return;

  try {
    const rawRegionId = region.getEncodedRegionId(contractsApi);
    const id = contractsApi.createType('Id', { U128: rawRegionId.toString() });

    const regionMetadata = {
      begin: region.getBegin(),
      end: region.getEnd(),
      core: region.getCore(),
      mask: region.getMask().getMask(),
    };

    await contractTx(
      contractsApi,
      sender,
      xcRegionsContract,
      'regionMetadata::init',
      {},
      [id, regionMetadata]
    );
  } catch (e: any) {
    throw new Error(`Region initialization failed: ${e}`);
  }
}
