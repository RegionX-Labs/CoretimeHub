export enum ParaState {
  // eslint-disable-next-line no-unused-vars
  RESERVED,
  // eslint-disable-next-line no-unused-vars
  ONBOARDING,
  // eslint-disable-next-line no-unused-vars
  ONDEMAND_PARACHAIN,
  // eslint-disable-next-line no-unused-vars
  IDLE_PARA,
  // eslint-disable-next-line no-unused-vars
  ACTIVE_PARA,
  // eslint-disable-next-line no-unused-vars
  ACTIVE_RENEWABLE_PARA,
  // eslint-disable-next-line no-unused-vars
  IN_WORKPLAN,
  // eslint-disable-next-line no-unused-vars
  LEASE_HOLDING,
  // eslint-disable-next-line no-unused-vars
  SYSTEM,
}
export type ParachainInfo = {
  id: number;
  state: ParaState;
  name: string;
  watching?: boolean;
  logo?: string;
  homepage?: string;
};

export type LeaseState = {
  paraId: number;
  until: number;
};

export type BrokerStatus = {
  coreCount: number;
  privatePoolSize: number;
  systemPoolSize: number;
  lastCommittedTimeslice: number;
  lastTimeslice: number;
};
