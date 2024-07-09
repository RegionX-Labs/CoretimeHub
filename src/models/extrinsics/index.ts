export type ExtrinsicResponseItem = {
  account_display?: {
    account_index?: string;
    address?: string;
    display?: string;
    [x: string]: unknown;
  };
  additional_meta?: object;
  block_num?: number;
  block_timestamp?: number;
  call_module?: string;
  call_module_function?: string;
  extrinsic_hash?: string;
  extrinsic_index?: string;
  fee?: number;
  fee_used?: number;
  finalized?: boolean;
  id?: number;
  nonce?: number;
  success?: boolean;
  tip?: number;
};

export type ExtrinsicsResponse = {
  count: number;
  extrinsics: ExtrinsicResponseItem[] | null;
};

export type AccountTxHistoryItem = {
  extrinsicId: string;
  module: string;
  call: string;
  timestamp: number;
  success: boolean;
};
