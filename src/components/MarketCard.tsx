import styled from "styled-components";
// Link kaldırıldı; kart detay sayfasına yönlendirme yok
import { useState } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle, FaCoins, FaUsers, FaCalendarAlt, FaChartLine, FaCheck } from 'react-icons/fa';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useDispatch, useSelector } from 'react-redux';
import { addBet } from '@/store/marketsSlice';
import { submitKalePaymentOnMainnet } from '@/api/kalePayment';
import { getKaleTreasuryAddress } from '@/config/stellar';
import type { RootState } from '@/store';
import type { Market, BetSide } from '@/types/market';

interface Props {
  market: Market;
  onClick?: () => void;
}



export function MarketCard({ market }: Props) {
  const { isConnected, address } = useWalletConnection();
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState<false | 'yes' | 'no'>(false);
  const [showSuccess, setShowSuccess] = useState<false | 'yes' | 'no'>(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const dispatch = useDispatch();

  // Kart tıklamasında yönlendirme kaldırıldı
  const handleCardClick = (_e: React.MouseEvent) => {};

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
  const yesSum = market.bets.filter(b => b.side === 'yes').reduce((s, b) => s + b.amount, 0);
  const noSum = market.bets.filter(b => b.side === 'no').reduce((s, b) => s + b.amount, 0);
  const volume = yesSum + noSum;
  const yesProb = volume > 0 ? Math.round((yesSum / volume) * 100) : 50;
  
  // User's bets on this market (from localStorage + Redux)
  const getUserBets = () => {
    if (!address) return [];
    
    // localStorage'dan user bets yükle
    let userBets: any[] = [];
    try {
      const stored = localStorage.getItem('kale_user_bets');
      if (stored) {
        const userBetsData = JSON.parse(stored);
        userBets = userBetsData[address] || [];
      }
    } catch (e) {
      console.warn('Failed to load user bets from localStorage:', e);
    }
    
    // Bu market için olan bet'leri filtrele
    return userBets.filter(bet => bet.marketId === market.id);
  };
  
  const userBets = getUserBets();
  const userYesBets = userBets.filter(b => b.side === 'yes').reduce((s, b) => s + b.amount, 0);
  const userNoBets = userBets.filter(b => b.side === 'no').reduce((s, b) => s + b.amount, 0);

  const explorerTxUrl = market.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${market.txHash}`
    : undefined;
  const shortTx = market.txHash ? `${market.txHash.slice(0, 6)}...${market.txHash.slice(-4)}` : 'contract';

  const handleBet = async (side: 'yes' | 'no') => {
    if (!address) return;
    
    try {
      setLoading(side);
      setShowSuccess(false);
      setShowError(null);
      setTxHash(null);
      
      const result = await submitKalePaymentOnMainnet({
        destination: getKaleTreasuryAddress(),
        amount: (qty * 0.5).toFixed(7),
        memoText: `market:${market.id}:${side}`
      });
      
      // Transaction hash'i al
      if (result && result.hash) {
        setTxHash(result.hash);
        setShowSuccess(side);
        
        // 5 saniye sonra success mesajını gizle
        setTimeout(() => {
          setShowSuccess(false);
          setTxHash(null);
        }, 5000);
      }
      
      // Bet'i Redux store'a ekle
      const betData = {
        id: `${market.id}-${side}-${Date.now()}`,
        userId: address,
        marketId: String(market.id),
        amount: qty * 0.5,
        side: side as BetSide,
        timestamp: Date.now()
      };
      
      dispatch(addBet(betData));
      
      console.log('Bet successful:', { side, amount: qty * 0.5, txHash: result.hash });
      
    } catch (error) {
      console.error('Bet failed:', error);
      
      // Kullanıcı dostu hata mesajları
      let errorMessage = 'Bet failed. Please try again.';
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('user rejected') || errorText.includes('cancelled') || errorText.includes('denied')) {
          errorMessage = 'Transaction was cancelled. No KALE was charged.';
        } else if (errorText.includes('insufficient') || errorText.includes('balance')) {
          errorMessage = 'Insufficient KALE balance. Please check your wallet.';
        } else if (errorText.includes('network') || errorText.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorText.includes('not found') || errorText.includes('unfunded')) {
          errorMessage = 'Account not found. Please fund your wallet with XLM first.';
        } else {
          errorMessage = `Bet failed: ${error.message}`;
        }
      }
      
      setShowError(errorMessage);
      
      // 5 saniye sonra error mesajını gizle
      setTimeout(() => {
        setShowError(null);
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card onClick={handleCardClick}>
      {market.txHash && explorerTxUrl && (
        <TxBadge onClick={(e) => e.stopPropagation()}>
          <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer">TX: {shortTx}</a>
        </TxBadge>
      )}
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
        <div style={{ cursor: "default" }}>
          <Title>{market.title}</Title>
          <Description>{market.description}</Description>
        </div>
        <StatsRow>
          <Stat>
            <StatIcon>
              <FaCoins />
            </StatIcon>
            <StatContent>
              <StatValue>{totalPool.toFixed(2)} KALE</StatValue>
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
          <Stat>
            <StatIcon>
              <FaChartLine />
            </StatIcon>
            <StatContent>
              <StatValue>{volume.toFixed(2)} KALE</StatValue>
              <StatLabel>Volume</StatLabel>
            </StatContent>
          </Stat>
        </StatsRow>
        
        {/* User's bets on this market */}
        {userBets.length > 0 && (
          <UserBetsRow>
            <UserBetLabel>Your Bets:</UserBetLabel>
            {userYesBets > 0 && (
              <UserBetItem $side="yes">
                <span>YES: {userYesBets.toFixed(2)} KALE</span>
              </UserBetItem>
            )}
            {userNoBets > 0 && (
              <UserBetItem $side="no">
                <span>NO: {userNoBets.toFixed(2)} KALE</span>
              </UserBetItem>
            )}
          </UserBetsRow>
        )}
        <InfoRow>
          <Info>
            <InfoLabel>YES Price</InfoLabel>
            <InfoValue>0.5 KALE</InfoValue>
          </Info>
          <Info>
            <InfoLabel>NO Price</InfoLabel>
            <InfoValue>0.5 KALE</InfoValue>
          </Info>
        </InfoRow>

        {/* Success Notification */}
        {showSuccess && (
          <SuccessNotification>
            <FaCheck />
            <div>
              <strong>Bet Successful!</strong>
              <p>Your {showSuccess.toUpperCase()} bet of {qty * 0.5} KALE has been placed.</p>
              {txHash && (
                <p>
                  <strong>Transaction:</strong>{' '}
                  <a 
                    href={`https://stellar.expert/explorer/public/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {txHash.slice(0, 8)}...{txHash.slice(-8)}
                  </a>
                </p>
              )}
            </div>
          </SuccessNotification>
        )}
        
        {/* Error Notification */}
        {showError && (
          <ErrorNotification>
            <FaTimesCircle />
            <div>
              <strong>Bet Cancelled</strong>
              <p>{showError}</p>
            </div>
          </ErrorNotification>
        )}

        <BuyRow>
          <QtyInput type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
          <BuyButton disabled={!isConnected || loading !== false} onClick={() => handleBet('yes')} loading={loading === 'yes'}>
            {loading === 'yes' ? 'Processing...' : 'Buy YES'}
          </BuyButton>
          <BuyButton disabled={!isConnected || loading !== false} onClick={() => handleBet('no')} loading={loading === 'no'}>
            {loading === 'no' ? 'Processing...' : 'Buy NO'}
          </BuyButton>
        </BuyRow>
        <QuickRow>
          {[1,5,10,20].map(v => (
            <QuickBtn key={v} onClick={(e)=>{ e.stopPropagation(); setQty(v); }}>{v}</QuickBtn>
          ))}
        </QuickRow>
      </CardContent>
      <CardFooter>
        <ProbRow>
          <ProbLabel>Estimated YES probability</ProbLabel>
          <ProbValue>{yesProb}%</ProbValue>
        </ProbRow>
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

