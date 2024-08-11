import { useEffect, useState } from 'react';

import { fetchAccountExtrinsics } from '@/apis';
import {
  AccountTxHistoryItem,
  Address,
  ApiResponse,
  NetworkType,
} from '@/models';

export const useAccountExtrinsics = (
  network: NetworkType,
  account: Address
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AccountTxHistoryItem[]>([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const asyncFetchData = async () => {
      setData([]);
      setError(false);
      setLoading(false);

      try {
        setLoading(true);

        const txHistory: AccountTxHistoryItem[] = [];

        let finished = false;
        let after: string | null = null;

        const result = [];
        while (!finished) {
          const res: ApiResponse = await fetchAccountExtrinsics(
            network,
            account,
            after
          );
          const { status, data } = res;
          if (status !== 200) break;

          if (data.extrinsics.nodes !== null)
            result.push(...data.extrinsics.nodes);

          finished = !data.extrinsics.pageInfo.hasNextPage;
          after = data.extrinsics.pageInfo.endCursor;
        }
        if (!finished) {
          setError(true);
        } else {
          txHistory.push(
            ...result.map(
              (item) =>
                ({
                  extrinsicId: item.id,
                  module: item.module,
                  call: item.call,
                  timestamp: new Date(`${item.timestamp}Z`),
                  success: item.success,
                }) as AccountTxHistoryItem
            )
          );
        }

        setData(txHistory);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    asyncFetchData();
  }, [network, account]);

  return { loading, data, isError };
};
