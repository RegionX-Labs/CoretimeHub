import {
  chainsAcurastPNG,
  chainsAmplitudeSVG,
  chainsBitgreenPNG,
  chainsGenshiroSVG,
  chainsHydratePNG,
  chainsIdiyanaleLogoWhiteSVG,
  chainsJurPNG,
  chainsLaosPNG,
  chainsMangataPNG,
  chainsMoonsamaPNG,
  chainsNeurowebTestnetPNG,
  chainsSnowbridgePNG,
  chainsT0rnPNG,
  chainsTinkerPNG,
  chainsTotemSVG,
  chainsTuringPNG,
  chainsVirtoPNG,
  chainsWatrPNG,
  nodesArcticPNG,
  nodesAssetHubSVG,
  nodesAventusSVG,
  nodesBasiliskPNG,
  nodesBasiliskRococoBgPNG,
  nodesBridgeHubBlackSVG,
  nodesCentrifugePNG,
  nodesConftiSVG,
  nodesCrustParachainSVG,
  nodesCurioSVG,
  nodesDatahighwayPNG,
  nodesDolphinSVG,
  nodesEncointerBlueSVG,
  nodesGiantPNG,
  nodesHelixstreetPNG,
  nodesHyperbridgePNG,
  nodesImbuePNG,
  nodesIntegriteeSVG,
  nodesInvoPNG,
  nodesKabochaSVG,
  nodesKiltPNG,
  nodesKineraPNG,
  nodesLitentryRococoPNG,
  nodesMagnetPNG,
  nodesMd5PNG,
  nodesMusePNG,
  nodesOliSVG,
  nodesOzPNG,
  nodesPhalaSVG,
  nodesPicassoPNG,
  nodesPolkadexSVG,
  nodesRegionxCocosPNG,
  nodesRexSVG,
  nodesRobonomicsSVG,
  nodesRocfinitySVG,
  nodesSocietalSVG,
  nodesSoonsocialXPNG,
  nodesSoraSubstrateSVG,
  nodesSubstrateContractsNodePNG,
  nodesUnitnetworkPNG,
  nodesYerbanetworkPNG,
  nodesZeitgeistPNG,
  nodesZeroSVG,
} from '@/assets/logos';

import { ChainDetails } from './types';

