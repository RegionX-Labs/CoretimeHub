import { useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { ContextStatus, NetworkType } from '@/models';

export type RenewableParachain = {
  core: number;
  paraId: number;
  price: number;
  mask: string;
  when: number;
};

export const useRenewableParachains = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const [status, setStatus] = useState<ContextStatus>(ContextStatus.UNINITIALIZED);
  const [parachains, setParachains] = useState<RenewableParachain[]>([]);
  const { network } = useNetwork();

  useEffect(() => {
    if (apiState !== ApiState.READY) {
      setStatus(ContextStatus.UNINITIALIZED);
      setParachains([]);
    }

    const asyncFetchParaIds = async () => {
      if (!api || apiState !== ApiState.READY) return;

      setStatus(ContextStatus.LOADING);

      const renewals = [NetworkType.ROCOCO, NetworkType.WESTEND].includes(network)
        ? await api.query.broker.potentialRenewals.entries()
        : await api.query.broker.allowedRenewals.entries();
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

      setParachains(chains.sort((a, b) => a.paraId - b.paraId));

      setStatus(ContextStatus.LOADED);
    };

    asyncFetchParaIds();
  }, [api, apiState, network]);

  return { status, parachains };
};
