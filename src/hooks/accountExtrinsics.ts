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

        for (;;) {
          const res = await fetchAccountExtrinsics(network, account, page, 100);
          if (res.status !== 200) {
            setError(true);
            break;
          } else {
            const { message, data } = await res.json();
            if (message !== 'Success') {
              setError(true);
            } else {
              const { count, extrinsics } = data as ExtrinsicsResponse;

              if (extrinsics !== null) {
                txHistory.push(
                  ...extrinsics.map(
                    (item) =>
                      ({
                        extrinsicId: item.extrinsic_index,
                        module: item.call_module,
                        call: item.call_module_function,
                        timestamp: item.block_timestamp,
                        success: item.success,
                      } as AccountTxHistoryItem)
                  )
                );
              }

              ++page;
              if (txHistory.length === count) break;
            }
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
