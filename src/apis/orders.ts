import { fetchGraphql } from '@/utils/fetchGraphql';

import { API_REGIONX_PASEO_INDEXER } from '@/consts';
import { Address, ApiResponse } from '@/models';

export const fetchUserContribution = async (
  orderId: number,
  address: Address | undefined,
  after: string | null
): Promise<ApiResponse> => {
  const query = `{
    orderContributions(
      after: ${after}
      filter: {orderId: {equalTo: ${orderId}}, account: {equalTo: "${address}"}}
    ) {
      nodes {
        amount
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }`;
  // TODO: don't hardcode the regionx paseo indexer.
  return fetchGraphql(API_REGIONX_PASEO_INDEXER, query);
};

export const fetchOrders = async (after: string | null): Promise<ApiResponse> => {
  const query = `{
    orders(after: ${after}) {
      nodes {
        orderId
        begin
        end
        creator
        exist
        coreOccupancy
        contribution
        paraId
        processed
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }`;
  return fetchGraphql(API_REGIONX_PASEO_INDEXER, query);
};

export const fetchProcessedOrders = async (
  after: string | null,
  order = 'ORDER_ID_ASC'
): Promise<ApiResponse> => {
  const query = `{
    processedOrders(after: ${after}, orderBy: ${order}) {
      nodes {
        orderId
        height
        extrinsicId
        timestamp
        begin
        core
        mask
        seller
        reward
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }`;
  return fetchGraphql(API_REGIONX_PASEO_INDEXER, query);
};
