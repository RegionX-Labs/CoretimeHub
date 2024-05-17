import { useCallback, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { chainData } from '@/chaindata';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { ParachainInfo, ParaState } from '@/models';

export const useParasInfo = () => {
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { activeAccount },
  } = useAccounts();
  const { network } = useNetwork();

  const [loading, setLoading] = useState(false);
  const [parachains, setParachains] = useState<ParachainInfo[]>([]);
  const [nextParaId, setNextParaId] = useState<number>(0);
  const [reservationCost, setReservationCost] = useState<string>('0');
  const [dataDepositPerByte, setDataDepositPerByte] = useState(BigInt(0));
  const [maxCodeSize, setMaxCodeSize] = useState(BigInt(BigInt(0)));

  const fetchParaStates = useCallback(async () => {
    if (relayApiState !== ApiState.READY || !relayApi) return;
    setLoading(true);

    const fetchActiveParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];

      const workloads = await coretimeApi.query.broker.workload.entries();
      const ids: number[] = [];

      for (const [_, value] of workloads) {
        const {
          assignment: { task },
        } = (value.toJSON() as any)[0];
        if (task !== undefined) ids.push(task as number);
      }
      return ids;
    };

    const fetchWorkplanParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];

      const workloads = await coretimeApi.query.broker.workplan.entries();
      const ids: number[] = [];

      for (const [_, value] of workloads) {
        const {
          assignment: { task },
        } = (value.toJSON() as any)[0];
        if (task !== undefined) ids.push(task as number);
      }
      return ids;
    };

    const fetchLeaseHoldingParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];
      const leases = await coretimeApi.query.broker.leases();
      const ids = (
        leases.toJSON() as Array<{ until: number; task: number }>
      ).map((lease) => lease.task);
      return ids;
    };

    const fetchSystemParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];
      const leases: any = (
        (await coretimeApi.query.broker.reservations()).toJSON() as Array<any>
      ).map((e) => e[0]);
      const ids = (leases as Array<{ mask: string; assignment: any }>)
        .filter((lease) => lease.assignment.task)
        .map((lease) => lease.assignment.task);

      return ids;
    };

    const fetchParachainList = async (): Promise<ParachainInfo[]> => {
      const parasRaw = await relayApi.query.paras.paraLifecycles.entries();
      const paras: ParachainInfo[] = [];

      const activeParas = await fetchActiveParas();
      const workplanParas = await fetchWorkplanParas();
      const leaseHoldingParas = await fetchLeaseHoldingParas();
      const systemParas = await fetchSystemParas();

      for (const [key, value] of parasRaw) {
        const [strId] = key.toHuman() as [string];
        const id = parseInt(strId.replace(/,/g, ''));
        const strState = value.toString();
        const name = chainData[network][id] ?? '';
        const isActive = activeParas.indexOf(id) !== -1;
        const isInWorkplan = workplanParas.indexOf(id) !== -1;
        const isLeaseHolding = leaseHoldingParas.indexOf(id) !== -1;
        const isSystemPara = systemParas.indexOf(id) !== -1;

        const state = isSystemPara
          ? ParaState.SYSTEM
          : isLeaseHolding
          ? ParaState.LEASE_HOLDING
          : strState === 'Parathread'
          ? ParaState.ONDEMAND_PARACHAIN
          : isActive
          ? ParaState.ACTIVE_PARA
          : isInWorkplan
          ? ParaState.SOON_ACTIVE
          : ParaState.IDLE_PARA;

        paras.push({ id, state, name } as ParachainInfo);
      }
      return paras;
    };

    const fetchReservedParas = async (): Promise<ParachainInfo[]> => {
      const records = await relayApi.query.registrar.paras.entries();
      const paras: ParachainInfo[] = [];

      for (const [key, value] of records) {
        const id = parseHNString((key.toHuman() as any)[0]);
        const { manager } = value.toJSON() as any;

        if (manager === activeAccount?.address) {
          paras.push({
            id,
            state: ParaState.RESERVED,
            name: '',
          });
        }
      }
      return paras;
    };

    const fetchNextParaId = async () => {
      const idRaw = await relayApi.query.registrar.nextFreeParaId();
      const id = idRaw.toPrimitive() as number;
      setNextParaId(id);
    };

    const fetchReservationCost = () => {
      setReservationCost(relayApi.consts.registrar.paraDeposit.toString());
    };

    const fetchRegistrationConsts = async () => {
      const value = BigInt(
        relayApi.consts.registrar.dataDepositPerByte.toString()
      );
      setDataDepositPerByte(value);

      const { maxCodeSize } = (
        await relayApi.query.configuration.activeConfig()
      ).toJSON() as any;
      setMaxCodeSize(BigInt(maxCodeSize));
    };

    await Promise.all([
      fetchNextParaId(),
      fetchReservationCost(),
      fetchRegistrationConsts(),
    ]);

    const paras = await fetchParachainList();
    const reservedParas = await fetchReservedParas();

    paras.push(
      ...reservedParas.filter(
        ({ id }) => paras.find((v) => v.id === id) === undefined
      )
    );
    paras.sort((a, b) => a.id - b.id);

    setParachains(paras);
    setLoading(false);
  }, [
    relayApi,
    relayApiState,
    activeAccount,
    coretimeApi,
    coretimeApiState,
    network,
  ]);

  useEffect(() => {
    fetchParaStates();
  }, [fetchParaStates]);

  return {
    loading,
    parachains,
    config: {
      nextParaId,
      reservationCost,
      dataDepositPerByte,
      maxCodeSize,
    },
    fetchParaStates,
  };
};
