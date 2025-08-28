"use client";
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { setUserDefiQ } from '@/store/marketsSlice';
import { connectWallet as connectWalletAction } from '@/store/walletSlice';
import { getWalletKit } from '@/api/walletKit';
import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';
import { useWalletConnection } from '@/hooks/useWalletConnection';

function shortenAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function ConnectWalletButton() {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const dispatch = useDispatch();
  const { address, isConnected } = useWalletConnection();

  const connectStellar = async () => {
    if (isConnecting) return; // Zaten bağlanmaya çalışıyorsa çık
    
    setError(null);
    setIsConnecting(true);
    
    try {
      const kit = getWalletKit();
      
      // Modal zaten açıksa yeni modal açma
      if (kit.isModalOpen && kit.isModalOpen()) {
        setIsConnecting(false);
        return;
      }
      
      const selected: ISupportedWallet | null = await new Promise(async (resolve, reject) => {
        try {
          await kit.openModal({
            onWalletSelected: (option: ISupportedWallet) => resolve(option),
            onClosed: () => resolve(null),
            modalTitle: 'Connect Stellar Wallet',
          });
        } catch (e) {
          resolve(null);
        }
      });
      
      if (!selected) {
        setIsConnecting(false);
        return;
      }
      
      await kit.setWallet(selected.id);
      try { localStorage.setItem('stellar_selected_wallet_id', String(selected.id)); } catch {}
      
      const { address: pubKey } = await kit.getAddress();
      const existingDefiQ = localStorage.getItem(`defiq_${pubKey}`);
      let defiQScore: number;
      if (existingDefiQ) {
        defiQScore = Number(existingDefiQ);
      } else {
        defiQScore = Math.floor(Math.random() * 151) + 50;
        localStorage.setItem(`defiq_${pubKey}`, String(defiQScore));
      }
      
      dispatch(connectWalletAction({ address: pubKey, chain: 'STELLAR' }));
      dispatch(setUserDefiQ({ address: pubKey, score: defiQScore }));
    } catch (e) {
      console.error(e);
      setError('Stellar wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (address) {
      dispatch(setUserDefiQ({ address, score: 0 }));
      localStorage.removeItem(`defiq_${address}`);
      localStorage.removeItem('stellar_selected_wallet_id');
    }
    setError(null);
  };

  const closeModal = () => setError(null);

  return (
    <>
      <ModernConnectButtonWrapper>
        {address ? (
          <ConnectedBox>
            <AddressText>{shortenAddress(address)}</AddressText>
            <DisconnectButton onClick={disconnectWallet} title="Disconnect from app (to fully disconnect, use your wallet UI)">Disconnect</DisconnectButton>
          </ConnectedBox>
        ) : (
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <CustomButton onClick={connectStellar} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Stellar'}
            </CustomButton>
          </div>
        )}
      </ModernConnectButtonWrapper>

      {error && (
        <ModalOverlay role="dialog" aria-modal="true">
          <ModalContent>
            <ModalTitle>Wallet Connection</ModalTitle>
            <ModalMessage>{error}</ModalMessage>
            <ModalActions>
              <SecondaryButton onClick={closeModal}>Close</SecondaryButton>
              <PrimaryButton onClick={connectStellar}>Try Again</PrimaryButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.card || '#111'};
  color: ${({ theme }) => theme.colors.text || '#fff'};
  border: 1px solid ${({ theme }) => theme.colors.border || 'rgba(255,255,255,0.1)'};
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  padding: 18px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
`;

const ModalMessage = styled.p`
  margin: 0 0 16px 0;
  font-size: 0.98rem;
  line-height: 1.4;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text || '#fff'};
  border: 1px solid ${({ theme }) => theme.colors.border || 'rgba(255,255,255,0.25)'};
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
`;
