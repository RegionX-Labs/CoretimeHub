import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { Signer } from '@polkadot/types/types';
import { Balance, CoreIndex, TaskId, Timeslice } from 'coretime-utils';

export { Listing } from './types/listing';
export { RegionMetadata } from './types/regionMetadata';

export type Percentage = number; // Percentage value between 0 and 1

export type ParaId = number;

export type BlockNumber = number;

export type SignerContext = {
  address: string;
  signer: Signer;
};

export type ContractContext = {
  contractsApi: ApiPromise | undefined;
  xcRegionsContract: ContractPromise | undefined;
  marketContract: ContractPromise | undefined;
};

export type TransactionResultHandlers = {
  onReady: () => void;
  onInBlock: () => void;
  onExtrinsicSuccess: () => void;
  onExtrinsicFailure: () => void;
};

export enum RegionLocation {
  // eslint-disable-next-line no-unused-vars
  CORETIME_CHAIN,
  // eslint-disable-next-line no-unused-vars
  CONTRACTS_CHAIN,
  // eslint-disable-next-line no-unused-vars
  MARKET,
}

export type TaskMetadata = {
  id: TaskId;
  usage: Percentage;
  name?: string;
};

export type ScheduleItem = {
  mask: string;
  assignment: {
    Task: string;
  };
};

export type SaleInfo = {
  /// The local block number at which the sale will/did start.
  saleStart: BlockNumber;
  /// The length in blocks of the Leadin Period (where the price is decreasing).
  leadinLength: BlockNumber;
  /// The price of Bulk Coretime after the Leadin Period.
  price: Balance;
  /// The first timeslice of the Regions which are being sold in this sale.
  regionBegin: Timeslice;
  /// The timeslice on which the Regions which are being sold in the sale terminate. (i.e. One
  /// after the last timeslice which the Regions control.)
  regionEnd: Timeslice;
  /// The number of cores we want to sell, ideally. Selling this amount would result in no
  /// change to the price for the next sale.
  idealCoresSold: CoreIndex;
  /// Number of cores which are/have been offered for sale.
  coresOffered: CoreIndex;
  /// The index of the first core which is for sale. Core of Regions which are sold have
  /// incrementing indices from this.
  firstCore: CoreIndex;
  /// The latest price at which Bulk Coretime was purchased until surpassing the ideal number of
  /// cores were sold.
  selloutPrice: Balance | null;
  /// Number of cores which have been sold; never more than cores_offered.
  coresSold: CoreIndex;
};

export enum SalePhase {
  // eslint-disable-next-line no-unused-vars
  Interlude = 'Interlude phase',
  // eslint-disable-next-line no-unused-vars
  Leadin = 'Leadin phase',
  // eslint-disable-next-line no-unused-vars
  Regular = 'Fixed price phase',
}

export type SaleConfig = {
  /// The number of Relay-chain blocks in advance which scheduling should be fixed and the
  /// `Coretime::assign` API used to inform the Relay-chain.
  advanceNotice: BlockNumber;
  /// The length in blocks of the Interlude Period for forthcoming sales.
  interludeLength: BlockNumber;
  /// The length in blocks of the Leadin Period for forthcoming sales.
  leadinLength: BlockNumber;
  /// The length in timeslices of Regions which are up for sale in forthcoming sales.
  regionLength: Timeslice;
  /// The proportion of cores available for sale which should be sold in order for the price
  /// to remain the same in the next sale.
  idealBulkProportion: any;
  /// An artificial limit to the number of cores which are allowed to be sold. If `Some` then
  /// no more cores will be sold than this.
  limitCoresOffered: CoreIndex | null;
  /// The amount by which the renewal price increases each sale period.
  renewalBump: any;
  /// The duration by which rewards for contributions to the InstaPool must be collected.
  contributionTimeout: Timeslice;
};
