"use client";
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { setUserDefiQ } from '@/store/marketsSlice';
import { connectWallet as connectWalletAction, disconnectWallet as disconnectWalletAction } from '@/store/walletSlice';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import * as Freighter from '@stellar/freighter-api';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { address, isConnected } = useWalletConnection();
  const kit = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const instance = new StellarWalletsKit({
        network: 'TESTNET',
      });
      return instance;
    } catch {
      return null;
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    try {
      // Prefer Freighter for a smooth UX; fall back to Kit modal
      let userAddress: string | undefined;
      const hasFreighter = await Freighter.isConnected().catch(() => false);
      if (hasFreighter) {
        await Freighter.requestAccess();
        userAddress = await Freighter.getPublicKey();
      }
      if (!userAddress && kit) {
        const res = await kit.openModal();
        if (res && res.publicKey) userAddress = res.publicKey;
      }
      if (!userAddress) {
        setError('No Stellar wallet connected. Please install Freighter or use a supported wallet.');
        return;
      }
      // DeFiQ puanını localStorage'dan kontrol et
      const existingDefiQ = localStorage.getItem(`defiq_${userAddress}`);
      let defiQScore: number;
      if (existingDefiQ) {
        defiQScore = Number(existingDefiQ);
      } else {
        defiQScore = Math.floor(Math.random() * 151) + 50;
        localStorage.setItem(`defiq_${userAddress}`, String(defiQScore));
      }
      dispatch(connectWalletAction(userAddress));
      dispatch(setUserDefiQ({ address: userAddress, score: defiQScore }));
    } catch (error: unknown) {
      console.error('Wallet connection error:', error);
      setError('Connection rejected or an error occurred.');
    }
  };

  const disconnectWallet = async () => {
    if (address) {
      dispatch(setUserDefiQ({ address, score: 0 }));
      localStorage.removeItem(`defiq_${address}`);
      dispatch(disconnectWalletAction());
      setError(null);
    }
    setError(null);
  };

  return (
    <>
      <ModernConnectButtonWrapper>
        {address ? (
          <ConnectedBox>
            <AddressText>{shortenAddress(address)}</AddressText>
            <DisconnectButton onClick={disconnectWallet} title="Disconnect from app (to fully disconnect, use your wallet UI)">Disconnect</DisconnectButton>
          </ConnectedBox>
        ) : (
          <CustomButton onClick={connectWallet}>
            Connect Wallet
          </CustomButton>
        )}
      </ModernConnectButtonWrapper>
      {error && <ErrorBox>{error}</ErrorBox>}
    </>
  );
}

const ModernConnectButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomButton = styled.button`
  min-width: 120px;
  min-height: 36px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.accentGreen};
    color: #fff;
  }
  @media (max-width: 800px) {
    min-width: 90px;
    min-height: 32px;
    font-size: 0.95rem;
    padding: 6px 10px;
  }
`;

const ConnectedBox = styled.div`
  min-width: 120px;
  min-height: 36px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddressText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DisconnectButton = styled.button`
  background: ${({ theme }) => theme.colors.accentRed};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 0.95rem;
  margin-top: 8px;
  text-align: center;
`;
