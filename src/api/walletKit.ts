'use client';

import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

let kitInstance: StellarWalletsKit | null = null;

export const getWalletKit = () => {
  // Client-side only check
  if (typeof window === 'undefined') {
    throw new Error('getWalletKit can only be called on the client side');
  }

  if (!kitInstance) {
    try {
      kitInstance = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        modules: allowAllModules(),
      });
    } catch (error) {
      console.error('Failed to create StellarWalletsKit instance:', error);
      throw error;
    }
  }
  return kitInstance;
};

// Note: current kit version may not expose setNetwork at runtime; default to TESTNET
export const setWalletKitNetwork = async (_network: 'PUBLIC' | 'TESTNET') => {
  return;
};

let isRestoring = false; // Restore işlemi devam ediyor mu kontrol et

export const restoreSelectedWallet = async () => {
  if (typeof window === 'undefined' || isRestoring) return;
  
  isRestoring = true;
  try {
    const storedId = localStorage.getItem('stellar_selected_wallet_id');
    if (!storedId) {
      isRestoring = false;
      return;
    }
    
    const kit = getWalletKit();
    await kit.setWallet(storedId as any);
  } catch (error) {
    console.warn('Failed to restore wallet:', error);
    // Restore başarısız olursa localStorage'dan temizle
    localStorage.removeItem('stellar_selected_wallet_id');
  } finally {
    isRestoring = false;
  }
};


