import { Timeslice } from 'coretime-utils';

import { Address, ParaId } from '../common';

type PartsOf57600 = number;

export type Order = {
  orderId: number;
  begin: Timeslice;
  end: Timeslice;
  creator: Address;
  exist: boolean;
  coreOccupancy: PartsOf57600;
  contribution: number;
  paraId: ParaId;
  totalContribution: number;
  processed: boolean;
};

export type OrderItem = {
  orderId: number;
  height: number;
  extrinsicId: number;
  timestamp: Date;
  begin: number;
  core: number;
  mask: string;
  account: string;
  reward: number;
};
