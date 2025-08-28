// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleSomniaMarket {
    uint256 public marketCount;
    
    struct Market {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 closingTime;
        uint256 totalYesBets;
        uint256 totalNoBets;
        bool isResolved;
        bool outcome;
        bool isClosed;
    }
    
    struct Bet {
        address user;
        uint256 amount;
        bool prediction;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    
    constructor() {
        marketCount = 0;
    }
    
    function createMarket(
        string calldata title,
        string calldata description,
        uint256 closingTime
    ) external {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(closingTime > block.timestamp + 1 hours, "Min 1 hour future");

        marketCount++;
        
        markets[marketCount] = Market({
            id: marketCount,
            creator: msg.sender,
            title: title,
            description: description,
            closingTime: closingTime,
            totalYesBets: 0,
            totalNoBets: 0,
            isResolved: false,
            outcome: false,
            isClosed: false
        });

        emit MarketCreated(marketCount, msg.sender, title);
    }

    function placeBet(uint256 marketId, bool prediction) external payable {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(!market.isClosed, "Market closed");
        require(!market.isResolved, "Market resolved");
        require(block.timestamp < market.closingTime, "Betting closed");
        require(msg.value >= 0.001 ether, "Min bet 0.001 STT");
        require(msg.sender != market.creator, "Creator cannot bet");

        if (prediction) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }

        marketBets[marketId].push(Bet({
            user: msg.sender,
            amount: msg.value,
            prediction: prediction,
            claimed: false
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

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory) {
        return marketBets[marketId];
    }

    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }
}


