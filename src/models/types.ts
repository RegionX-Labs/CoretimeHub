type U32 = number;
type U16 = number;
type Address = string;
type Balance = U32;
type Percentage = number; // Percentage value between 0 and 1
export type Timestamp = number;

export type ParaID = number;
export type TaskIndex = number;

export type Timeslice = U32;
export type CoreIndex = U16;
export type CoreMask = string; // 80 bits bitmap
export type RawRegionId = Uint8Array; // 128 bits

export type OnChainRegionId = {
  begin: Timeslice;
  core: CoreIndex;
  mask: CoreMask;
};

export type HumanRegionId = {
  begin: string;
  core: CoreIndex;
  mask: CoreMask;
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
  origin?: RegionOrigin;
};

export enum RegionOrigin {
  // eslint-disable-next-line no-unused-vars
  CORETIME_CHAIN,
  // eslint-disable-next-line no-unused-vars
  CONTRACTS_CHAIN,
}

export type RegionMetadata = {
  begin: Timestamp;
  end: Timestamp;
  core: CoreIndex;
  mask: CoreMask;
  paid?: Balance;
  owner: Address;

  origin: RegionOrigin;

  rawId: OnChainRegionId; // raw region id in pallet storage
  name: string | null;
  ownership?: Percentage;
  consumed?: Percentage;
  taskId?: TaskIndex;
};

export type TaskMetadata = {
  id: TaskIndex;
  usage: Percentage;
  name?: string;
};

export type ScheduleItem = {
  mask: CoreMask;
  assignment: {
    Task: string;
  };
};

export const Id = {
  _enum: {
    U8: "u8",
    U16: "u16",
    U32: "u32",
    U64: "u64",
    U128: "u128",
  },
};

