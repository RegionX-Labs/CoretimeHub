import { useEffect, useState } from 'react';

import { SUBSCAN_CORETIME_API } from '@/consts';
import {
  NetworkType,
  SaleHistoryItem,
  SaleHistoryResponse,
  SaleHistoryResponseItem,
} from '@/models';

export const useSaleHistory = (
  network: NetworkType,
  page: number,
  row: number
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SaleHistoryItem[]>([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(true);
      setData([]);
      setError(false);

      try {
        const res = await fetch(
          `${SUBSCAN_CORETIME_API[network]}/api/scan/broker/sales`,
          {
            method: 'POST',
            body: JSON.stringify({ row, page }),
          }
        );
        if (res.status !== 200) {
          setError(true);
        } else {
          const { message, data } = await res.json();

          if (message !== 'Success') {
            setError(true);
          } else {
            const { list } = data as SaleHistoryResponse;

            setData(
              list.map((x: SaleHistoryResponseItem) => x as SaleHistoryItem)
            );
          }
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };

    asyncFetchData();
  }, [network, page, row]);

  return { loading, data, isError };
};
