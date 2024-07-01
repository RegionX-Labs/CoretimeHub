import { BN } from '@polkadot/util';
import { ContextData, RawRegionId, Region, TaskId } from 'coretime-utils';

import { ISMPRecordStatus } from './ismp';
import { Percentage } from '../common';

export * from './ismp';
export * from './sale';

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

export enum RegionLocation {
  // eslint-disable-next-line no-unused-vars
  CORETIME_CHAIN,
  // eslint-disable-next-line no-unused-vars
  REGIONX_CHAIN,
}

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
