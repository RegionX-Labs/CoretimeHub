import {
  ContractContext,
  REGION_COLLECTION_ID,
  Sender,
  TxHandlers,
} from '@/models';
import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

export const approveNonWrappedRegion = async (
  ctx: ContractContext,
  sender: Sender,
  region: Region,
  who: string,
  handlers: TxHandlers
) => {
  const { contractsApi } = ctx;
  if (!contractsApi) return;

  const approveTx = contractsApi.tx.uniques.approveTransfer(
    REGION_COLLECTION_ID,
    region.getEncodedRegionId(contractsApi),
    who
  );

  try {
    await approveTx.signAndSend(
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
};

export const approveXcRegion = async (
  ctx: ContractContext,
  sender: Sender,
  region: Region,
  who: string,
  handlers: TxHandlers
) => {
  const { contractsApi, xcRegionsContract } = ctx;
  if (!contractsApi || !xcRegionsContract) {
    return;
  }

  try {
    const rawRegionId = region.getEncodedRegionId(contractsApi);
    const id = contractsApi.createType('Id', { U128: rawRegionId });

    await contractTx(
      contractsApi,
      sender.address,
      xcRegionsContract,
      'PSP34::approve',
      {},
      [who, id, true]
    );

    handlers.finalized();
    handlers.success();
  } catch (e: any) {
    console.log(e);
    handlers.error();
  }
};
