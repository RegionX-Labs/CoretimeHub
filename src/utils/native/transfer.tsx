import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

import { ContractContext, TxStatusHandlers } from '@/models';

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

export const transferRegionOnContractsChain = async (
  contractCtx: ContractContext,
  region: Region,
  senderAddress: string,
  newOwner: string,
  handlers: TxStatusHandlers
) => {
  const { contractsApi, xcRegionsContract } = contractCtx;
  if (!contractsApi || !xcRegionsContract) return;

  try {
    const rawRegionId = region.getEncodedRegionId(contractsApi);
    const id = contractsApi.createType('Id', { U128: rawRegionId });

    await contractTx(
      contractsApi,
      senderAddress,
      xcRegionsContract,
      'PSP34::transfer',
      {},
      [newOwner, id, []]
    );

    handlers.finalized();
    handlers.success();
  } catch (e: any) {
    handlers.error();
  }
};
