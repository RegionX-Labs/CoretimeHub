import { useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';

type RenewableParachain = {
  core: number;
  paraId: number;
  price: number;
  mask: string;
  when: number;
};

// eslint-disable-next-line no-unused-vars
export enum Status {
  // eslint-disable-next-line no-unused-vars
  UNINITIALIZED,
  // eslint-disable-next-line no-unused-vars
  LOADING,
  // eslint-disable-next-line no-unused-vars
  LOADED,
}

export const useRenewableParachains = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const [status, setStatus] = useState<Status>(Status.UNINITIALIZED);
  const [parachains, setParachains] = useState<RenewableParachain[]>([]);

  useEffect(() => {
    if (apiState !== ApiState.READY) {
      setStatus(Status.UNINITIALIZED);
      setParachains([]);
    }

    const asyncFetchParaIds = async () => {
      if (!api || apiState !== ApiState.READY) return;

      setStatus(Status.LOADING);

      const renewals = await api.query.broker.allowedRenewals.entries();
      const chains: RenewableParachain[] = [];
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

        chains.push({
          core,
          price,
          mask,
          paraId: parseHNString(Task),
          when,
        });
      }

      setParachains(chains);

      setStatus(Status.LOADED);
    };

    asyncFetchParaIds();
  }, [api, apiState]);

  return { status, parachains };
};
