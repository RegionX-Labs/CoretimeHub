import { SUBSCAN_CORETIME_DICT, SUBSCAN_CORETIME_INDEXER } from '@/consts';
import { Address, NetworkType } from '@/models';

import { fetchGraphql } from '../utils/fetchGraphql';

export const fetchPurchaseHistoryData = async (
  network: NetworkType,
  regionBegin: number,
  after: string | null,
  orderBy: string = 'HEIGHT_DESC'
) => {
  const query = `{
      purchases(
        after: ${after}
        filter: {begin: {equalTo: ${regionBegin}}}
        orderBy: ${orderBy}
      ) {
        nodes {
          account
          core
          extrinsicId
          height
          price
          purchaseType
          timestamp
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }`;
  return fetchGraphql(SUBSCAN_CORETIME_INDEXER[network], query);
};

export const fetchAccountExtrinsics = async (
  network: NetworkType,
  address: Address,
  after: string | null,
  orderBy: string = 'BLOCK_HEIGHT_DESC'
) => {
  const query = `{
      extrinsics(
        after: ${after}
        filter: {signer: {equalTo: "${address}"}}
        orderBy: ${orderBy}
      ) {
        nodes {
          id
          module
          call
          blockHeight
          success
          timestamp
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }`;
  return fetchGraphql(SUBSCAN_CORETIME_DICT[network], query);
};
