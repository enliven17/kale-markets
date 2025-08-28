'use client';

import { Horizon, Networks, Asset } from "@stellar/stellar-sdk";

export type StellarNetworkName = "TESTNET" | "PUBLIC";

export const STELLAR_HORIZON_URL: Record<StellarNetworkName, string> = {
  TESTNET: "https://horizon-testnet.stellar.org",
  PUBLIC: "https://horizon.stellar.org",
};

export const STELLAR_NETWORK_PASSPHRASE: Record<StellarNetworkName, string> = {
  TESTNET: Networks.TESTNET,
  PUBLIC: Networks.PUBLIC,
};

export const getStellarServer = (network: StellarNetworkName) => {
  // Client-side only check
  if (typeof window === 'undefined') {
    throw new Error('getStellarServer can only be called on the client side');
  }
  return new Horizon.Server(STELLAR_HORIZON_URL[network]);
};

// KALE asset config (issuer to be confirmed from KALE docs)
// See: https://kaleonstellar.com/ and https://github.com/kalepail/KALE-sc
export const KALE_ASSET_CODE = "KALE";

// Fill this with the official issuer address when available
// Tip: keep it in env at runtime for safer overrides
export const getKaleIssuer = (): string => {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_KALE_ISSUER) {
    return String(process.env.NEXT_PUBLIC_KALE_ISSUER);
  }
  // Environment variable bulunamadı, hata fırlat
  throw new Error('NEXT_PUBLIC_KALE_ISSUER environment variable is required. Please set it in your .env.local file.');
};

export const getKaleAsset = (network: StellarNetworkName): Asset => {
  // KALE is on PUBLIC for payments; markets may run on TESTNET
  return new Asset(KALE_ASSET_CODE, getKaleIssuer());
};

// Treasury address for receiving KALE payments (PUBLIC)
export const getKaleTreasuryAddress = (): string => {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_KALE_TREASURY) {
    return String(process.env.NEXT_PUBLIC_KALE_TREASURY);
  }
  // Environment variable bulunamadı, hata fırlat
  throw new Error('NEXT_PUBLIC_KALE_TREASURY environment variable is required. Please set it in your .env.local file.');
};


