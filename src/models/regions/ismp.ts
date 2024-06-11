export type StateMachine = { Polkadot: number } | { Kusama: number };

export interface Get {
  source: StateMachine;
  dest: StateMachine;
  nonce: bigint;
  from: string;
  keys: Array<string>;
  height: bigint;
  timeout_timestamp: bigint;
}

export type IsmpRequest = { post: any } | { get: Get };

export enum ISMPRecordStatus {
  // eslint-disable-next-line no-unused-vars
  AVAILABLE,
  // eslint-disable-next-line no-unused-vars
  PENDING,
  // eslint-disable-next-line no-unused-vars
  UNAVAILABLE,
}
