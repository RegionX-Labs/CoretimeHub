import { useCallback, useEffect, useState } from 'react';

import { getCorePriceAt } from '@/utils/sale';

import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';

interface SalePriceProps {
  at?: number;
}

const useSalePrice = ({ at }: SalePriceProps) => {
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);
  const { network } = useNetwork();

  const fetchCurrentPrice = useCallback(
    async (at: number) => {
      if (at) {
        const price = getCorePriceAt(at, saleInfo, network);
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
