import { CoreMask, RawRegionId, RegionId, RegionRecord, TaskId } from "coretime-utils";

type Percentage = number; // Percentage value between 0 and 1

export enum RegionLocation {
  CORETIME_CHAIN,
  CONTRACTS_CHAIN,
}

export type RegionMetadata = {
  regionId: RegionId;
  regionRecord: RegionRecord;

  // Indicates the location of the region. It can either be on the Coretime chain or on the contracts 
  // chain as an xc-region.
  location: RegionLocation;

  // u128 encoded RegionId. 
  //
  // This is used for interacting with the xc-regions contract or when conducting cross-chain transfers,
  // where `regionId` needs to be represented as a u128.
  rawId: RawRegionId;

  // A user set name for the region.
  name: string | null;
  // This is essentially the Coremask of the region, representing the frequency with which the region will 
  // be scheduled. 
  //
  // A 100% Coretime Ownership implies that the region occupies the entire Core.
  coretimeOwnership: Percentage;

  // Displays the current utilization of Coretime for the task assigned to the region. 
  //
  // If no task is assigned, this value will be 0%, indicating that the Coretime is essentially being wasted.
  currentUsage: Percentage;

  // Indicates the amount of time remaining until the region’s end, effectively showing the proportion of the 
  // region that has already been ‘consumed’ or utilized.
  consumed: Percentage;

  // The task to which the region is assigned. If null, it means that the region is not assigned to 
  // any specific task.
  taskId: TaskId | null;
};

export type TaskMetadata = {
  id: TaskId;
  usage: Percentage;
  name?: string;
};

export type ScheduleItem = {
  mask: CoreMask;
  assignment: {
    Task: string;
  };
};
