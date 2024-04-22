import { ApiPromise } from '@polkadot/api';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import {
  getBlockTime,
  getBlockTimestamp,
  parseHNString,
} from '@/utils/functions';
import {
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleProgress,
  getSaleStartInBlocks,
} from '@/utils/sale/utils';

import { Section } from '@/components/Elements';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

// Custom hook for fetching current phase
const useSalePhase = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const { saleInfo, config } = useSaleInfo();

  const [currentPhase, setCurrentPhase] = useState<SalePhase | null>(null);

  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);

  const [progress, setProgress] = useState<number | null>(0);
  const [saleSections, setSaleSections] = useState<Section[]>([]);

  const router = useRouter();
  const { network } = router.query;

  const fetchCurrentPhase = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = (await api.query.system.number()).toJSON() as number;
      const lastCommittedTimeslice = parseHNString(
        (
          (await api.query.broker.status()).toHuman() as any
        ).lastCommittedTimeslice.toString()
      );

      const _saleStart = getSaleStartInBlocks(saleInfo);
      const _saleEnd = getSaleEndInBlocks(
        saleInfo,
        blockNumber,
        lastCommittedTimeslice,
        network
      );

      getBlockTimestamp(api, _saleStart, getBlockTime(network)).then(
        (value: number) => setSaleStartTimestamp(value)
      );
      getBlockTimestamp(api, _saleEnd, getBlockTime(network)).then(
        (value: number) => setSaleEndTimestamp(value)
      );

      const progress = getSaleProgress(
        saleInfo,
        config,
        blockNumber,
        lastCommittedTimeslice,
        network
      );
      setProgress(progress);

      setCurrentPhase(getCurrentPhase(saleInfo, blockNumber));

      const saleDuration = _saleEnd - _saleStart;

      setSaleSections([
        { name: 'Interlude', value: 0 },
        {
          name: 'Leadin phase',
          value: (config.interludeLength / saleDuration) * 100,
        },
        {
          name: 'Fixed price phase',
          value:
            ((config.interludeLength + config.leadinLength) / saleDuration) *
            100,
        },
      ]);
    },
    [saleInfo, config, network]
  );

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;

    fetchCurrentPhase(api);
  }, [fetchCurrentPhase, api, apiState]);

  return {
    currentPhase,
    saleStartTimestamp,
    saleEndTimestamp,
    progress,
    saleSections,
  };
};

export default useSalePhase;
