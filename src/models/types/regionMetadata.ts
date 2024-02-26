import { BN } from '@polkadot/util';
import { RawRegionId, Region, TaskId } from 'coretime-utils';

import { COREMASK_BYTES_LEN } from '../consts';
import { CommonData, Percentage, RegionLocation } from '../types';

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

  public static construct(
    context: CommonData,
    rawId: BN,
    region: Region,
    name: string,
    regionLocation: RegionLocation,
    task: number | null
  ): RegionMetadata {
    // rough estimation
    const beginBlockHeight = context.timeslicePeriod * region.getBegin();
    const endBlockHeight = context.timeslicePeriod * region.getEnd();
    const durationInBlocks = endBlockHeight - beginBlockHeight;

    let consumed =
      (context.relayBlockNumber - beginBlockHeight) / durationInBlocks;
    if (consumed < 0) {
      // This means that the region hasn't yet started.
      consumed = 0;
    }

    const coreOccupancy =
      region.getMask().countOnes() / (COREMASK_BYTES_LEN * 8);
    const currentUsage = 0;

    return new RegionMetadata(
      region,
      regionLocation,
      rawId,
      name,
      coreOccupancy,
      currentUsage,
      consumed,
      task
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
    taskId: TaskId | null
  ) {
    this.region = region;
    this.location = location;
    this.rawId = rawId;
    this.name = name;
    this.coreOccupancy = coreOccupancy;
    this.currentUsage = currentUsage;
    this.consumed = consumed;
    this.taskId = taskId;
  }
}
