"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MarketCard } from "@/components/MarketCard";
import styled from "styled-components";
import { useState } from "react";
import { FaFire, FaFilter, FaChartLine, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function HomePage() {
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const markets = useSelector((state: RootState) => state.markets.markets);
  const filteredMarkets = markets.filter(m =>
    filter === "all" ? true : filter === "open" ? m.status === "open" : m.status !== "open"
  );

  const openMarkets = markets.filter(m => m.status === "open").length;
  const resolvedMarkets = markets.filter(m => m.status === "resolved").length;
  const totalPool = markets.reduce((sum, m) => sum + m.initialPool + m.bets.reduce((bSum, b) => bSum + b.amount, 0), 0);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaFire />
          </HeaderIcon>
          <HeaderText>
            <Title>Trending Markets</Title>
            <Subtitle>Discover and bet on the most popular prediction markets</Subtitle>
          </HeaderText>
        </HeaderContent>
        <Stats>
          <StatItem>
            <StatIcon>
              <FaChartLine />
            </StatIcon>
            <StatContent>
              <StatValue>{markets.length}</StatValue>
              <StatLabel>Total Markets</StatLabel>
            </StatContent>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaClock />
            </StatIcon>
            <StatContent>
              <StatValue>{openMarkets}</StatValue>
              <StatLabel>Open</StatLabel>
            </StatContent>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaCheckCircle />
            </StatIcon>
            <StatContent>
              <StatValue>{resolvedMarkets}</StatValue>
              <StatLabel>Resolved</StatLabel>
            </StatContent>
          </StatItem>
          <StatItem>
            <StatIcon>
              <FaFire />
            </StatIcon>
            <StatContent>
              <StatValue>{totalPool.toFixed(1)} ETH</StatValue>
              <StatLabel>Total Pool</StatLabel>
            </StatContent>
          </StatItem>
        </Stats>
      </Header>

      <FilterSection>
        <FilterHeader>
          <FilterTitle>
            <FaFilter />
            Filter Markets
          </FilterTitle>
          <FilterCount>{filteredMarkets.length} markets</FilterCount>
        </FilterHeader>
        <FilterBar>
          <FilterButton $active={filter === "open"} onClick={() => setFilter("open")}>
            <FaClock />
            Open Markets
          </FilterButton>
          <FilterButton $active={filter === "closed"} onClick={() => setFilter("closed")}>
            <FaCheckCircle />
            Resolved
          </FilterButton>
          <FilterButton $active={filter === "all"} onClick={() => setFilter("all")}>
            <FaFire />
            All Markets
          </FilterButton>
        </FilterBar>
      </FilterSection>

      {filteredMarkets.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔮</EmptyIcon>
          <EmptyTitle>No markets found</EmptyTitle>
          <EmptyText>
            {filter === "open" 
              ? "No open markets available at the moment" 
              : filter === "closed" 
                ? "No resolved markets yet" 
                : "No markets available"}
          </EmptyText>
        </EmptyState>
      ) : (
        <MarketsGrid>
          {filteredMarkets.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </MarketsGrid>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  @media (max-width: 600px) {
    padding: 0 16px;
  }
`;

const Header = styled.div`
  margin: 32px 0 40px 0;
  @media (max-width: 600px) {
    margin: 16px 0 24px 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accentGreen});
  color: white;
  border-radius: 16px;
  font-size: 24px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  margin: 0;
  line-height: 1.5;
  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 600px) {
    padding: 20px;
    gap: 12px;
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  font-size: 20px;
  flex-shrink: 0;
  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  @media (max-width: 600px) {
    font-size: 20px;
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 32px;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const FilterTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 18px;
  }
  
  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const FilterCount = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.background};
  padding: 8px 16px;
  border-radius: 20px;
  @media (max-width: 600px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  @media (max-width: 600px) {
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => $active ? "#fff" : theme.colors.textSecondary};
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : `${theme.colors.primary}10`};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  svg {
    font-size: 14px;
  }
  
  @media (max-width: 600px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
    
    svg {
      font-size: 12px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const MarketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  align-items: stretch;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;