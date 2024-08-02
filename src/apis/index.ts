import { API_CORETIME_DICT, API_CORETIME_INDEXER } from '@/consts';
import { Address, ApiResponse, NetworkType } from '@/models';

import { fetchGraphql } from '../utils/fetchGraphql';

export const fetchBurnInfo = async (
  network: NetworkType
): Promise<ApiResponse> => {
  const query = `{
    stats {
      nodes {
        id
        saleCycle
        totalBurn
      }
    }
    sales(
      orderBy: HEIGHT_DESC,
      first: 2
    ) {
      nodes {
        burn
      }
    }
  }`;
  return fetchGraphql(API_CORETIME_INDEXER[network], query);
};

export const fetchPurchaseHistoryData = async (
  network: NetworkType,
  regionBegin: number,
  after: string | null,
  orderBy = 'HEIGHT_DESC'
): Promise<ApiResponse> => {
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
  return fetchGraphql(API_CORETIME_INDEXER[network], query);
};

export const fetchAccountExtrinsics = async (
  network: NetworkType,
  address: Address,
  after: string | null,
  orderBy = 'BLOCK_HEIGHT_DESC'
): Promise<ApiResponse> => {
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
  return fetchGraphql(API_CORETIME_DICT[network], query);
};
