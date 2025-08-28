// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SomniaPredictionMarket {
    uint256 public marketCount;
    
    struct Market {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 closingTime;
        uint256 totalYesBets;
        uint256 totalNoBets;
        uint256 minBet;
        uint256 maxBet;
        bool isResolved;
        bool outcome;
        bool isClosed;
        uint256 totalPot;
    }
    
    struct Bet {
        address user;
        uint256 amount;
        bool prediction;
        bool claimed;
        uint256 timestamp;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(address => uint256) public userBalances;
    mapping(uint256 => mapping(address => uint256)) public userBetAmounts;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    function createMarket(
        string calldata title,
        string calldata description,
        uint256 closingTime,
        uint256 minBet,
        uint256 maxBet
    ) external {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(closingTime > block.timestamp + 1 hours, "Min 1 hour future");
        require(minBet >= 0.001 ether, "Min bet 0.001 KALE");
        require(maxBet >= minBet, "Max >= min bet");
        require(maxBet <= 10 ether, "Max bet 10 KALE");

        marketCount++;
        
        markets[marketCount] = Market({
            id: marketCount,
            creator: msg.sender,
            title: title,
            description: description,
            closingTime: closingTime,
            totalYesBets: 0,
            totalNoBets: 0,
            minBet: minBet,
            maxBet: maxBet,
            isResolved: false,
            outcome: false,
            isClosed: false,
            totalPot: 0
        });

        emit MarketCreated(marketCount, msg.sender, title);
    }

    function placeBet(uint256 marketId, bool prediction) external payable {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(!market.isClosed, "Market closed");
        require(!market.isResolved, "Market resolved");
        require(block.timestamp < market.closingTime, "Betting closed");
        require(msg.value >= market.minBet, "Below min bet");
        require(msg.value <= market.maxBet, "Above max bet");
        require(msg.sender != market.creator, "Creator cannot bet");
        
        // Check if user already has a bet in this market
        require(userBetAmounts[marketId][msg.sender] == 0, "Already placed bet");

        if (prediction) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }
        
        market.totalPot += msg.value;
        userBetAmounts[marketId][msg.sender] = msg.value;

        marketBets[marketId].push(Bet({
            user: msg.sender,
            amount: msg.value,
            prediction: prediction,
            claimed: false,
            timestamp: block.timestamp
        }));

        emit BetPlaced(marketId, msg.sender, msg.value, prediction);
    }

    function resolveMarket(uint256 marketId, bool outcome) external {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(msg.sender == market.creator, "Only creator can resolve");
        require(!market.isResolved, "Already resolved");
        require(block.timestamp >= market.closingTime, "Market not closed yet");
        
        market.isResolved = true;
        market.outcome = outcome;
        market.isClosed = true;
        
        emit MarketResolved(marketId, outcome);
    }

    function claimReward(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.isResolved, "Market not resolved");
        require(market.totalPot > 0, "No pot to claim");
        
        uint256 userBetAmount = userBetAmounts[marketId][msg.sender];
        require(userBetAmount > 0, "No bet placed");
        
        // Find user's bet
        Bet[] storage bets = marketBets[marketId];
        bool userPrediction = false;
        bool alreadyClaimed = false;
        
        for (uint i = 0; i < bets.length; i++) {
            if (bets[i].user == msg.sender) {
                userPrediction = bets[i].prediction;
                alreadyClaimed = bets[i].claimed;
                break;
            }
        }
        
        require(!alreadyClaimed, "Already claimed");
        
        // Mark as claimed
        for (uint i = 0; i < bets.length; i++) {
            if (bets[i].user == msg.sender) {
                bets[i].claimed = true;
                break;
            }
        }
        
        uint256 reward = 0;
        if (userPrediction == market.outcome) {
            // Winner gets proportional share of the pot
            uint256 winningBets = market.outcome ? market.totalYesBets : market.totalNoBets;
            reward = (userBetAmount * market.totalPot) / winningBets;
        }
        
        if (reward > 0) {
            payable(msg.sender).transfer(reward);
            emit RewardClaimed(marketId, msg.sender, reward);
        }
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory) {
        return marketBets[marketId];
    }

    function getUserBetAmount(uint256 marketId, address user) external view returns (uint256) {
        return userBetAmounts[marketId][user];
    }

    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }
}


