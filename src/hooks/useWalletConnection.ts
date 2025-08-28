import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '@/store/walletSlice';
import type { RootState } from '@/store';
import { getWalletKit, restoreSelectedWallet } from '@/api/walletKit';

export function useWalletConnection() {
  const dispatch = useDispatch();
  const address = useSelector((state: RootState) => state.wallet.address);
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected);
  
  // Global flag to prevent multiple wallet checks
  if (typeof window !== 'undefined') {
    (window as any).__walletConnectionChecked = (window as any).__walletConnectionChecked || false;
  }

  useEffect(() => {
    let isMounted = true;
    let hasRun = false; // Sadece bir kez çalıştır
    
    const checkWalletConnection = async () => {
      if (hasRun) return; // Zaten çalıştıysa tekrar çalıştırma
      hasRun = true;
      
      try {
        const kit = getWalletKit();
        await restoreSelectedWallet();
        // Wallets Kit does not expose a global isConnected; rely on address fetch.
        const { address } = await kit.getAddress().catch(() => ({ address: null as any }));
        
        if (!isMounted) return;
        
        if (address) {
          dispatch(connectWallet({ address, chain: 'STELLAR' }));
        } else {
          dispatch(disconnectWallet());
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn('Wallet connection check failed:', error);
        dispatch(disconnectWallet());
      }
    };

    // Global flag kontrolü - sadece bir kez çalıştır
    if ((window as any).__walletConnectionChecked) {
      return;
    }
    
    // Sadece bir kez çalıştır, sayfa yenilendiğinde tekrar çalışmasın
    // Ayrıca localStorage'da wallet ID varsa restore et
    const hasStoredWallet = typeof window !== 'undefined' && localStorage.getItem('stellar_selected_wallet_id');
    
    if ((!address && !isConnected) || hasStoredWallet) {
      (window as any).__walletConnectionChecked = true;
      checkWalletConnection();
    }

    return () => {
      isMounted = false;
    };
  }, []); // Dependency array'i boş bırak, sadece bir kez çalışsın

  return {
    address,
    isConnected,
  };
} 