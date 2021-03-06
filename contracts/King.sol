pragma solidity ^0.5.0;

import './Ownable.sol';

contract King is Ownable {

    address payable public king;
    uint public prize;

    constructor() public payable {
        king = msg.sender;
        prize = msg.value;
    }

    function() external payable {
        require(msg.value >= prize || msg.sender == owner);
        king.transfer(msg.value);
        king = msg.sender;
        prize = msg.value;
    }
}