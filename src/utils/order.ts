import { ApiPromise } from '@polkadot/api';
import { blake2AsHex, encodeAddress } from '@polkadot/util-crypto';

export const getOrderAccount = (api: ApiPromise, orderId: number): string => {
  const order = api.createType('(String, u32)', ['order', orderId]).toHex();
  const address = encodeAddress(blake2AsHex(order));
  return address;
};
