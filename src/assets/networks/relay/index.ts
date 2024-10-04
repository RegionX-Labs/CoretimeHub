import { NetworkType } from '@/models';
import Kusama from './kusama.png';
import Polkadot from './polkadot.png';
import Rococo from './rococo.png';
import Westend from './westend.png';

const getIcon = (network: NetworkType) => {
  switch (network) {
    case NetworkType.POLKADOT:
      return Polkadot;
    case NetworkType.KUSAMA:
      return Kusama;
    case NetworkType.ROCOCO:
      return Rococo;
    case NetworkType.WESTEND:
      return Westend;
    default:
      Polkadot;
  }
};

export { Kusama, Polkadot, Rococo, Westend, getIcon };
