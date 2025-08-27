// Stellar network and KALE token constants
export const STELLAR_NETWORK = 'TESTNET' as const;

export const KALE_ASSET_CODE = 'KALE' as const;
export const KALE_CONTRACT_IDS = {
  MAINNET: 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA',
  TESTNET: 'CDSWUUXGPWDZG76ISK6SUCVPZJMD5YUV66J2FXFXFGDX25XKZJIEITAO',
} as const;

export const KALE_LINKS = {
  info: 'https://kaleonstellar.com',
  testnet: 'https://testnet.kalefarm.xyz',
  repo: 'https://github.com/kalepail/KALE-sc',
} as const;