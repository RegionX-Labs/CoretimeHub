import { useEffect, useState } from 'react';

import { getCorePriceAt } from '@/utils/sale';

import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';

const useSalePrice = (at?: number) => {
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);
  const { network } = useNetwork();

  useEffect(() => {
    if (!at) return;
    const fetchCurrentPrice = async () => {
      const price = getCorePriceAt(at, saleInfo, network);
      setCurrentPrice(price);
    };

    fetchCurrentPrice();
  }, [at, saleInfo]);

  return currentPrice;
};

export default useSalePrice;
