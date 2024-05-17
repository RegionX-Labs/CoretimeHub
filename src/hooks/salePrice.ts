import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { getCurrentPrice } from '@/utils/sale';

import { useSaleInfo } from '@/contexts/sales';

interface SalePriceProps {
  at?: number;
}

const useSalePrice = ({ at }: SalePriceProps) => {
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);
  const router = useRouter();
  const { network } = router.query;

  const fetchCurrentPrice = useCallback(
    async (at: number) => {
      if (at) {
        const price = getCurrentPrice(saleInfo, at, network);
        setCurrentPrice(price);
      }
    },
    [network, saleInfo]
  );

  useEffect(() => {
    if (!at) return;
    fetchCurrentPrice(at);
  }, [at, fetchCurrentPrice]);

  return currentPrice;
};

export default useSalePrice;
