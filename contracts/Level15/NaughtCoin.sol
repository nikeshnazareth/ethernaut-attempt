pragma solidity ^0.5.0;

import './StandardToken.sol';

contract NaughtCoin is StandardToken {

    string public constant name = 'NaughtCoin';
    string public constant symbol = '0x0';
    uint public constant decimals = 18;
    // this was originally using the deprecated 'years' keyword. For the purpose of this challenge, the time period doesn't matter
    uint public timeLock = now + 10 days;
    uint public INITIAL_SUPPLY = 1000000 * (10 ** decimals);
    address public player;

    constructor(address _player) public {
        player = _player;
        totalSupply_ = INITIAL_SUPPLY;
        balances[player] = INITIAL_SUPPLY;
        emit Transfer(address(0), player, INITIAL_SUPPLY);
    }

    function transfer(address _to, uint256 _value) lockTokens public returns(bool) {
        super.transfer(_to, _value);
    }

    // Prevent the initial owner from transferring tokens until the timelock has passed
    modifier lockTokens() {
        if (msg.sender == player) {
            require(now > timeLock);
            _;
        } else {
            _;
        }
    }
}