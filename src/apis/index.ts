import { SUBSCAN_CORETIME_DICT, SUBSCAN_CORETIME_INDEXER } from '@/consts';
import { Address, NetworkType } from '@/models';

export const fetchPurchaseHistoryData = async (
  network: NetworkType,
  regionBegin: number,
  _page: number,
  _row: number
) => {
  const res = await fetch(`${SUBSCAN_CORETIME_INDEXER[network]}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        purchases(filter: {begin: {equalTo: ${regionBegin}}}) {
          nodes {
            account
            core
            extrinsicId
            height
            price
            purchaseType
            timestamp
          }
          totalCount
        }
      }`,
    }),
  });
  return res;
};

export const fetchAccountExtrinsics = async (
  network: NetworkType,
  address: Address,
  _page: number,
  _row: number
) => {
  const res = await fetch(`${SUBSCAN_CORETIME_DICT[network]}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        extrinsics( filter: {signer: {equalTo: "${address}"}} ) {
          nodes {
            id
            module
            call
            blockHeight
            success
          }
          totalCount
        }
      }`,
    }),
  });
  return res;
};
