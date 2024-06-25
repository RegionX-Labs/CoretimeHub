import { useEffect, useState } from 'react';

import { sleep } from '@/utils/functions';

import { fetchPurchaseHistoryData } from '@/apis';
import { NetworkType, PurchaseHistoryResponse } from '@/models';

import { useSaleHistory } from './saleHistory';

export const useBurnInfo = (network: NetworkType) => {
  const [totalBurn, setTotalBurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentBurn, setCurrentBurn] = useState(0);
  const [prevBurn, setPrevBurn] = useState(0);

  const saleHistory = useSaleHistory(network, 0, 100);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(false);
      setTotalBurn(0);
      setCurrentBurn(0);
      setPrevBurn(0);

      if (saleHistory.isError) {
        return;
      }
      if (saleHistory.loading) {
        setLoading(true);
        return;
      }

      const regionBegins = saleHistory.data
        .map((item) => item.region_begin)
        .sort((a, b) => b - a);

      await sleep(1000); // 5 req/s limit in free plan

      let total = 0;
      for (let idx = 0; idx < regionBegins.length; ++idx) {
        const regionBegin = regionBegins[idx];

        const res = await fetchPurchaseHistoryData(
          network,
          regionBegin,
          0,
          1000
        );
        if (res.status !== 200) {
          idx--;
          continue;
        }

        const { message, data } = await res.json();
        if (message !== 'Success') continue;

        const { list } = data as PurchaseHistoryResponse;
        const burn = list
          ? list.reduce((acc, { price }) => acc + parseInt(price), 0)
          : 0;
        total += burn;

        if (idx === 0) setCurrentBurn(burn);
        else if (idx === 1) setPrevBurn(burn);

        await sleep(500);
      }
      setTotalBurn(total);
      setLoading(false);
    };
    asyncFetchData();
  }, [network, saleHistory.loading, saleHistory.isError]);
  return { loading, totalBurn, currentBurn, prevBurn };
};
