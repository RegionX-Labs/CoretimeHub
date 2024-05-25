import {
  chainsAbandPNG,
  chainsAcurastPNG,
  chainsAltairSVG,
  chainsAmplitudeSVG,
  chainsAssethubKusamaSVG,
  chainsCoretimeKusamaSVG,
  chainsDorafactoryPNG,
  chainsGenshiroSVG,
  chainsGmJPEG,
  chainsKaruraSVG,
  chainsKicoPNG,
  chainsKintsugiPNG,
  chainsKreivoSVG,
  chainsListenPNG,
  chainsMangataPNG,
  chainsPeopleKusamaSVG,
  chainsQpnPNG,
  chainsRiodefiPNG,
  chainsShidenPNG,
  chainsTinkerPNG,
  chainsTuringPNG,
  chainsUnorthodoxPNG,
  nodesApronPNG,
  nodesAresMarsPNG,
  nodesBajunPNG,
  nodesBasiliskPNG,
  nodesBifrostSVG,
  nodesBitcountryPNG,
  nodesBridgeHubBlackSVG,
  nodesCalamariPNG,
  nodesCrabSVG,
  nodesCurioSVG,
  nodesDatahighwayPNG,
  nodesEncointerBlueSVG,
  nodesHyperbridgeSVG,
  nodesImbuePNG,
  nodesIntegriteeSVG,
  nodesIpciSVG,
  nodesKabochaSVG,
  nodesKhalaSVG,
  nodesKlaosPNG,
  nodesKrestPNG,
  nodesLitmusPNG,
  nodesLoomNetworkPNG,
  nodesMoonriverSVG,
  nodesParallelSVG,
  nodesPicassoPNG,
  nodesPichiuPNG,
  nodesPolkasmithSVG,
  nodesQuartzPNG,
  nodesRobonomicsSVG,
  nodesSakuraSVG,
  nodesShadowSVG,
  nodesSnowPNG,
  nodesSoraSubstrateSVG,
  nodesSubgameSVG,
  nodesSubsocialXSVG,
  nodesT1rnPNG,
  nodesTrustbasePNG,
  nodesXodePNG,
  nodesYerbanetworkPNG,
  nodesZeroSVG,
} from '@/assets/logos';

