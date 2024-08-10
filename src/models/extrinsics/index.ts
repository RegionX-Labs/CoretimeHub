export type ExtrinsicResponseItem = {
  call?: string;
  id?: string;
  module?: string;
  success?: boolean;
  timestamp?: string;
};

export type ExtrinsicsResponse = {
  totalCount: number;
  nodes: ExtrinsicResponseItem[] | null;
};

export type AccountTxHistoryItem = {
  extrinsicId: string;
  module: string;
  call: string;
  timestamp: Date;
  success: boolean;
};
