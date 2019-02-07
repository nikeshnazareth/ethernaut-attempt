import "./Delegate.sol";

pragma solidity ^0.5.0;

contract Delegation {

    address public owner;
    Delegate delegate;

    constructor(address _delegateAddress) public {
        delegate = Delegate(_delegateAddress);
        owner = msg.sender;
    }

    function() external {
        address(delegate).delegatecall(msg.data);
    }
}