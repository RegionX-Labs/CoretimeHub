import {
  chainsKaruraSVG,
  chainsStandardPNG,
  nodesAssetHubSVG,
  nodesBridgeHubSVG,
  nodesCentrifugePNG,
  nodesIntegriteeSVG,
  nodesInterlaySVG,
  nodesKhalaSVG,
  nodesKylinPNG,
  nodesMoonshadowPNG,
} from '@/assets/logos';

import { ChainDetails } from './types';

const testParasWestend: ChainDetails[] = [
  {
    info: 'charcoal',
    paraId: 2086,
    providers: {
      // Centrifuge: 'wss://fullnode-collator.charcoal.centrifuge.io' // https://github.com/polkadot-js/apps/issues/8219
    },
    text: 'Charcoal',
    ui: {
      logo: nodesCentrifugePNG,
    },
  },
  {
    info: 'integritee',
    paraId: 2081,
    providers: {
      // Integritee: 'wss://teerw1.integritee.network' // https://github.com/polkadot-js/apps/issues/8937
    },
    text: 'Integritee Network',
    ui: {
      color: '#658ea9',
      logo: nodesIntegriteeSVG,
    },
  },
  {
    info: 'interlay',
    paraId: 2094,
    providers: {
      // Interlay: 'wss://api-westend.interlay.io/parachain' // https://github.com/polkadot-js/apps/issues/6261
    },
    text: 'Interlay',
    ui: {
      logo: nodesInterlaySVG,
    },
  },
  {
    info: 'moonshadow',
    paraId: 2002,
    providers: {
      // PureStake: 'wss://wss.moonshadow.testnet.moonbeam.network' // https://github.com/polkadot-js/apps/issues/6181
    },
    text: 'Moonshadow',
    ui: {
      color: '#53cbc9',
      logo: nodesMoonshadowPNG,
    },
  },
  {
    homepage: 'https://kylin.network/',
    info: 'westendPichiu',
    paraId: 2112,
    providers: {
      // 'Kylin Network': 'wss://westend.kylin-node.co.uk' // https://github.com/polkadot-js/apps/issues/8710
    },
    text: 'Pichiu',
    ui: {
      logo: nodesKylinPNG,
    },
  },
  {
    info: 'westendStandard',
    paraId: 2094,
    providers: {
      // 'Standard Protocol': 'wss://rpc.westend.standard.tech' // https://github.com/polkadot-js/apps/issues/8525
    },
    text: 'Standard',
    ui: {
      logo: chainsStandardPNG,
    },
  },
  {
    info: 'karura',
    paraId: 2005,
    providers: {
      // 'Acala Foundation': 'wss://karura-westend-rpc.aca-staging.network' // https://github.com/polkadot-js/apps/issues/5830
    },
    text: 'Wendala',
    ui: {
      logo: chainsKaruraSVG,
    },
  },
  {
    info: 'whala',
    paraId: 2013,
    providers: {
      // Phala: 'wss://whala.phala.network/ws' // https://github.com/polkadot-js/apps/issues/6181
    },
    text: 'Whala',
    ui: {
      color: '#03f3f3',
      logo: nodesKhalaSVG,
    },
  },
  {
    info: 'WestendAssetHub',
    isPeopleForIdentity: true,
    paraId: 1000,
    providers: {
      Dwellir: 'wss://asset-hub-westend-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://westmint-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/westmint',
      IBP2: 'wss://sys.dotters.network/westmint',
      // OnFinality: 'wss://westmint.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9955
      Parity: 'wss://westend-asset-hub-rpc.polkadot.io',
      // Stakeworld: 'wss://wnd-rpc.stakeworld.io/assethub'
    },
    relayName: 'westend',
    teleport: [-1],
    text: 'AssetHub',
    ui: {
      color: '#77bb77',
      logo: nodesAssetHubSVG,
    },
  },
  {
    info: 'westendBridgeHub',
    isPeopleForIdentity: true,
    paraId: 1002,
    providers: {
      Dwellir: 'wss://bridge-hub-westend-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://westend-bridge-hub-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/bridgehub-westend',
      IBP2: 'wss://sys.dotters.network/bridgehub-westend',
      // OnFinality: 'wss://bridgehub-westend.api.onfinality.io/public-ws', // https://github.com/polkadot-js/apps/issues/9960
      Parity: 'wss://westend-bridge-hub-rpc.polkadot.io',
    },
    relayName: 'westend',
    text: 'BridgeHub',
    ui: {
      logo: nodesBridgeHubSVG,
    },
  },
  {
    info: 'westendCollectives',
    isPeopleForIdentity: true,
    paraId: 1001,
    providers: {
      Dwellir: 'wss://collectives-westend-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://westend-collectives-rpc-tn.dwellir.com',
      IBP1: 'wss://sys.ibp.network/collectives-westend',
      IBP2: 'wss://sys.dotters.network/collectives-westend',
      Parity: 'wss://westend-collectives-rpc.polkadot.io',
    },
    relayName: 'westend',
    teleport: [-1],
    text: 'Collectives',
    ui: {
      color: '#e6777a',
      // logo: 'fa;people-group',
    },
  },
  {
    info: 'westendCoretime',
    isPeopleForIdentity: true,
    paraId: 1005,
    providers: {
      Dwellir: 'wss://coretime-westend-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/coretime-westend',
      IBP2: 'wss://sys.dotters.network/coretime-westend',
      Parity: 'wss://westend-coretime-rpc.polkadot.io',
    },
    relayName: 'westend',
    teleport: [-1],
    text: 'Coretime',
    ui: {},
  },
  {
    info: 'westendPeople',
    isPeople: true,
    isPeopleForIdentity: false,
    paraId: 1004,
    providers: {
      Dwellir: 'wss://people-westend-rpc.dwellir.com',
      IBP1: 'wss://sys.ibp.network/people-westend',
      IBP2: 'wss://sys.dotters.network/people-westend',
      Parity: 'wss://westend-people-rpc.polkadot.io',
    },
    relayName: 'westend',
    teleport: [-1],
    text: 'People',
    ui: {},
  },
];

export default testParasWestend;
