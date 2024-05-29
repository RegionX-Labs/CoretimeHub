import { Signer } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import {
  Balance,
  ContextData,
  CoreIndex,
  RawRegionId,
  Region,
  TaskId,
  Timeslice,
} from 'coretime-utils';

import {
  ISMPRecordStatus,
  ParaState,
  RegionLocation,
  SalePhase,
} from './enums';

export type Percentage = number; // Percentage value between 0 and 1

export type ParaId = number;

export type BlockNumber = number;

export type Sender = {
  address: string;
  signer: Signer;
};

export type TxStatusHandlers = {
  ready: () => void;
  inBlock: () => void;
  finalized: () => void;
  success: () => void;
  error: () => void;
  finally?: () => void;
};

export type TaskMetadata = {
  id: TaskId;
  usage: Percentage;
  name?: string;
};

export type ScheduleItem = {
  mask: string;
  assignment:
    | {
        Task: string;
      }
    | 'Pool';
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

type Endpoint = {
  start: number;
  end: number;
};

export type PhaseEndpoints = {
  interlude: Endpoint;
  leadin: Endpoint;
  fixed: Endpoint;
};

export type SalePhaseInfo = {
  currentPhase: SalePhase;
  saleStartTimestamp: number;
  saleEndTimestamp: number;
  endpoints: PhaseEndpoints;
};

export class RegionMetadata {
  public region: Region;

  // Indicates the location of the region. It can either be on the Coretime chain, on the RegionX
  // parachain or listed on the market.
  public location: RegionLocation;

  // u128 encoded RegionId.
  //
  // This is used for when conducting cross-chain transfers, where `regionId` needs to be represented
  // as a u128.
  public rawId: RawRegionId;

  // A user set name for the region.
  public name: string | null;

  // This is essentially the Coremask of the region, representing the frequency with which the region will
  // be scheduled.
  //
  // A 100% Core Occupancy implies that the region occupies the entire Core.
  public coreOccupancy: Percentage;

  // Displays the current utilization of Coretime for the task assigned to the region.
  //
  // If no task is assigned, this value will be 0%, indicating that the Coretime is essentially being wasted.
  public currentUsage: Percentage;

  // Indicates the amount of time remaining until the region’s end, effectively showing the proportion of the
  // region that has already been ‘consumed’ or utilized.
  public consumed: Percentage;

  // The task to which the region is assigned. If null, it means that the region is not assigned to
  // any specific task.
  public taskId: TaskId | null;

  public status: ISMPRecordStatus;

  // If the record status is pending this contains the commitment hash of the ismp get request.
  public requestCommitment: string | null;

  public static construct(
    context: ContextData,
    rawId: BN,
    region: Region,
    name: string,
    regionLocation: RegionLocation,
    task: number | null,
    recordStatus: ISMPRecordStatus = ISMPRecordStatus.AVAILABLE,
    requestCommitment?: string
  ): RegionMetadata {
    const currentUsage = 0;

    return new RegionMetadata(
      region,
      regionLocation,
      rawId,
      name,
      region.coreOccupancy(),
      currentUsage,
      region.consumed(context),
      task,
      recordStatus,
      requestCommitment
    );
  }

  constructor(
    region: Region,
    location: RegionLocation,
    rawId: RawRegionId,
    name: string | null,
    coreOccupancy: Percentage,
    currentUsage: Percentage,
    consumed: Percentage,
    taskId: TaskId | null,
    status: ISMPRecordStatus = ISMPRecordStatus.AVAILABLE,
    requestCommitment?: string
  ) {
    this.region = region;
    this.location = location;
    this.rawId = rawId;
    this.name = name;
    this.coreOccupancy = coreOccupancy;
    this.currentUsage = currentUsage;
    this.consumed = consumed;
    this.taskId = taskId;
    this.status = status;
    this.requestCommitment = requestCommitment || null;
  }
}

export class Listing {
  /// The reigon listed on sale.
  public region: Region;
  /// The percentage of the region that got consumed by now.
  public regionConsumed: Percentage;
  /// The percentage of the core the region ocucupies.
  public regionCoreOccupancy: Percentage;
  /// The seller of the region.
  public seller: string;
  /// The price per timeslice set by the seller.
  public timeslicePrice: BN;
  /// The current total price of the region.
  public currentPrice: BN;
  /// The recepient of the sale.
  public saleRecepient: string | null;

  public static construct(
    context: ContextData,
    region: Region,
    seller: string,
    timeslicePrice: BN,
    currentPrice: BN,
    saleRecepient: string | null
  ): Listing {
    return new Listing(
      region,
      region.consumed(context),
      region.coreOccupancy(),
      seller,
      timeslicePrice,
      currentPrice,
      saleRecepient
    );
  }

  constructor(
    region: Region,
    regionConsumed: Percentage,
    regionCoreOccupancy: Percentage,
    seller: string,
    timeslicePrice: BN,
    currentPrice: BN,
    saleRecepient: string | null
  ) {
    this.region = region;
    this.regionConsumed = regionConsumed;
    this.regionCoreOccupancy = regionCoreOccupancy;
    this.seller = seller;
    this.timeslicePrice = timeslicePrice;
    this.currentPrice = currentPrice;
    this.saleRecepient = saleRecepient;
  }
}

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
