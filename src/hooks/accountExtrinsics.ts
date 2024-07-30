import { useEffect, useState } from 'react';

import { fetchAccountExtrinsics } from '@/apis';
import {
  AccountTxHistoryItem,
  Address,
  ExtrinsicsResponse,
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

        let page = 0;
        const txHistory: AccountTxHistoryItem[] = [];

        const res = await fetchAccountExtrinsics(network, account, page, 100);
        if (res.status !== 200) {
          setError(true);
        } else {
          const { message, data } = await res.json();
          if (message !== 'Success') {
            setError(true);
          } else {
            const { nodes } = data.extrinsics as ExtrinsicsResponse;

            if (nodes !== null) {
              txHistory.push(
                ...nodes.map(
                  (item) =>
                    ({
                      extrinsicId: item.id,
                      module: item.module,
                      call: item.call,
                      timestamp: item.timestamp,
                      success: item.success,
                    } as AccountTxHistoryItem)
                )
              );
            }

            ++page;
          }
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
