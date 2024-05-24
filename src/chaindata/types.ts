export type ChainDetails = {
  homepage?: string;
  info?: string;
  isUnreachable?: boolean;
  isPeople?: boolean;
  isPeopleForIdentity?: boolean;
  paraId: number;
  providers?: Record<string, string>;
  relayName?: string;
  text: string;
  ui: {
    color?: string;
    logo?: string;
    identityIcon?: any;
  };
  teleport?: number[];
};

export type BaseChainInfo = {
  name: string;
  logo?: string;
};