import { ChainDetails } from './types';
const prodParasKusama: ChainDetails[] = [
  {
    homepage: 'https://a.band',
    paraId: 2257,
    text: 'Aband',
    ui: {
      logo: chainsAbandPNG,
    },
  },
  {
    homepage: 'https://acurast.com',
    paraId: 2239,
    text: 'Acurast Canary',
    ui: {
      logo: chainsAcurastPNG,
    },
  },
  {
    homepage: 'https://centrifuge.io/altair',
    paraId: 2088,
    text: 'Altair',
    ui: {
      logo: chainsAltairSVG,
    },
  },
  {
    homepage: 'https://pendulumchain.org/amplitude',
    paraId: 2124,
    text: 'Amplitude',
    ui: {
      logo: chainsAmplitudeSVG,
    },
  },
  {
    homepage: 'https://ajuna.io',
    paraId: 2119,
    text: 'Bajun Network',
    ui: {
      logo: nodesBajunPNG,
    },
  },
  {
    homepage: 'https://app.basilisk.cloud',
    paraId: 2090,
    text: 'Basilisk',
    ui: {
      logo: nodesBasiliskPNG,
    },
  },
  {
    homepage: 'https://ksm.vtoken.io/?ref=polkadotjs',
    paraId: 2001,
    text: 'Bifrost',
    ui: {
      logo: nodesBifrostSVG,
    },
  },
  {
    homepage: 'https://www.calamari.network/',
    paraId: 2084,
    text: 'Calamari',
    ui: {
      logo: nodesCalamariPNG,
    },
  },
  {
    homepage: 'https://crab.network',
    paraId: 2105,
    text: 'Crab',
    ui: {
      logo: nodesCrabSVG,
    },
  },
  {
    homepage: 'https://crust.network/',
    paraId: 2012,
    text: 'Crust Shadow',
    ui: {
      logo: nodesShadowSVG,
    },
  },
  {
    homepage: 'https://crust.network/',
    paraId: 2225,
    text: 'Crust Shadow 2',
    ui: {
      logo: nodesShadowSVG,
    },
  },
  {
    paraId: 3339,
    text: 'Curio',
    ui: {
      logo: nodesCurioSVG,
    },
  },
  {
    homepage: 'https://ipci.io',
    paraId: 2222,
    text: 'DAO IPCI',
    ui: {
      logo: nodesIpciSVG,
    },
  },
  {
    homepage: 'https://dorafactory.org/kusama/',
    paraId: 2115,
    text: 'Dora Factory',
    ui: {
      logo: chainsDorafactoryPNG,
    },
  },
  {
    homepage: 'https://genshiro.io',
    paraId: 2024,
    text: 'Genshiro',
    ui: {
      logo: chainsGenshiroSVG,
    },
  },
  {
    homepage: 'https://genshiro.equilibrium.io',
    paraId: 2226,
    text: 'Genshiro crowdloan 2',
    ui: {
      logo: chainsGenshiroSVG,
    },
  },
  {
    homepage: 'https://gmordie.com',
    paraId: 2123,
    text: 'GM',
    ui: {
      logo: chainsGmJPEG,
    },
  },
  {
    homepage: 'https://hyperbridge.network',
    paraId: 3340,
    text: 'Hyperbridge (Messier)',
    ui: {
      logo: nodesHyperbridgeSVG,
    },
  },
  {
    homepage: 'https://imbue.network',
    paraId: 2121,
    text: 'Imbue Network',
    ui: {
      logo: nodesImbuePNG,
    },
  },
  {
    homepage: 'https://integritee.network',
    paraId: 2015,
    text: 'Integritee Network',
    ui: {
      logo: nodesIntegriteeSVG,
    },
  },
  {
    homepage: 'https://invarch.network/tinkernet',
    paraId: 2125,
    text: 'InvArch Tinkernet',
    ui: {
      logo: chainsTinkerPNG,
    },
  },
  {
    homepage: 'https://laosnetwork.io/',
    paraId: 3336,
    text: 'K-Laos',
    ui: {
      logo: nodesKlaosPNG,
    },
  },
  {
    homepage: 'https://kabocha.network',
    paraId: 2113,
    text: 'Kabocha',
    ui: {
      logo: nodesKabochaSVG,
    },
  },
  {
    homepage: 'https://acala.network/karura/join-karura',
    paraId: 2000,
    text: 'Karura',
    ui: {
      logo: chainsKaruraSVG,
    },
  },
  {
    homepage: 'https://phala.network/',
    paraId: 2004,
    text: 'Khala Network',
    ui: {
      logo: nodesKhalaSVG,
    },
  },
  {
    homepage: 'https://dico.io/',
    paraId: 2107,
    text: 'KICO',
    ui: {
      logo: chainsKicoPNG,
    },
  },
  {
    homepage: 'https://dico.io/',
    paraId: 2235,
    text: 'KICO 2',
    ui: {
      logo: chainsKicoPNG,
    },
  },
  {
    homepage: 'https://kintsugi.interlay.io/',
    paraId: 2092,
    text: 'Kintsugi BTC',
    ui: {
      logo: chainsKintsugiPNG,
    },
  },
  {
    homepage: 'http://apron.network/',
    paraId: 2019,
    text: 'Kpron',
    ui: {
      logo: nodesApronPNG,
    },
  },
  {
    homepage: 'https://virto.network/',
    paraId: 2281,
    text: 'Kreivo - By Virto',
    ui: {
      logo: chainsKreivoSVG,
    },
  },
  {
    homepage: 'https://krest.peaq.network/',
    paraId: 2241,
    text: 'Krest',
    ui: {
      logo: nodesKrestPNG,
    },
  },
  {
    homepage: 'https://listen.io/',
    paraId: 2118,
    text: 'Listen Network',
    ui: {
      logo: chainsListenPNG,
    },
  },
  {
    homepage: 'https://www.litentry.com/',
    paraId: 2106,
    text: 'Litmus',
    ui: {
      logo: nodesLitmusPNG,
    },
  },
  {
    homepage: 'https://loomx.io/',
    paraId: 2080,
    text: 'Loom Network',
    ui: {
      logo: nodesLoomNetworkPNG,
    },
  },
  {
    homepage: 'https://mangata.finance',
    paraId: 2110,
    text: 'Mangata',
    ui: {
      logo: chainsMangataPNG,
    },
  },
  {
    homepage: 'https://www.aresprotocol.io/mars',
    paraId: 2008,
    text: 'Mars',
    ui: {
      logo: nodesAresMarsPNG,
    },
  },
  {
    homepage: 'https://moonbeam.network/networks/moonriver/',
    paraId: 2023,
    text: 'Moonriver',
    ui: {
      logo: nodesMoonriverSVG,
    },
  },
  {
    homepage: 'https://parallel.fi',
    paraId: 2085,
    text: 'Parallel Heiko',
    ui: {
      logo: nodesParallelSVG,
    },
  },
  {
    homepage: 'https://parallel.fi',
    paraId: 2126,
    text: 'Parallel Heiko 2',
    ui: {
      logo: nodesParallelSVG,
    },
  },
  {
    homepage: 'https://picasso.composable.finance/',
    paraId: 2087,
    text: 'Picasso',
    ui: {
      logo: nodesPicassoPNG,
    },
  },
  {
    homepage: 'https://kylin.network/',
    paraId: 2102,
    text: 'Pichiu',
    ui: {
      logo: nodesPichiuPNG,
    },
  },
  {
    homepage: 'https://pioneer.bit.country/?ref=polkadotjs',
    paraId: 2096,
    text: 'Pioneer',
    ui: {
      logo: nodesBitcountryPNG,
    },
  },
  {
    homepage: 'https://polkasmith.polkafoundry.com/',
    paraId: 2009,
    text: 'PolkaSmith by PolkaFoundry',
    ui: {
      logo: nodesPolkasmithSVG,
    },
  },
  {
    paraId: 2274,
    text: 'Quantum Portal Network',
    ui: {
      logo: chainsQpnPNG,
    },
  },
  {
    homepage: 'https://unique.network/',
    paraId: 2095,
    text: 'QUARTZ by UNIQUE',
    ui: {
      logo: nodesQuartzPNG,
    },
  },
  {
    homepage: 'https://riodefi.com',
    paraId: 2227,
    text: 'RioDeFi',
    ui: {
      logo: chainsRiodefiPNG,
    },
  },
  {
    homepage: 'http://robonomics.network/',
    paraId: 2048,
    text: 'Robonomics',
    ui: {
      logo: nodesRobonomicsSVG,
    },
  },
  {
    homepage: 'http://robonomics.network/',
    paraId: 2240,
    text: 'Robonomics 2',
    ui: {
      logo: nodesRobonomicsSVG,
    },
  },
  {
    homepage: 'https://clover.finance/',
    paraId: 2016,
    text: 'Sakura',
    ui: {
      logo: nodesSakuraSVG,
    },
  },
  {
    homepage: 'https://shiden.astar.network/',
    paraId: 2007,
    text: 'Shiden',
    ui: {
      logo: chainsShidenPNG,
    },
  },
  {
    homepage: 'https://shiden.astar.network/',
    paraId: 2120,
    text: 'Shiden Crowdloan 2',
    ui: {
      logo: chainsShidenPNG,
    },
  },
  {
    homepage: 'https://icenetwork.io/snow',
    paraId: 2129,
    text: 'SNOW Network',
    ui: {
      logo: nodesSnowPNG,
    },
  },
  {
    homepage: 'https://sora.org/',
    paraId: 2011,
    text: 'SORA',
    ui: {
      logo: nodesSoraSubstrateSVG,
    },
  },
  {
    homepage: 'http://subgame.org/',
    paraId: 2018,
    text: 'SubGame Gamma',
    ui: {
      logo: nodesSubgameSVG,
    },
  },
  {
    homepage: 'https://subsocial.network/',
    paraId: 2100,
    text: 'SubsocialX',
    ui: {
      logo: nodesSubsocialXSVG,
    },
  },
  {
    homepage: 'https://www.t3rn.io/',
    paraId: 3334,
    text: 't1rn',
    ui: {
      logo: nodesT1rnPNG,
    },
  },
  {
    homepage: 'https://www.datahighway.com/',
    paraId: 2116,
    text: 'Tanganika',
    ui: {
      logo: nodesDatahighwayPNG,
    },
  },
  {
    homepage: 'https://trustbase.network/',
    paraId: 2078,
    text: 'TrustBase',
    ui: {
      logo: nodesTrustbasePNG,
    },
  },
  {
    homepage: 'https://oak.tech',
    paraId: 2114,
    text: 'Turing Network',
    ui: {
      logo: chainsTuringPNG,
    },
  },
  {
    homepage: 'https://standard.tech/',
    paraId: 2094,
    text: 'Unorthodox',
    ui: {
      logo: chainsUnorthodoxPNG,
    },
  },
  {
    homepage: 'https://xode.net',
    paraId: 3344,
    text: 'Xode',
    ui: {
      logo: nodesXodePNG,
    },
  },
  {
    homepage: 'https://yerba.network',
    paraId: 3345,
    text: 'Yerba Network',
    ui: {
      logo: nodesYerbanetworkPNG,
    },
  },
  {
    homepage: 'https://zero.io',
    paraId: 2236,
    text: 'ZERO Canary',
    ui: {
      logo: nodesZeroSVG,
    },
  },
  {
    paraId: 1000,
    relayName: 'kusama',
    text: 'AssetHub',
    ui: {
      logo: chainsAssethubKusamaSVG,
    },
  },
  {
    paraId: 1002,
    relayName: 'kusama',
    text: 'BridgeHub',
    ui: {
      logo: nodesBridgeHubBlackSVG,
    },
  },
  {
    paraId: 1005,
    relayName: 'kusama',
    text: 'Coretime',
    ui: {
      logo: chainsCoretimeKusamaSVG,
    },
  },
  {
    homepage: 'https://encointer.org/',
    paraId: 1001,
    relayName: 'kusama',
    text: 'Encointer Network',
    ui: {
      logo: nodesEncointerBlueSVG,
    },
  },
  {
    paraId: 1004,
    relayName: 'kusama',
    text: 'People',
    ui: {
      logo: chainsPeopleKusamaSVG,
    },
  },
];

export default prodParasKusama;
