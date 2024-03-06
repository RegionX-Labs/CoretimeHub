import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

import { ContractContext, Sender, TxHandlers } from '@/models';

export async function removeXcRegionWrapper(
  contractsCtx: ContractContext,
  sender: Sender,
  region: Region,
  handlers: TxHandlers
) {
  const { contractsApi, xcRegionsContract } = contractsCtx;
  if (!contractsApi || !xcRegionsContract) return;

  try {
    const rawRegionId = region.getEncodedRegionId(contractsApi);
    const id = contractsApi.createType('Id', { U128: rawRegionId.toString() });

    await contractTx(
      contractsApi,
      sender.address,
      xcRegionsContract,
      'regionMetadata::remove',
      {},
      [id]
    );
    handlers.finalized();
    handlers.success();
  } catch (e: any) {
    handlers.error();
  }
}
