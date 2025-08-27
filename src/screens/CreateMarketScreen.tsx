"use client";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addMarket } from "@/store/marketsSlice";
import { Market } from "@/types/market";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaCalendarAlt, FaCoins, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useWalletConnection } from '@/hooks/useWalletConnection';
// Removed EVM ethers. Create market is disabled.
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

const CENTRAL_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

export default function CreateMarketScreen() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [minBet, setMinBet] = useState(0.01);
  const [maxBet, setMaxBet] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { address: connectedAddress, isConnected } = useWalletConnection();
  const [review, setReview] = useState(false); // Review ekranı için state
  const [loading, setLoading] = useState(false); // Transfer loading
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowWidth, windowHeight] = useWindowSize();

  // useEffect ile cüzdan bağlantı kontrolü ve local state kaldırıldı

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!closesAt) {
      setError("Closing time must be selected.");
      return;
    }
    if (minBet <= 0 || maxBet <= 0 || minBet >= maxBet) {
      setError("Min/max bet limits are invalid.");
      return;
    }

    if (!isConnected || !connectedAddress) {
      setError("Wallet is not connected.");
      return;
    }
    const closesAtTimestamp = new Date(closesAt).getTime();
    if (closesAtTimestamp < Date.now() + 60 * 60 * 1000) {
      setError("Closing time must be at least 1 hour from now.");
      return;
    }
    setReview(true);
  };

  // Review butonu
  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!closesAt) {
      setError("Closing time must be selected.");
      return;
    }
    if (minBet <= 0 || maxBet <= 0 || minBet >= maxBet) {
      setError("Min/max bet limits are invalid.");
      return;
    }

    if (!isConnected || !connectedAddress) {
      setError("Wallet is not connected.");
      return;
    }
    const closesAtTimestamp = new Date(closesAt).getTime();
    if (closesAtTimestamp < Date.now() + 60 * 60 * 1000) {
      setError("Closing time must be at least 1 hour from now.");
      return;
    }
    setReview(true);
  };

  // Onayla butonu
  const handleConfirm = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Contract address - Umi Devnet
      const contractAddress = "0x897FBB05A18ceE2d9451a9F644B9831DDf4Dd481";
      // Kontrolü kaldırıyoruz, çünkü adres sabit ve geçerli
      // if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      //   setError('Contract not deployed yet. Please wait for deployment to complete.');
      //   setLoading(false);
      //   return;
      // }

      if (!window.ethereum) throw new Error('Ethereum wallet not found.');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Contract ABI for createMarket function
      const contractABI = [
        "function createMarket(string memory title, string memory description, uint256 closingTime, uint256 minBet, uint256 maxBet) external"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const closesAtTimestamp = Math.floor(new Date(closesAt).getTime() / 1000); // Convert to seconds
      
      const tx = await contract.createMarket(
        title,
        description,
        closesAtTimestamp,
        ethers.parseEther(minBet.toString()),
        ethers.parseEther(maxBet.toString())
      );
      
      setSuccess("Market created successfully! Transaction hash: " + tx.hash);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setTitle("");
      setDescription("");
      setClosesAt("");
      setMinBet(0.01);
      setMaxBet(1);
      setReview(false);
    } catch (err: unknown) {
      console.error('Transaction error:', err);
      setError((err as Error).message || 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Başarı ve konfeti en üstte */}
      {showConfetti && <Confetti width={windowWidth} height={windowHeight} numberOfPieces={350} recycle={false} style={{ zIndex: 1000 }} />} 
      {success && (
        <SuccessContainer style={{
          fontSize: '1.2rem', fontWeight: 700, background: '#112e1a', color: '#16c784', border: '2px solid #16c784', borderRadius: 14, padding: 20, margin: '24px auto 18px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, boxShadow: '0 2px 16px #16c78422', zIndex: 100 }}>
          <FaCheckCircle style={{fontSize: 38, color: '#16c784', marginBottom: 8}} />
          🎉 Market created successfully! 🎉
          <span style={{fontSize: '1rem', fontWeight: 400, color: '#fff', marginTop: 10, wordBreak: 'break-all'}}>
            Transaction hash:
            <HashBox onClick={() => navigator.clipboard.writeText(success.match(/0x[a-fA-F0-9]{64,}/)?.[0] || '')} title="Copy hash">
              {success.match(/0x[a-fA-F0-9]{64,}/)?.[0] || ''}
              <span style={{fontSize: 13, color: '#16c784', marginLeft: 8, cursor: 'pointer'}}>Copy</span>
            </HashBox>
          </span>
        </SuccessContainer>
      )}
      <Header>
        <HeaderIcon>
          <FaPlus />
        </HeaderIcon>
        <HeaderContent>
          <Title>Create New Market</Title>
          <Subtitle>Start a new prediction market and let users bet on outcomes</Subtitle>
        </HeaderContent>
      </Header>

      {!review ? (
        <Form onSubmit={handleReview}>
          <FormSection>
            <SectionTitle>
              <FaInfoCircle />
              Market Information
            </SectionTitle>
            
            <FormGroup>
              <Label>Market Title</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g., Will Bitcoin reach $100k by end of year?"
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Provide a clear description of what users are betting on..."
                required 
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FaCalendarAlt />
              Market Settings
            </SectionTitle>
            
            <FormGroup>
              <Label>Closing Time</Label>
              <Input 
                type="datetime-local" 
                value={closesAt} 
                onChange={e => setClosesAt(e.target.value)} 
                required 
              />
              <HelpText>Market will close at this time and no more bets will be accepted</HelpText>
            </FormGroup>

            <BetLimitsRow>
              <FormGroup>
                <Label>Minimum Bet (ETH)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min={0.01} 
                  value={minBet} 
                  onChange={e => setMinBet(Number(e.target.value))} 
                  required 
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Maximum Bet (ETH)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min={0.01} 
                  value={maxBet} 
                  onChange={e => setMaxBet(Number(e.target.value))} 
                  required 
                />
              </FormGroup>
            </BetLimitsRow>
            <BetLimitsInfo>
              Minimum bet must be at least 0.001 ETH and maximum bet cannot exceed 5 ETH. The values you select must be within this range.
            </BetLimitsInfo>
          </FormSection>



          {error && (
            <ErrorContainer>
              <ErrorIcon>
                <FaExclamationTriangle />
              </ErrorIcon>
              <ErrorText>{error}</ErrorText>
            </ErrorContainer>
          )}
          
          {success && (
            <SuccessContainer style={{fontSize: '1.2rem', fontWeight: 700, background: '#16c78422', color: '#16c784', border: '2px solid #16c784', borderRadius: 12, padding: 16, margin: '18px 0', textAlign: 'center'}}>
              🎉 Market created successfully! 🎉<br />
              <span style={{fontSize: '1rem', fontWeight: 400, color: '#333'}}>{success}</span>
            </SuccessContainer>
          )}

          <SubmitButton type="submit" disabled={!isConnected}>Review</SubmitButton>
          <InfoBox>
            Newly created markets must first be approved before going live. If your market is not approved, the ETH you provided for the pool will be refunded to your wallet.
          </InfoBox>
        </Form>
      ) : (
        <ReviewBox>
          <ReviewHeader>
            <FaInfoCircle style={{ fontSize: 38, color: '#7f5af0', marginBottom: 8 }} />
            <ReviewTitle>Review Market Details</ReviewTitle>
          </ReviewHeader>
          <ReviewGrid>
            <ReviewField>
              <FieldLabel>Title</FieldLabel>
              <FieldValue>{title}</FieldValue>
            </ReviewField>
            <ReviewField>
              <FieldLabel>Description</FieldLabel>
              <FieldValue>{description}</FieldValue>
            </ReviewField>
            <ReviewField>
              <FieldLabel>Min/Max Bet</FieldLabel>
              <FieldValue>{minBet} / {maxBet} ETH</FieldValue>
            </ReviewField>

            <ReviewField>
              <FieldLabel>Closing Time</FieldLabel>
              <FieldValue>{closesAt}</FieldValue>
            </ReviewField>
          </ReviewGrid>
          {error && <ErrorContainer><ErrorIcon><FaExclamationTriangle /></ErrorIcon><ErrorText>{error}</ErrorText></ErrorContainer>}
          {success && (
            <SuccessContainer style={{fontSize: '1.2rem', fontWeight: 700, background: '#16c78422', color: '#16c784', border: '2px solid #16c784', borderRadius: 12, padding: 16, margin: '18px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <FaCheckCircle style={{fontSize: 38, color: '#16c784', marginBottom: 8}} />
              🎉 Market created successfully! 🎉<br />
              <span style={{fontSize: '1rem', fontWeight: 400, color: '#333'}}>{success}</span>
            </SuccessContainer>
          )}
          <ButtonRow style={{marginTop: 24}}>
            <SubmitButton type="button" onClick={handleConfirm} disabled={loading || !!success} style={{ fontSize: 18, padding: '12px 32px', background: '#16c784', boxShadow: '0 2px 8px #16c78444' }}>{loading ? 'Processing...' : 'Confirm & Create'}</SubmitButton>
            <CancelButton type="button" onClick={() => setReview(false)} disabled={loading || !!success}>Cancel</CancelButton>
          </ButtonRow>
        </ReviewBox>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 32px auto;
  padding: 0 24px;
  @media (max-width: 600px) {
    padding: 0 16px;
    margin: 16px auto;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 32px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 16px;
  }
`;

const HeaderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary};
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

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 600px) {
    padding: 24px 20px;
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 18px;
  }
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  @media (max-width: 600px) {
    padding: 14px 16px;
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  @media (max-width: 600px) {
    padding: 14px 16px;
    font-size: 16px;
    min-height: 100px;
  }
`;

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

const BetLimitsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ theme }) => `${theme.colors.accentRed}10`};
  border: 1px solid ${({ theme }) => theme.colors.accentRed};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.accentRed};
`;

const ErrorIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
`;

const ErrorText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const SuccessContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ theme }) => `${theme.colors.accentGreen}10`};
  border: 1px solid ${({ theme }) => theme.colors.accentGreen};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.accentGreen};
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: ${({ theme, disabled }) => disabled ? theme.colors.textSecondary : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 20px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    background: ${({ theme }) => theme.colors.accentGreen};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    font-size: 16px;
  }
  
  @media (max-width: 600px) {
    padding: 16px 24px;
    font-size: 16px;
  }
`;

const InfoBox = styled.div`
  margin-top: 18px;
  background: ${({ theme }) => `${theme.colors.primary}08`};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
`;

const BetLimitsInfo = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin: 8px 0 0 0;
  padding-left: 2px;
`; 

// Yeni: Review ekranı için stiller
const ReviewBox = styled.div`
  padding: 28px 18px 18px 18px;
  text-align: left;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(127,90,240,0.08);
  margin: 0 auto;
  max-width: 520px;
`;
const ReviewHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
`;
const ReviewTitle = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 2px;
  color: ${({ theme }) => theme.colors.primary};
`;
const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 18px;
`;
const ReviewField = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 1px 4px rgba(127,90,240,0.04);
`;
const FieldLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
`;
const FieldValue = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.08rem;
  font-weight: 700;
`;
const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.accentRed};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  margin-left: 12px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`; 

const HashBox = styled.span`
  display: inline-block;
  background: #1a3a2a;
  color: #16c784;
  font-family: monospace;
  font-size: 0.98rem;
  padding: 4px 10px;
  border-radius: 8px;
  margin-left: 8px;
  cursor: pointer;
  user-select: all;
  transition: background 0.2s;
  &:hover {
    background: #1f4d36;
  }
`; 