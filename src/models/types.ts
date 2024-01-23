import {
  Balance,
  CoreIndex,
  RawRegionId,
  Region,
  TaskId,
  Timeslice,
} from 'coretime-utils';

export type Percentage = number; // Percentage value between 0 and 1

export type ParaId = number;

export type BlockNumber = number;

export enum RegionLocation {
  // eslint-disable-next-line no-unused-vars
  CORETIME_CHAIN,
  // eslint-disable-next-line no-unused-vars
  CONTRACTS_CHAIN,
}

export class RegionMetadata {
  public region: Region;

  // Indicates the location of the region. It can either be on the Coretime chain or on the contracts
  // chain as an xc-region.
  public location: RegionLocation;

  // u128 encoded RegionId.
  //
  // This is used for interacting with the xc-regions contract or when conducting cross-chain transfers,
  // where `regionId` needs to be represented as a u128.
  public rawId: RawRegionId;

  // A user set name for the region.
  public name: string | null;

  // This is essentially the Coremask of the region, representing the frequency with which the region will
  // be scheduled.
  //
  // A 100% Coretime Ownership implies that the region occupies the entire Core.
  public coretimeOwnership: Percentage;

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

  constructor(
    region: Region,
    location: RegionLocation,
    rawId: RawRegionId,
    name: string | null,
    coretimeOwnership: Percentage,
    currentUsage: Percentage,
    consumed: Percentage,
    taskId: TaskId | null
  ) {
    this.region = region;
    this.location = location;
    this.rawId = rawId;
    this.name = name;
    this.coretimeOwnership = coretimeOwnership;
    this.currentUsage = currentUsage;
    this.consumed = consumed;
    this.taskId = taskId;
  }
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
  Interlude = "Interlude phase",
  Leadin = "Leadin phase",
  Regular = "Fixed price phase",
}
