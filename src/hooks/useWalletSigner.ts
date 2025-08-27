import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// TypeScript için ethereum window property'sini tanımla
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWalletSigner() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Cüzdan bağlantı durumunu takip et
  useEffect(() => {
    const checkWalletConnection = () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setAddress(window.ethereum.selectedAddress);
        setIsConnected(true);
      } else {
        setAddress(null);
        setIsConnected(false);
      }
    };

    checkWalletConnection();
    
    // Cüzdan değişikliklerini dinle
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWalletConnection);
      window.ethereum.on('connect', checkWalletConnection);
      window.ethereum.on('disconnect', () => {
        setAddress(null);
        setIsConnected(false);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkWalletConnection);
        window.ethereum.removeListener('connect', checkWalletConnection);
        window.ethereum.removeListener('disconnect', () => {
          setAddress(null);
          setIsConnected(false);
        });
      }
    };
  }, []);

  // signature almak için fonksiyon döndür
  const getSignature = async (message: string) => {
    if (!window.ethereum || !address) {
      throw new Error('Wallet not connected');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  };

  return { address, getSignature, isConnected };
} 