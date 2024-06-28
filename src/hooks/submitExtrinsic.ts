import { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult, Signer } from '@polkadot/types/types';
import { useConfirm } from 'material-ui-confirm';

import { getBalanceString, sendTx } from '@/utils/functions';

import { TxStatusHandlers } from '@/models';

export const useSubmitExtrinsic = () => {
  const confirm = useConfirm();

  const submitExtrinsicWithFeeInfo = async (
    symbol: string,
    decimals: number,
    tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
    account: AddressOrPair,
    signer: Signer,
    handlers: TxStatusHandlers
  ) => {
    const info = await tx.paymentInfo(account.toString());
    const { partialFee } = info.toPrimitive() as any;
    confirm({
      description: `Estimated gas fee: ${getBalanceString(
        partialFee.toString(),
        decimals,
        symbol
      )}`,
    }).then(() => sendTx(tx, account, signer, handlers));
  };

  return { submitExtrinsicWithFeeInfo };
};
