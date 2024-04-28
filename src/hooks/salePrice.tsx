import { useCallback, useEffect, useState } from 'react';

import { getCurrentPrice } from '@/utils/sale/utils';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';
import { useRouter } from 'next/router';

interface SalePriceProps {
  at?: number;
}

const useSalePrice = ({ at }: SalePriceProps) => {
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);
  const router = useRouter();
  const { network } = router.query;

  const fetchCurrentPrice = async (at: number) => {
    if (at) {
      const price = getCurrentPrice(saleInfo, at, network);
      setCurrentPrice(price);
    }
  };

  useEffect(() => {
    if (!at) return;
    fetchCurrentPrice(at);
  }, [at]);

  return currentPrice;
};

export default useSalePrice;
