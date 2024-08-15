import { fetchGraphql } from '@/utils/fetchGraphql';

import { API_CORETIME_INDEXER } from '@/consts';
import { ApiResponse, NetworkType } from '@/models';

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

export const fetchSaleDetailsData = async (
  network: NetworkType,
  saleCycle: number,
  after: string | null,
  orderBy = 'HEIGHT_DESC'
): Promise<ApiResponse> => {
  const query = `{
      purchases(
        filter: {saleCycle: {equalTo: ${saleCycle}}}
        after: ${after ? `"${after}"` : null}
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

export const fetchSalesHistoryData = async (
  network: NetworkType,
  after: string | null
): Promise<ApiResponse> => {
  const query = `{
      sales(
        after: ${after},
        orderBy: SALE_CYCLE_DESC
      ) {
        nodes {
          saleCycle
          regionBegin
          regionEnd
          height
          saleEnd
          timestamp
          tsSaleEnd
          startPrice
          endPrice
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }`;
  return fetchGraphql(API_CORETIME_INDEXER[network], query);
};