const TxBadge = styled.div`
  position: absolute;
  top: 14px; /* biraz daha aşağıda */
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  border: 1px solid ${({ theme }) => `${theme.colors.card}`};
  a { color: #fff; text-decoration: none; }
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

const BuyRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const QtyInput = styled.input`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const BuyButton = styled.button<{ loading?: boolean }>`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  ${props => props.loading && `
    background: #666;
    cursor: not-allowed;
    
    &:hover {
      background: #666;
    }
  `}
`;

const QuickRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const QuickBtn = styled.button`
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary}33;
  border-radius: 12px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  width: 100%;
  &:hover { background: ${({ theme }) => `${theme.colors.primary}15`}; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ProbRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProbLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ProbValue = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 800;
`;

const UserBetsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const UserBetLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserBetItem = styled.span<{ $side: BetSide }>`
  color: ${({ theme, $side }) => $side === 'yes' ? theme.colors.accentGreen : theme.colors.accentRed};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  background: ${({ theme, $side }) => $side === 'yes' ? `${theme.colors.accentGreen}20` : `${theme.colors.accentRed}20`};
  border-radius: 8px;
  border: 1px solid ${({ theme, $side }) => $side === 'yes' ? theme.colors.accentGreen : theme.colors.accentRed};
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

const SuccessNotification = styled.div`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  animation: slideIn 0.3s ease-out;
  
  svg {
    font-size: 20px;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  div {
    flex: 1;
    
    strong {
      font-size: 16px;
      display: block;
      margin-bottom: 4px;
    }
    
    p {
      margin: 4px 0;
      font-size: 14px;
      opacity: 0.9;
      
      a {
        color: #fff;
        text-decoration: underline;
        word-break: break-all;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ErrorNotification = styled.div`
  background: linear-gradient(135deg, #F44336, #D32F2F);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  animation: slideIn 0.3s ease-out;
  
  svg {
    font-size: 20px;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  div {
    flex: 1;
    
    strong {
      font-size: 16px;
      display: block;
      margin-bottom: 4px;
    }
    
    p {
      margin: 4px 0;
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

 