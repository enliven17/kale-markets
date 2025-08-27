import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '@/store/walletSlice';
import type { RootState } from '@/store';
import * as Freighter from '@stellar/freighter-api';

export function useWalletConnection() {
  const dispatch = useDispatch();
  const address = useSelector((state: RootState) => state.wallet.address);
  const isConnected = useSelector((state: RootState) => state.wallet.isConnected);

  useEffect(() => {
    let isMounted = true;
    const checkWalletConnection = async () => {
      try {
        const hasFreighter = await Freighter.isConnected().catch(() => false);
        if (!hasFreighter) {
          if (isMounted) dispatch(disconnectWallet());
          return;
        }
        const publicKey = await Freighter.getPublicKey();
        if (publicKey && isMounted) {
          dispatch(connectWallet(publicKey));
        } else if (isMounted) {
          dispatch(disconnectWallet());
        }
      } catch {
        if (isMounted) dispatch(disconnectWallet());
      }
    };

    checkWalletConnection();

    const interval = setInterval(checkWalletConnection, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch]);

  return {
    address,
    isConnected,
  };
} 