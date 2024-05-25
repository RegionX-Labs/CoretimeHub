import {
  chainsAcurastPNG,
  chainsAmplitudeSVG,
  chainsBitgreenPNG,
  chainsFrequencySVG,
  chainsGenshiroSVG,
  chainsHydratePNG,
  chainsIdiyanaleLogoWhiteSVG,
  chainsJurPNG,
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
  nodesAventusSVG,
  nodesBajunPNG,
  nodesBasiliskPNG,
  nodesCentrifugePNG,
  nodesConftiSVG,
  nodesCrustParachainSVG,
  nodesCurioSVG,
  nodesDatahighwayPNG,
  nodesDolphinSVG,
  nodesGiantPNG,
  nodesGiediPNG,
  nodesHelixstreetPNG,
  nodesHyperbridgeSVG,
  nodesImbuePNG,
  nodesIntegriteeSVG,
  nodesInvoPNG,
  nodesKabochaSVG,
  nodesKiltPNG,
  nodesLitentryRococoPNG,
  nodesMd5PNG,
  nodesMusePNG,
  nodesOliSVG,
  nodesOzPNG,
  nodesPangolinSVG,
  nodesPhalaSVG,
  nodesPicassoPNG,
  nodesPolkadexSVG,
  nodesRexSVG,
  nodesRobonomicsSVG,
  nodesRocfinitySVG,
  nodesSocietalSVG,
  nodesSoonsocialXPNG,
  nodesSoraSubstrateSVG,
  nodesUnitnetworkPNG,
  nodesYerbanetworkPNG,
  nodesZeitgeistPNG,
  nodesZeroSVG,
} from '@/assets/logos';

import { ChainDetails } from './types';

