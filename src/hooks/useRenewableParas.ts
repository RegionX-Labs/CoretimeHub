import { CoreMask } from 'coretime-utils';
import { useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';

type RenewableParachain = {
  core: number;
  paraID: number;
  price: number;
  mask: CoreMask;
  when: number;
};

export const useRenewableParachains = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const [loading, setLoading] = useState(false);
  const [parachains, setParachains] = useState<RenewableParachain[]>([]);

  useEffect(() => {
    if (apiState !== ApiState.READY) {
      setLoading(false);
      setParachains([]);
    }

    const asyncFetchParaIds = async () => {
      if (!api || apiState !== ApiState.READY) return;

      setLoading(true);

      const renewals = await api.query.broker.allowedRenewals.entries();
      for (const [key, value] of renewals) {
        const data: any = key.toHuman();
        const core = parseHNString(data[0].core);
        const when = parseHNString(data[0].when);

        const record: any = value.toHuman();
        const price = parseHNString(record.price);
        const {
          completion: { Complete },
        } = record;
        if (Complete === undefined) continue;
        if (Complete.length !== 1) continue;
        const [
          {
            mask,
            assignment: { Task },
          },
        ] = Complete;

        if (Task === undefined) continue;

        parachains.push({
          core,
          price,
          mask: new CoreMask(mask),
          paraID: parseHNString(Task),
          when,
        });
      }

      setParachains(parachains);

      setLoading(false);
    };

    asyncFetchParaIds();
  }, [api, apiState]);

  return { loading, parachains };
};
