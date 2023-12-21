type U32 = number;
type U16 = number;
type Address = string;
type Balance = U32;
type Percentage = number; // Percentage value between 0 and 1
export type Timestamp = number;

export type TaskIndex = number;

export type Timeslice = U32;
export type CoreIndex = U16;
export type CoreMask = Uint8Array; // 80 bits
export type CoreMaskString = '0x' & string;
export type RawRegionId = Uint8Array; // 128 bits

export type OnChainRegionId = {
  begin: Timeslice;
  core: CoreIndex;
  mask: CoreMask;
};

export type HumanRegionId = {
  begin: string;
  core: CoreIndex;
  mask: CoreMaskString;
};

export type OnChainRegionRecord = {
  end: Timeslice;
  owner: Address;
  paid?: Balance;
};

export type HumanRegionRecord = {
  end: string;
  owner: Address;
  paid?: string;
};

export type RegionMetadata = {
  begin: Timestamp;
  end: Timestamp;
  core: CoreIndex;
  mask: CoreMask;
  paid?: Balance;
  owner: Address;

  id: string;
  name?: string;
  ownership?: Percentage;
  consumed?: Percentage;
  task?: TaskMetadata;
};

export type TaskMetadata = {
  taskId: TaskIndex;
  usage: Percentage;
  name?: string;
};
