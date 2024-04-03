import { contractTx } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';

import { ContractContext, Sender, TxStatusHandlers } from '@/models';

export async function initRegionMetadata(
  contractsCtx: ContractContext,
  sender: Sender,
  region: Region,
  handlers: TxStatusHandlers
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
      mask: region.getMask().toRawHex(),
    };

    await contractTx(
      contractsApi,
      sender.address,
      xcRegionsContract,
      'regionMetadata::init',
      {},
      [id, regionMetadata]
    );
    handlers.finalized();
    handlers.success();
  } catch (e: any) {
    handlers.error();
  }
}