const testParasRococo: ChainDetails[] = [
  {
    homepage: 'https://acurast.com',
    paraId: 2239,
    text: 'Acurast Testnet',
    ui: {
      logo: chainsAcurastPNG,
    },
  },
  {
    paraId: 2124,
    text: 'Amplitude testnet (Foucoco)',
    ui: {
      logo: chainsAmplitudeSVG,
    },
  },
  {
    paraId: 3015,
    text: 'Arctic',
    ui: {
      logo: nodesArcticPNG,
    },
  },
  {
    homepage: 'https://www.aventus.io/',
    paraId: 2056,
    text: 'Aventus',
    ui: {
      logo: nodesAventusSVG,
    },
  },
  {
    paraId: 2119,
    text: 'Bajun Network',
    ui: {
      logo: nodesBajunPNG,
    },
  },
  {
    paraId: 2090,
    text: 'Basilisk',
    ui: {
      logo: nodesBasiliskPNG,
    },
  },
  {
    paraId: 20048,
    text: 'Bitgreen',
    ui: {
      logo: chainsBitgreenPNG,
    },
  },
  {
    paraId: 2031,
    text: 'Catalyst',
    ui: {
      logo: nodesCentrifugePNG,
    },
  },
  {
    paraId: 4094,
    text: 'Confti',
    ui: {
      logo: nodesConftiSVG,
    },
  },
  {
    paraId: 2012,
    text: 'Crust Testnet',
    ui: {
      logo: nodesCrustParachainSVG,
    },
  },
  {
    paraId: 3339,
    text: 'Curio Testnet',
    ui: {
      logo: nodesCurioSVG,
    },
  },
  {
    paraId: 2084,
    text: 'Dolphin',
    ui: {
      logo: nodesDolphinSVG,
    },
  },
  {
    paraId: 2095,
    text: 'Ethos',
    ui: {
      logo: chainsJurPNG,
    },
  },
  {
    paraId: 4044,
    text: 'Frequency',
    ui: {
      logo: chainsFrequencySVG,
    },
  },
  {
    paraId: 2024,
    text: 'Genshiro Testnet',
    ui: {
      logo: chainsGenshiroSVG,
    },
  },
  {
    paraId: 4227,
    text: 'GIANT Protocol',
    ui: {
      logo: nodesGiantPNG,
    },
  },
  {
    homepage: 'https://laosnetwork.io/',
    paraId: 4343,
    text: 'Giedi',
    ui: {
      logo: nodesGiediPNG,
    },
  },
  {
    paraId: 3025,
    text: 'Helixstreet',
    ui: {
      logo: nodesHelixstreetPNG,
    },
  },
  {
    paraId: 2034,
    text: 'HydraDX',
    ui: {
      logo: chainsHydratePNG,
    },
  },
  {
    homepage: 'https://hyperbridge.network',
    paraId: 4374,
    text: 'Hyperbridge (Gargantua)',
    ui: {
      logo: nodesHyperbridgeSVG,
    },
  },
  {
    paraId: 4222,
    text: 'Idiyanale Network',
    ui: {
      logo: chainsIdiyanaleLogoWhiteSVG,
    },
  },
  {
    paraId: 2121,
    text: 'Imbue Network',
    ui: {
      logo: nodesImbuePNG,
    },
  },
  {
    paraId: 3002,
    text: 'Integritee Network',
    ui: {
      logo: nodesIntegriteeSVG,
    },
  },
  {
    homepage: 'https://ourinvo.com/',
    paraId: 4377,
    text: 'Invo Testnet',
    ui: {
      logo: nodesInvoPNG,
    },
  },
  {
    paraId: 2113,
    text: 'Kabocha (kabsoup)',
    ui: {
      logo: nodesKabochaSVG,
    },
  },
  {
    homepage: 'https://polkadex.trade',
    paraId: 2040,
    text: 'Kaizen',
    ui: {
      logo: nodesPolkadexSVG,
    },
  },
  {
    homepage: 'https://www.litentry.com/',
    paraId: 2106,
    text: 'Litentry',
    ui: {
      logo: nodesLitentryRococoPNG,
    },
  },
  {
    paraId: 2110,
    text: 'Mangata',
    ui: {
      logo: chainsMangataPNG,
    },
  },
  {
    paraId: 2093,
    text: 'MD5 Network',
    ui: {
      logo: nodesMd5PNG,
    },
  },
  {
    paraId: 2055,
    text: 'Moonsama',
    ui: {
      logo: chainsMoonsamaPNG,
    },
  },
  {
    paraId: 3369,
    text: 'Muse network',
    ui: {
      logo: nodesMusePNG,
    },
  },
  {
    homepage: 'https://neuroweb.ai',
    paraId: 2043,
    text: 'NeuroWeb Testnet',
    ui: {
      logo: chainsNeurowebTestnetPNG,
    },
  },
  {
    homepage: 'https://www.my-oli.com/en/',
    paraId: 4023,
    text: 'OLI',
    ui: {
      logo: nodesOliSVG,
    },
  },
  {
    paraId: 4354,
    text: 'OpenZeppelin Runtime Template',
    ui: {
      logo: nodesOzPNG,
    },
  },
  {
    paraId: 2105,
    text: 'Pangolin2',
    ui: {
      logo: nodesPangolinSVG,
    },
  },
  {
    paraId: 2087,
    text: 'Picasso Testnet',
    ui: {
      logo: nodesPicassoPNG,
    },
  },
  {
    paraId: 3345,
    text: 'REX',
    ui: {
      logo: nodesRexSVG,
    },
  },
  {
    paraId: 2004,
    text: 'Rhala Testnet',
    ui: {
      logo: nodesPhalaSVG,
    },
  },
  {
    paraId: 2086,
    text: 'RILT',
    ui: {
      logo: nodesKiltPNG,
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
    paraId: 2021,
    text: 'Rocfinity',
    ui: {
      logo: nodesRocfinitySVG,
    },
  },
  {
    paraId: 3416,
    text: 'Snowbridge Asset Hub',
    ui: {
      logo: chainsSnowbridgePNG,
    },
  },
  {
    paraId: 3016,
    text: 'Snowbridge Bridge Hub',
    ui: {
      logo: chainsSnowbridgePNG,
    },
  },
  {
    paraId: 4253,
    text: 'Societal',
    ui: {
      logo: nodesSocietalSVG,
    },
  },
  {
    paraId: 2100,
    text: 'SoonsocialX',
    ui: {
      logo: nodesSoonsocialXPNG,
    },
  },
  {
    paraId: 2011,
    text: 'SORA',
    ui: {
      logo: nodesSoraSubstrateSVG,
    },
  },
  {
    paraId: 2116,
    text: 'Spreehafen',
    ui: {
      logo: nodesDatahighwayPNG,
    },
  },
  {
    homepage: 'https://totemaccounting.com/',
    paraId: 2007,
    text: 'Stagex',
    ui: {
      logo: chainsTotemSVG,
    },
  },
  {
    paraId: 4040,
    text: 'Subzero',
    ui: {
      logo: nodesZeroSVG,
    },
  },
  {
    paraId: 3333,
    text: 't0rn',
    ui: {
      logo: chainsT0rnPNG,
    },
  },
  {
    paraId: 2125,
    text: 'Tinkernet',
    ui: {
      logo: chainsTinkerPNG,
    },
  },
  {
    paraId: 2114,
    text: 'Turing Network (Staging)',
    ui: {
      logo: chainsTuringPNG,
    },
  },
  {
    paraId: 4168,
    text: 'Unit Network',
    ui: {
      logo: nodesUnitnetworkPNG,
    },
  },
  {
    paraId: 3003,
    text: 'Virto',
    ui: {
      logo: chainsVirtoPNG,
    },
  },
  {
    paraId: 2058,
    text: 'Watr Network',
    ui: {
      logo: chainsWatrPNG,
    },
  },
  {
    paraId: 4292,
    text: 'Yerba Network',
    ui: {
      logo: nodesYerbanetworkPNG,
    },
  },
  {
    paraId: 2101,
    text: 'Zeitgeist Battery Station',
    ui: {
      logo: nodesZeitgeistPNG,
    },
  },
];

export default testParasRococo;
