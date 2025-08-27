// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimplePredictionMarket {
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
        uint256 initialPool;
        bool isResolved;
        bool outcome;
        bool isClosed;
        uint256 totalBets;
        uint256 totalPool;
    }

    struct Bet {
        address user;
        uint256 amount;
        bool prediction;
        uint256 timestamp;
        bool claimed;
    }

    uint256 private _marketIds = 0;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(address => uint256[]) public userBets;
    mapping(address => uint256) public userBalances;
    mapping(uint256 => mapping(address => uint256)) public userBetAmounts;

    // Events
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 closingTime, uint256 initialPool);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event MarketClosed(uint256 indexed marketId);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event BalanceWithdrawn(address indexed user, uint256 amount);

    // Modifiers
    modifier marketExists(uint256 marketId) {
        require(markets[marketId].creator != address(0), "Market does not exist");
        _;
    }

    modifier marketNotClosed(uint256 marketId) {
        require(!markets[marketId].isClosed, "Market is closed");
        _;
    }

    modifier marketNotResolved(uint256 marketId) {
        require(!markets[marketId].isResolved, "Market is already resolved");
        _;
    }

    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory title,
        string memory description,
        uint256 closingTime,
        uint256 minBet,
        uint256 maxBet
    ) external payable {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(closingTime > block.timestamp + 1 hours, "Closing time must be at least 1 hour in the future");
        require(minBet >= 0.001 ether, "Minimum bet must be at least 0.001 ETH");
        require(maxBet >= minBet, "Maximum bet must be greater than or equal to minimum bet");
        require(maxBet <= 10 ether, "Maximum bet cannot exceed 10 ETH");
        require(msg.value >= 0.01 ether, "Initial pool must be at least 0.01 ETH");
        require(msg.value <= 100 ether, "Initial pool cannot exceed 100 ETH");

        _marketIds++;
        uint256 marketId = _marketIds;

        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            title: title,
            description: description,
            closingTime: closingTime,
            totalYesBets: 0,
            totalNoBets: 0,
            minBet: minBet,
            maxBet: maxBet,
            initialPool: msg.value,
            isResolved: false,
            outcome: false,
            isClosed: false,
            totalBets: 0,
            totalPool: msg.value
        });

        emit MarketCreated(marketId, msg.sender, title, closingTime, msg.value);
    }

    /**
     * @dev Place a bet on a market
     */
    function placeBet(uint256 marketId, bool prediction) external payable marketExists(marketId) marketNotClosed(marketId) marketNotResolved(marketId) {
        Market storage market = markets[marketId];
        require(block.timestamp < market.closingTime, "Market is closed for betting");
        require(msg.value >= market.minBet, "Bet amount below minimum");
        require(msg.value <= market.maxBet, "Bet amount above maximum");
        require(msg.sender != market.creator, "Market creator cannot bet on their own market");

        if (prediction) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }

        market.totalBets += 1;
        market.totalPool += msg.value;

        Bet memory newBet = Bet({
            user: msg.sender,
            amount: msg.value,
            prediction: prediction,
            timestamp: block.timestamp,
            claimed: false
        });

        marketBets[marketId].push(newBet);
        userBets[msg.sender].push(marketId);
        userBetAmounts[marketId][msg.sender] += msg.value;

        emit BetPlaced(marketId, msg.sender, msg.value, prediction);
    }

    /**
     * @dev Resolve a market (only market creator)
     */
    function resolveMarket(uint256 marketId, bool outcome) external marketExists(marketId) marketNotResolved(marketId) {
        Market storage market = markets[marketId];
        require(block.timestamp >= market.closingTime, "Market not yet closed");
        require(market.totalBets > 0, "No bets placed on market");
        require(msg.sender == market.creator, "Only creator can resolve");

        market.isResolved = true;
        market.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    /**
     * @dev Close a market (only market creator)
     */
    function closeMarket(uint256 marketId) external marketExists(marketId) marketNotClosed(marketId) {
        require(msg.sender == markets[marketId].creator, "Only creator can close");
        markets[marketId].isClosed = true;
        emit MarketClosed(marketId);
    }

    /**
     * @dev Claim rewards for winning bets
     */
    function claimReward(uint256 marketId) external marketExists(marketId) {
        Market storage market = markets[marketId];
        require(market.isResolved, "Market not resolved");
        require(!market.isClosed, "Market is closed");

        uint256 totalReward = 0;
        Bet[] storage bets = marketBets[marketId];

        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].user == msg.sender && bets[i].prediction == market.outcome && !bets[i].claimed) {
                uint256 userBetAmount = bets[i].amount;
                uint256 totalWinningBets = market.outcome ? market.totalYesBets : market.totalNoBets;
                
                if (totalWinningBets > 0) {
                    uint256 reward = (userBetAmount * market.totalPool) / totalWinningBets;
                    totalReward += reward;
                }
                
                bets[i].claimed = true;
            }
        }

        require(totalReward > 0, "No rewards to claim");

        userBalances[msg.sender] += totalReward;
        emit RewardClaimed(marketId, msg.sender, totalReward);
    }

    /**
     * @dev Withdraw user balance
     */
    function withdrawBalance() external {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit BalanceWithdrawn(msg.sender, balance);
    }

    // View functions
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory) {
        return marketBets[marketId];
    }

    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    function getMarketCount() external view returns (uint256) {
        return _marketIds;
    }

    function getUserBetAmount(uint256 marketId, address user) external view returns (uint256) {
        return userBetAmounts[marketId][user];
    }

    function getMarketStats(uint256 marketId) external view returns (
        uint256 totalYesBets,
        uint256 totalNoBets,
        uint256 totalBets,
        uint256 totalPool,
        bool isResolved,
        bool outcome
    ) {
        Market storage market = markets[marketId];
        return (
            market.totalYesBets,
            market.totalNoBets,
            market.totalBets,
            market.totalPool,
            market.isResolved,
            market.outcome
        );
    }
} 