const testParasRococo: ChainDetails[] = [
  {
    homepage: 'https://acurast.com',
    info: 'rococoAcurast',
    paraId: 2239,
    providers: {
      // Acurast: 'wss://acurast-testnet-ws.prod.gke.papers.tech' // https://github.com/polkadot-js/apps/issues/10566
    },
    text: 'Acurast Testnet',
    ui: {
      color: '#000000',
      logo: chainsAcurastPNG,
    },
  },
  {
    info: 'rococoAmplitude',
    paraId: 2124,
    providers: {
      PendulumChain: 'wss://rpc-foucoco.pendulumchain.tech',
    },
    text: 'Amplitude testnet (Foucoco)',
    ui: {
      color: '#5DEFA7',
      logo: chainsAmplitudeSVG,
    },
  },
  {
    info: 'arctic',
    paraId: 3015,
    providers: {
      // Arctic: 'wss://arctic-rococo-rpc.icenetwork.io' // https://github.com/polkadot-js/apps/issues/9224
    },
    text: 'Arctic',
    ui: {
      logo: nodesArcticPNG,
    },
  },
  {
    homepage: 'https://www.aventus.io/',
    info: 'rococoAventus',
    paraId: 2056,
    providers: {
      Aventus: 'wss://public-rpc.testnet.aventus.network',
    },
    text: 'Aventus',
    ui: {
      color: '#E6E6FA',
      logo: nodesAventusSVG,
    },
  },
  {
    info: 'rococoBasilisk',
    paraId: 2090,
    providers: {
      'Galactic Council': 'wss://basilisk-rococo-rpc.play.hydration.cloud',
    },
    text: 'Basilisk',
    ui: {
      color: `url(${nodesBasiliskRococoBgPNG}) #000`,
      logo: nodesBasiliskPNG,
    },
  },
  {
    info: 'rococoBitgreen',
    paraId: 20048,
    providers: {
      // Bitgreen: 'wss://staging.bitgreen.org' // https://github.com/polkadot-js/apps/issues/9369
    },
    text: 'Bitgreen',
    ui: {
      color: '#224851',
      logo: chainsBitgreenPNG,
    },
  },
  {
    info: 'rococoCatalyst',
    paraId: 2031,
    providers: {
      // Centrifuge: 'wss://fullnode.catalyst.cntrfg.com' // https://github.com/polkadot-js/apps/issues/9748
    },
    text: 'Catalyst',
    ui: {
      logo: nodesCentrifugePNG,
    },
  },
  {
    info: 'rococoConfti',
    paraId: 4094,
    providers: {
      // Confti: 'wss://ws.confti.club' // https://github.com/polkadot-js/apps/issues/8036
    },
    text: 'Confti',
    ui: {
      logo: nodesConftiSVG,
    },
  },
  {
    info: 'rococoCrust',
    paraId: 2012,
    providers: {
      // Crust: 'wss://rococo-csm.crustcode.com/' // https://github.com/polkadot-js/apps/issues/9025
    },
    text: 'Crust Testnet',
    ui: {
      logo: nodesCrustParachainSVG,
    },
  },
  {
    info: 'rococoCurio',
    paraId: 3339,
    providers: {
      Curio: 'wss://testnet.parachain.curioinvest.com/',
    },
    text: 'Curio Testnet',
    ui: {
      color: 'rgb(96, 98, 246)',
      logo: nodesCurioSVG,
    },
  },
  {
    info: 'rococoDolphin',
    paraId: 2084,
    providers: {
      // 'Manta Network': 'wss://ws.rococo.dolphin.engineering' // https://github.com/polkadot-js/apps/issues/9071
    },
    text: 'Dolphin',
    ui: {
      logo: nodesDolphinSVG,
    },
  },
  {
    info: 'rococoEthos',
    paraId: 2095,
    providers: {
      // Jur: 'wss://ethos.jur.io' // https://github.com/polkadot-js/apps/issues/10025
    },
    text: 'Ethos',
    ui: {
      color: '#203050',
      logo: chainsJurPNG,
    },
  },
  {
    info: 'rococoGenshiro',
    paraId: 2024,
    providers: {
      // Equilibrium: 'wss://parachain-testnet.equilab.io/rococo/collator/node1/wss' // https://github.com/polkadot-js/apps/issues/9059
    },
    text: 'Genshiro Testnet',
    ui: {
      color: '#e8662d',
      logo: chainsGenshiroSVG,
    },
  },
  {
    info: 'giantTestnet',
    paraId: 4227,
    providers: {
      // GIANT: 'wss://rpc-1-us-east-1-testnetrococo.giantprotocol.org' // https://github.com/polkadot-js/apps/issues/9261
    },
    text: 'GIANT Protocol',
    ui: {
      color: '#45B549',
      logo: nodesGiantPNG,
    },
  },
  {
    homepage: 'https://laosnetwork.io/',
    info: 'rorocoLaos',
    paraId: 4343,
    providers: {
      'Freeverse.io': 'wss://rpc.giedi.laosfoundation.io',
    },
    text: 'Giedi',
    ui: {
      color: '#dffe77',
      logo: chainsLaosPNG,
    },
  },
  {
    info: 'helixstreet',
    paraId: 3025,
    providers: {
      // Helixstreet: 'wss://rpc-rococo.helixstreet.io' // https://github.com/polkadot-js/apps/issues/9296
    },
    text: 'Helixstreet',
    ui: {
      logo: nodesHelixstreetPNG,
    },
  },
  {
    info: 'rococoHydraDX',
    paraId: 2034,
    providers: {
      // 'Galactic Council': 'wss://hydradx-rococo-rpc.play.hydration.cloud' // https://github.com/polkadot-js/apps/issues/10667
    },
    text: 'HydraDX',
    ui: {
      color: '#f653a2',
      logo: chainsHydratePNG,
    },
  },
  {
    homepage: 'https://hyperbridge.network',
    info: 'rococoHyperbridge',
    paraId: 4374,
    providers: {
      // BlockOps: 'wss://hyperbridge-gargantua-rpc.blockops.network' // https://github.com/polkadot-js/apps/issues/10667
    },
    text: 'Hyperbridge (Gargantua)',
    ui: {
      color: '#ED6FF1',
      logo: nodesHyperbridgePNG,
    },
  },
  {
    info: 'rococoIdiyanale',
    paraId: 4222,
    providers: {
      // 'Anagolay Network': 'wss://rococo.rpc.idiyanale.anagolay.io' // https://github.com/polkadot-js/apps/issues/9292
    },
    text: 'Idiyanale Network',
    ui: {
      color: 'linear-gradient(90deg, #23ACF6 0%, #6FD606 100%)',
      logo: chainsIdiyanaleLogoWhiteSVG,
    },
  },
  {
    info: 'rococoImbue',
    paraId: 2121,
    providers: {
      // 'Imbue Network': 'wss://rococo.imbue.network' // https://github.com/polkadot-js/apps/issues/9947
    },
    text: 'Imbue Network',
    ui: {
      color: '#baff36',
      logo: nodesImbuePNG,
    },
  },
  {
    info: 'rococoIntegritee',
    paraId: 3002,
    providers: {
      // Integritee: 'wss://rococo.api.integritee.network' // https://github.com/polkadot-js/apps/issues/10353
    },
    text: 'Integritee Network',
    ui: {
      color: '#658ea9',
      logo: nodesIntegriteeSVG,
    },
  },
  {
    homepage: 'https://ourinvo.com/',
    info: 'rococoInvo',
    paraId: 4377,
    providers: {
      // 'Invo Network': 'wss://chain.dev.ourinvo.com' // https://github.com/polkadot-js/apps/issues/10555
    },
    text: 'Invo Testnet',
    ui: {
      color: '#000000',
      logo: nodesInvoPNG,
    },
  },
  {
    info: 'rococoKabocha',
    paraId: 2113,
    providers: {
      // JelliedOwl: 'wss://kabsoup1.jelliedowl.com' // https://github.com/polkadot-js/apps/issues/9059
    },
    text: 'Kabocha (kabsoup)',
    ui: {
      color: 'repeating-radial-gradient(black, black 4px, yellow 5px)',
      logo: nodesKabochaSVG,
    },
  },
  {
    homepage: 'https://polkadex.trade',
    info: 'rococoKaizen',
    paraId: 2040,
    providers: {
      // 'Polkadex Team': 'wss://kaizen-parachain.polkadex.trade' // https://github.com/polkadot-js/apps/issues/9059
    },
    text: 'Kaizen',
    ui: {
      color: '#7C30DD',
      logo: nodesPolkadexSVG,
    },
  },
  {
    info: 'rococoKinera',
    isPeopleForIdentity: true,
    paraId: 4437,
    providers: {
      'Kinera Node': 'wss://node.kinera.network',
    },
    text: 'Kinera Testnet',
    ui: {
      color: '#000000',
      logo: nodesKineraPNG,
    },
  },
  {
    homepage: 'https://www.litentry.com/',
    info: 'rococoLitentry',
    paraId: 2106,
    providers: {
      Litentry: 'wss://rpc.rococo-parachain.litentry.io',
    },
    text: 'Litentry',
    ui: {
      color: '#ECDA38',
      logo: nodesLitentryRococoPNG,
    },
  },
  {
    homepage: 'https://magnet.magport.io/',
    info: 'rococoMagnet',
    paraId: 4361,
    providers: {
      Magnet: 'wss://magnet-rpc.magport.io/ws',
    },
    text: 'Magnet',
    ui: {
      color: '#58BFAB',
      logo: nodesMagnetPNG,
    },
  },
  {
    info: 'rococoMangata',
    paraId: 2110,
    providers: {
      Mangata: 'wss://collator-01-ws-rococo.mangata.online',
    },
    text: 'Mangata',
    ui: {
      color: '#030408',
      logo: chainsMangataPNG,
    },
  },
  {
    info: 'rococoMd5',
    paraId: 2093,
    providers: {
      'Hashed Systems': 'wss://c1md5.hashed.network',
    },
    text: 'MD5 Network',
    ui: {
      color: '#175bae',
      logo: nodesMd5PNG,
    },
  },
  {
    info: 'rococoMoonsama',
    paraId: 2055,
    providers: {
      // Moonsama: 'wss://moonsama-testnet-rpc.moonsama.com' // https://github.com/polkadot-js/apps/issues/7526
    },
    text: 'Moonsama',
    ui: {
      color: '#000000',
      logo: chainsMoonsamaPNG,
    },
  },
  {
    info: 'rococoMuse',
    paraId: 3369,
    providers: {
      Parity: 'wss://rococo-muse-rpc.polkadot.io',
    },
    text: 'Muse network',
    ui: {
      color: '#110ff9',
      logo: nodesMusePNG,
    },
  },
  {
    homepage: 'https://neuroweb.ai',
    info: 'rococoNeuroWeb',
    paraId: 2043,
    providers: {
      TraceLabs: 'wss://parachain-testnet-rpc.origin-trail.network/',
    },
    text: 'NeuroWeb Testnet',
    ui: {
      color: '#646566',
      logo: chainsNeurowebTestnetPNG,
    },
  },
  {
    homepage: 'https://www.my-oli.com/en/',
    info: 'chainoli',
    paraId: 4023,
    providers: {},
    text: 'OLI',
    ui: {
      color: '#8CC63F',
      logo: nodesOliSVG,
    },
  },
  {
    info: 'rococoOpenZeppelin',
    paraId: 4354,
    providers: {},
    text: 'OpenZeppelin Runtime Template',
    ui: {
      color: '#f653a2',
      logo: nodesOzPNG,
    },
  },
  {
    info: 'rococoPicasso',
    paraId: 2087,
    providers: {
      // Composable: 'wss://picasso-rococo-rpc-lb.composablenodes.tech' // https://github.com/polkadot-js/apps/issues/10103
    },
    text: 'Picasso Testnet',
    ui: {
      color: '#000000',
      logo: nodesPicassoPNG,
    },
  },
  {
    info: 'regionxCocos',
    paraId: 4479,
    providers: {
      RegionX: 'wss://cocos-node.regionx.tech',
    },
    text: 'RegionX Cocos',
    ui: {
      color: '#0CC184',
      logo: nodesRegionxCocosPNG,
    },
  },
  {
    info: 'rococoEwx',
    paraId: 3345,
    providers: {
      'Energy Web': 'wss://public-rpc.testnet.energywebx.com/',
    },
    text: 'REX',
    ui: {
      color: '#452E66',
      logo: nodesRexSVG,
    },
  },
  {
    info: 'rococoPhala',
    paraId: 2004,
    providers: {
      'Phala Network': 'wss://rhala-node.phala.network/ws',
    },
    text: 'Rhala Testnet',
    ui: {
      logo: nodesPhalaSVG,
    },
  },
  {
    info: 'rococoKilt',
    paraId: 2086,
    providers: {
      BOTLabs: 'wss://rilt.kilt.io',
    },
    text: 'RILT',
    ui: {
      color: 'linear-gradient(45deg, #8c145a 0%, #f05a27 100%)',
      logo: nodesKiltPNG,
    },
  },
  {
    homepage: 'http://robonomics.network/',
    info: 'robonomics',
    paraId: 2048,
    providers: {
      // Airalab: 'wss://rococo.rpc.robonomics.network' // https://github.com/polkadot-js/apps/issues/9319
    },
    text: 'Robonomics',
    ui: {
      color: '#2949d3',
      logo: nodesRobonomicsSVG,
    },
  },
  {
    info: 'rocfinity',
    paraId: 2021,
    providers: {
      // Efinity: 'wss://rpc.rococo.efinity.io' // https://github.com/polkadot-js/apps/issues/9059
    },
    text: 'Rocfinity',
    ui: {
      color: '#496ddb',
      logo: nodesRocfinitySVG,
    },
  },
  {
    info: 'snowbridgeAssetHub',
    paraId: 3416,
    providers: {
      // Snowfork: 'wss://rococo-rpc.snowbridge.network/assethub' // https://github.com/polkadot-js/apps/issues/10091
    },
    text: 'Snowbridge Asset Hub',
    ui: {
      logo: chainsSnowbridgePNG,
    },
  },
  {
    info: 'snowbridgeBridgeHub',
    paraId: 3016,
    providers: {
      // Snowfork: 'wss://rococo-rpc.snowbridge.network/bridgehub' // https://github.com/polkadot-js/apps/issues/10091
    },
    text: 'Snowbridge Bridge Hub',
    ui: {
      logo: chainsSnowbridgePNG,
    },
  },
  {
    info: 'rococoSocietal',
    paraId: 4253,
    providers: {
      // Societal: 'wss://node-ws-rococo.testnet.sctl.link' // https://github.com/polkadot-js/apps/issues/9748
    },
    text: 'Societal',
    ui: {
      color: '#501254',
      logo: nodesSocietalSVG,
    },
  },
  {
    info: 'rococoSubsocial',
    paraId: 2100,
    providers: {
      DappForce: 'wss://rco-para.subsocial.network',
    },
    text: 'SoonsocialX',
    ui: {
      color: '#b9018c',
      logo: nodesSoonsocialXPNG,
    },
  },
  {
    info: 'rococoSora',
    paraId: 2011,
    providers: {
      Soramitsu: 'wss://ws.parachain-collator-1.c1.stg1.sora2.soramitsu.co.jp',
    },
    text: 'SORA',
    ui: {
      color: '#2D2926',
      logo: nodesSoraSubstrateSVG,
    },
  },
  {
    info: 'rococoSpreehafen',
    paraId: 2116,
    providers: {
      // DataHighway: 'wss://spreehafen.datahighway.com' // https://github.com/polkadot-js/apps/issues/9601
    },
    text: 'Spreehafen',
    ui: {
      color: 'linear-gradient(-90deg, #9400D3 0%, #5A5CA9 50%, #00BFFF 100%)',
      logo: nodesDatahighwayPNG,
    },
  },
  {
    homepage: 'https://totemaccounting.com/',
    info: 'stagex',
    paraId: 2007,
    providers: {
      // Totem: 'wss://s-ui.kapex.network' // https://github.com/polkadot-js/apps/issues/9286
    },
    text: 'Stagex',
    ui: {
      color: 'linear-gradient(158deg, rgba(226,157,0,1) 0%, rgba(234,55,203,1) 100%)',
      logo: chainsTotemSVG,
    },
  },
  {
    info: 'rococoSubzero',
    paraId: 4040,
    providers: {
      // ZERO: 'wss://staging.para.sub.zero.io' // https://github.com/polkadot-js/apps/issues/9522
    },
    text: 'Subzero',
    ui: {
      logo: nodesZeroSVG,
    },
  },
  {
    info: 't0rn',
    paraId: 3333,
    providers: {
      t3rn: 'wss://rpc.t0rn.io',
    },
    text: 't0rn',
    ui: {
      color: '#212322',
      logo: chainsT0rnPNG,
    },
  },
  {
    info: 'rococoTinkernet',
    paraId: 2125,
    providers: {
      // 'InvArch Team': 'wss://rococo.invarch.network' // https://github.com/polkadot-js/apps/issues/8266
    },
    text: 'Tinkernet',
    ui: {
      color: 'linear-gradient(90deg, rgba(253,52,166,1) 0%, rgba(22,213,239,1) 100%)',
      logo: chainsTinkerPNG,
    },
  },
  {
    info: 'rococoTuring',
    paraId: 2114,
    providers: {
      // OAK: 'wss://rpc.turing-staging.oak.tech' // https://github.com/polkadot-js/apps/issues/10555
    },
    text: 'Turing Network (Staging)',
    ui: {
      color: '#A8278C',
      logo: chainsTuringPNG,
    },
  },
  {
    info: 'rococoUnitNetwork',
    paraId: 4168,
    providers: {
      // UnitNetwork: 'wss://www.unitnode3.info:443' // https://github.com/polkadot-js/apps/issues/9609
    },
    text: 'Unit Network',
    ui: {
      color: '#a351ef',
      logo: nodesUnitnetworkPNG,
    },
  },
  {
    info: 'rococoVirto',
    paraId: 3003,
    providers: {
      // VirtoNetwork: 'wss://rococo.virtonetwork.xyz' // https://github.com/polkadot-js/apps/issues/8024
    },
    text: 'Virto',
    ui: {
      color: '#063970',
      logo: chainsVirtoPNG,
    },
  },
  {
    info: 'rococoWatr',
    paraId: 2058,
    providers: {
      Watr: 'wss://rpc.dev.watr.org',
    },
    text: 'Watr Network',
    ui: {
      color: '#373b39',
      logo: chainsWatrPNG,
    },
  },
  {
    info: 'rococoYerba',
    paraId: 4292,
    providers: {
      Yerba: 'wss://rpc.dev.yerba.network',
    },
    text: 'Yerba Network',
    ui: {
      color: '#4f6f4b',
      logo: nodesYerbanetworkPNG,
    },
  },
  {
    info: 'rococoZeitgeist',
    paraId: 2101,
    providers: {
      Zeitgeist: 'wss://bsr.zeitgeist.pm',
    },
    text: 'Zeitgeist Battery Station',
    ui: {
      color:
        'linear-gradient(180deg, rgba(32,90,172,1) 0%, rgba(26,72,138,1) 50%, rgba(13,36,69,1) 100%)',
      logo: nodesZeitgeistPNG,
    },
  },
  {
    paraId: 1000,
    teleport: [-1],
    text: 'AssetHub',
    ui: {
      logo: nodesAssetHubSVG,
    },
  },
  {
    paraId: 1013,
    text: 'Bridgehub',
    ui: {
      logo: nodesBridgeHubBlackSVG,
    },
  },
  {
    paraId: 1002,
    relayName: 'rococo',
    text: 'Contracts',
    ui: {
      logo: nodesSubstrateContractsNodePNG,
    },
  },
  {
    paraId: 1005,
    text: 'Coretime',
    ui: {},
  },
  {
    homepage: 'https://encointer.org/',
    paraId: 1003,
    text: 'Encointer Lietaer',
    ui: {
      logo: nodesEncointerBlueSVG,
    },
  },
  {
    paraId: 1004,
    text: 'People',
    ui: {},
  },
];

export default testParasRococo;
