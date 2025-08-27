import styled from "styled-components";
import { Market } from "@/types/market";
import Link from "next/link";
import { useState } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaCoins, FaUsers, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useWalletConnection } from '@/hooks/useWalletConnection';

interface Props {
  market: Market;
  onClick?: () => void;
}



export function MarketCard({ market }: Props) {
  const { isConnected } = useWalletConnection();

  // Kartın boş alanına tıklanınca detay sayfasına yönlendir
  const handleCardClick = (e: React.MouseEvent) => {
    // Buton'a tıklandığında yönlendirme yapma
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest('button')) return;
    window.location.href = `/market/${market.id}`;
  };

  const getStatusIcon = () => {
    if (market.status === "resolved") {
      return market.result === "yes" ? <FaCheckCircle /> : <FaTimesCircle />;
    }
    return <FaClock />;
  };

  const getStatusColor = () => {
    if (market.status === "resolved") {
      return market.result === "yes" ? "green" : "red";
    }
    return "blue";
  };

  const totalPool = market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0);
  const totalBets = market.bets.length;
  const timeLeft = market.closesAt - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <Card onClick={handleCardClick}>
      <CardHeader>
        <StatusBadge $status={getStatusColor()}>
          {getStatusIcon()}
          {market.status === "open" ? "Open" : market.status === "resolved" ? (market.result === "yes" ? "Yes Won" : "No Won") : "Closed"}
        </StatusBadge>
        <TimeLeft>
          {market.status === "open" ? (
            <>
              <FaCalendarAlt />
              {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}
            </>
          ) : (
            <>
              <FaCheckCircle />
              Resolved
            </>
          )}
        </TimeLeft>
      </CardHeader>
      <CardContent>
        <Link href={`/market/${market.id}`}>
          <div style={{ cursor: "pointer" }}>
            <Title>{market.title}</Title>
            <Description>{market.description}</Description>
          </div>
        </Link>
        <StatsRow>
          <Stat>
            <StatIcon>
              <FaCoins />
            </StatIcon>
            <StatContent>
              <StatValue>{totalPool.toFixed(2)} ETH</StatValue>
              <StatLabel>Total Pool</StatLabel>
            </StatContent>
          </Stat>
          <Stat>
            <StatIcon>
              <FaUsers />
            </StatIcon>
            <StatContent>
              <StatValue>{totalBets}</StatValue>
              <StatLabel>Bets</StatLabel>
            </StatContent>
          </Stat>
        </StatsRow>
        <InfoRow>
          <Info>
            <InfoLabel>Min/Max Bet</InfoLabel>
            <InfoValue>{market.minBet} / {market.maxBet} ETH</InfoValue>
          </Info>
          <Info>
            <InfoLabel>Initial Pool</InfoLabel>
            <InfoValue>{market.initialPool} ETH</InfoValue>
          </Info>
        </InfoRow>
      </CardContent>
      <CardFooter>
        <ButtonRow>
          <SeeDetailsButton onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/market/${market.id}`;
          }}>
            <span>See Details</span>
            <FaArrowRight />
          </SeeDetailsButton>
        </ButtonRow>
      </CardFooter>
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
  z-index: 1;
  will-change: transform;
  transform: translateZ(0);
  
  &:hover {
    transform: translateY(-4px) translateZ(0);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 600px) {
    border-radius: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 16px 20px 12px 20px;
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $status, theme }) => {
    if ($status === "green") return `${theme.colors.accentGreen}20`;
    if ($status === "red") return `${theme.colors.accentRed}20`;
    return `${theme.colors.primary}20`;
  }};
  
  color: ${({ $status, theme }) => {
    if ($status === "green") return theme.colors.accentGreen;
    if ($status === "red") return theme.colors.accentRed;
    return theme.colors.primary;
  }};
  
  svg {
    font-size: 12px;
  }
`;

const TimeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  
  svg {
    font-size: 12px;
  }
`;

const CardContent = styled.div`
  padding: 20px 24px;
  flex: 1;
  @media (max-width: 600px) {
    padding: 16px 20px;
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
  @media (max-width: 600px) {
    font-size: 13px;
    margin-bottom: 16px;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  @media (max-width: 600px) {
    padding: 10px;
    gap: 8px;
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 14px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  @media (max-width: 600px) {
    font-size: 10px;
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

const CardFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 16px 20px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const SeeDetailsButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  will-change: transform;
  transform: translateZ(0);
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
    transform: translateY(-1px) translateZ(0);
  }
  
  &:active {
    transform: translateY(0) translateZ(0);
  }
  
  svg {
    font-size: 12px;
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(2px);
  }
  
  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

const DisabledButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  font-weight: 600;
  font-size: 14px;
  cursor: not-allowed;
  opacity: 0.6;
  
  @media (max-width: 600px) {
    padding: 12px 0;
    font-size: 13px;
  }
`;

 