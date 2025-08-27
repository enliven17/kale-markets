"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styled from "styled-components";
import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaCoins, FaBrain } from 'react-icons/fa';
import { useWalletConnection } from '@/hooks/useWalletConnection';

export default function UserBetsScreen() {
  const { address: connectedAddress } = useWalletConnection();
  
  // useEffect ile cüzdan bağlantı kontrolü ve local state kaldırıldı

  const markets = useSelector((state: RootState) => state.markets.markets);
  const rewards = useSelector((state: RootState) => state.markets.claimableRewards);
  const defiQ = useSelector((state: RootState) => {
    if (!connectedAddress) return 0;
    return state.markets.userDefiQ[connectedAddress] || 0;
  });

  // Kullanıcının tüm bahisleri
  const myBets = connectedAddress ? markets.flatMap(m => m.bets.filter(b => b.userId === connectedAddress).map(b => ({ ...b, market: m }))) : [];

  // Kazanılan bahisler (ödül claim edilebilir veya edildi)
  const myRewards = connectedAddress ? rewards.filter(r => r.userId === connectedAddress) : [];

  const getStatusIcon = (status: string, result?: string, side?: string) => {
    if (status === "resolved") {
      return result === side ? <FaCheckCircle /> : <FaTimesCircle />;
    }
    return <FaClock />;
  };

  return (
    <Container>
      <Header>
        <Title>My Bet History</Title>
        <Stats>
          <StatItem>
            <StatLabel>Total Bets</StatLabel>
            <StatValue>{myBets.length}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Rewards</StatLabel>
            <StatValue>{myRewards.length}</StatValue>
          </StatItem>
          <StatItem title="DEFIq: Prediction Intelligence Score">
            <StatLabel><FaBrain style={{marginRight: 6, color: '#7f5af0'}}/>DEFiq</StatLabel>
            <StatValue>{defiQ}</StatValue>
          </StatItem>
          {/* Balance ile ilgili kodu kaldırıyorum */}
          {/* <StatItem title="System Balance">
            <StatLabel><FaCoins style={{marginRight: 6, color: '#00d4ff'}}/>Balance</StatLabel>
            <StatValue>{balance.toFixed(4)} ETH</StatValue>
          </StatItem> */}
        </Stats>
        <BalanceActions>
          
        </BalanceActions>
      </Header>

      <Section>
        <SectionHeader>
          <SectionTitle>My Bets</SectionTitle>
          <SectionCount>{myBets.length} bets</SectionCount>
        </SectionHeader>
        
        {myBets.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎲</EmptyIcon>
            <EmptyTitle>No bets yet</EmptyTitle>
            <EmptyText>Start betting on markets to see your history here</EmptyText>
          </EmptyState>
        ) : (
          <BetsGrid>
            {myBets.map(bet => (
              <BetCard key={bet.id}>
                <BetHeader>
                  <BetMarket>{bet.market.title}</BetMarket>
                  <BetStatus>
                    {bet.market.status === "resolved"
                      ? bet.market.result === bet.side
                        ? <WinIcon><FaCheckCircle /></WinIcon>
                        : <LoseIcon><FaTimesCircle /></LoseIcon>
                      : <OpenIcon><FaClock /></OpenIcon>}
                  </BetStatus>
                </BetHeader>
                
                <BetDetails>
                  <BetDetail>
                    <DetailLabel>Side</DetailLabel>
                    <DetailValue $side={bet.side}>
                      {bet.side === "yes" ? "Yes" : "No"}
                    </DetailValue>
                  </BetDetail>
                  
                  <BetDetail>
                    <DetailLabel>Amount</DetailLabel>
                    <DetailValue $amount>{bet.amount} ETH</DetailValue>
                  </BetDetail>
                  
                  <BetDetail>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      {bet.market.status === "resolved"
                        ? bet.market.result === bet.side
                          ? <Win>Won</Win>
                          : <Lose>Lost</Lose>
                        : <Open>Open</Open>}
                    </DetailValue>
                  </BetDetail>
                </BetDetails>
                
                <BetFooter>
                  <BetDate>{new Date(bet.timestamp).toLocaleDateString()}</BetDate>
                  <BetTime>{new Date(bet.timestamp).toLocaleTimeString()}</BetTime>
                </BetFooter>
              </BetCard>
            ))}
          </BetsGrid>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>My Rewards</SectionTitle>
          <SectionCount>{myRewards.length} rewards</SectionCount>
        </SectionHeader>
        
        {myRewards.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🏆</EmptyIcon>
            <EmptyTitle>No rewards yet</EmptyTitle>
            <EmptyText>Win some bets to see your rewards here</EmptyText>
          </EmptyState>
        ) : (
          <RewardsGrid>
            {myRewards.map(r => (
              <RewardCard key={r.marketId}>
                <RewardHeader>
                  <RewardIcon>
                    <FaCoins />
                  </RewardIcon>
                  <RewardStatus $claimed={r.claimed}>
                    {r.claimed ? "Claimed" : "Claimable"}
                  </RewardStatus>
                </RewardHeader>
                
                <RewardDetails>
                  <RewardDetail>
                    <DetailLabel>Market ID</DetailLabel>
                    <DetailValue>{r.marketId.slice(0, 8)}...</DetailValue>
                  </RewardDetail>
                  
                  <RewardDetail>
                    <DetailLabel>Amount</DetailLabel>
                    <DetailValue $reward>{r.amount.toFixed(4)} ETH</DetailValue>
                  </RewardDetail>
                </RewardDetails>
              </RewardCard>
            ))}
          </RewardsGrid>
        )}
      </Section>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 24px;
  @media (max-width: 600px) {
    padding: 0 16px;
    margin: 16px auto;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  @media (max-width: 600px) {
    gap: 16px;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  @media (max-width: 600px) {
    padding: 12px 16px;
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  font-weight: 700;
  @media (max-width: 600px) {
    font-size: 20px;
  }
`;

const BalanceActions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  @media (max-width: 600px) {
    margin-bottom: 16px;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const SectionCount = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.background};
  padding: 6px 12px;
  border-radius: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin: 0;
`;

const BetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const BetCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const BetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const BetMarket = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 16px;
`;

const BetStatus = styled.div`
  flex-shrink: 0;
`;

const WinIcon = styled.div`
  color: ${({ theme }) => theme.colors.accentGreen};
  font-size: 20px;
`;

const LoseIcon = styled.div`
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 20px;
`;

const OpenIcon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 20px;
`;

const BetDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const BetDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span<{ $side?: string; $amount?: boolean; $reward?: boolean }>`
  color: ${({ theme, $side, $amount, $reward }) => {
    if ($side === "yes") return theme.colors.accentGreen;
    if ($side === "no") return theme.colors.accentRed;
    if ($amount || $reward) return theme.colors.primary;
    return theme.colors.text;
  }};
  font-size: 14px;
  font-weight: 600;
`;

const BetFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const BetDate = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
`;

const BetTime = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
`;

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const RewardCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const RewardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const RewardIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
`;

const RewardStatus = styled.span<{ $claimed: boolean }>`
  color: ${({ theme, $claimed }) => $claimed ? theme.colors.textSecondary : theme.colors.accentGreen};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ theme, $claimed }) => $claimed ? theme.colors.background : `${theme.colors.accentGreen}20`};
`;

const RewardDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RewardDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Win = styled.span`
  color: ${({ theme }) => theme.colors.accentGreen};
  font-weight: 600;
`;

const Lose = styled.span`
  color: ${({ theme }) => theme.colors.accentRed};
  font-weight: 600;
`;

const Open = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`; 