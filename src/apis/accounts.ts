import { fetchGraphql } from '@/utils/fetchGraphql';

import { API_CORETIME_DICT } from '@/consts';
import { Address, ApiResponse, NetworkType } from '@/models';

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
