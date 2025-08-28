// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract TestContract {
    string public message;
    address public owner;
    
    constructor() {
        message = "Hello Somnia!";
        owner = msg.sender;
    }
    
    function setMessage(string memory newMessage) external {
        require(msg.sender == owner, "Only owner can change message");
        message = newMessage;
    }
    
    function getMessage() external view returns (string memory) {
        return message;
    }
}

