"use client";
import React, { useState } from 'react';
import styled from 'styled-components';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { ethers } from 'ethers';
import { FaCoins, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface BetButtonProps {
  marketId: number;
  prediction: boolean;
  minBet: string;
  maxBet: string;
  onBetPlaced?: () => void;
}

export function BetButton({ marketId, prediction, minBet, maxBet, onBetPlaced }: BetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { address, isConnected } = useWalletConnection();

  const handleBet = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    const amount = Number(betAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }
    
    const minBetNum = Number(minBet);
    const maxBetNum = Number(maxBet);
    
    if (amount < minBetNum) {
              setError(`Minimum bet amount is ${minBetNum} KALE.`);
      setIsLoading(false);
      return;
    }
    
    if (amount > maxBetNum) {
              setError(`Maximum bet amount is ${maxBetNum} KALE.`);
      setIsLoading(false);
      return;
    }
    
    if (!window.ethereum) {
      setError('Ethereum wallet not found.');
      setIsLoading(false);
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Contract address - Umi Devnet
      const contractAddress = "0x897FBB05A18ceE2d9451a9F644B9831DDf4Dd481";
      
      // Contract ABI for placeBet function
      const contractABI = [
        "function placeBet(uint256 marketId, bool prediction) external payable"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.placeBet(
        marketId,
        prediction,
        { value: ethers.parseEther(betAmount) }
      );
      
      setSuccess(`Bet placed successfully! Transaction hash: ${tx.hash}`);
      setBetAmount('');
      setIsOpen(false);
      
      // Call callback if provided
      if (onBetPlaced) {
        onBetPlaced();
      }
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Bet error:', err);
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPredictionText = () => {
    return prediction ? 'Yes' : 'No';
  };

  const getPredictionColor = () => {
    return prediction ? '#10B981' : '#EF4444';
  };

  const getPredictionIcon = () => {
    return prediction ? <FaCheck /> : <FaTimes />;
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <BetButtonStyled 
        onClick={() => setIsOpen(true)}
        $prediction={prediction}
      >
        {getPredictionIcon()}
        Bet {getPredictionText()}
      </BetButtonStyled>
      
      {isOpen && (
        <ModalOverlay onClick={() => !isLoading && setIsOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                Place Bet - {getPredictionText()}
              </ModalTitle>
              <CloseButton 
                onClick={() => !isLoading && setIsOpen(false)}
                disabled={isLoading}
              >
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <BetInfo>
              <InfoRow>
                <InfoLabel>Market ID:</InfoLabel>
                <InfoValue>{marketId}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Your Prediction:</InfoLabel>
                <InfoValue $color={getPredictionColor()}>
                  {getPredictionIcon()} {getPredictionText()}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Bet Range:</InfoLabel>
                <InfoValue>{minBet} - {maxBet} KALE</InfoValue>
              </InfoRow>
            </BetInfo>
            
            <InputGroup>
              <InputLabel>Bet Amount (KALE)</InputLabel>
              <AmountInput
                type="number"
                step="0.001"
                min={minBet}
                max={maxBet}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder={`${minBet} - ${maxBet}`}
                disabled={isLoading}
              />
              <QuickAmounts>
                <QuickButton 
                  onClick={() => setBetAmount(minBet)}
                  disabled={isLoading}
                >
                  Min ({minBet})
                </QuickButton>
                <QuickButton 
                  onClick={() => setBetAmount((Number(minBet) + Number(maxBet) / 2).toFixed(3))}
                  disabled={isLoading}
                >
                  Mid
                </QuickButton>
                <QuickButton 
                  onClick={() => setBetAmount(maxBet)}
                  disabled={isLoading}
                >
                  Max ({maxBet})
                </QuickButton>
              </QuickAmounts>
            </InputGroup>
            
            <ActionButton 
              onClick={handleBet}
              disabled={isLoading || !betAmount}
              $prediction={prediction}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCoins />
                  Place Bet ({betAmount || '0'} KALE)
                </>
              )}
            </ActionButton>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <InfoText>
              <strong>Note:</strong> This bet will be placed directly on the blockchain. 
              Make sure you have enough KALE in your wallet to cover the bet amount.
            </InfoText>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

const BetButtonStyled = styled.button<{ $prediction: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ $prediction, theme }) => 
    $prediction ? theme.colors.accentGreen : theme.colors.accentRed};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  will-change: transform;
  transform: translateZ(0);
  
  &:hover {
    background: ${({ $prediction, theme }) => 
      $prediction ? '#059669' : '#DC2626'};
    transform: translateY(-1px) translateZ(0);
  }
  
  &:active {
    transform: translateY(0) translateZ(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
  will-change: opacity;
  transform: translateZ(0);
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  animation: modalSlideIn 0.3s ease-out;
  will-change: transform, opacity;
  transform: translateZ(0);
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px) translateZ(0);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0) translateZ(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BetInfo = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InfoValue = styled.span<{ $color?: string }>`
  font-weight: 600;
  color: ${({ $color, theme }) => $color || theme.colors.text};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const QuickButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button<{ $prediction: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $prediction, theme }) => 
    $prediction ? theme.colors.accentGreen : theme.colors.accentRed};
  color: white;
  
  &:hover:not(:disabled) {
    background: ${({ $prediction }) => 
      $prediction ? '#059669' : '#DC2626'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #FEE2E2;
  color: #DC2626;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #D1FAE5;
  color: #059669;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
`;

const InfoText = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`; 