pragma solidity ^0.5.0;

contract GatekeeperTwo {

    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        uint x;
        assembly { x := extcodesize(caller) }
        require(x == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        // conversions from bytes to uints are no longer allowed so I have commented them out
        // naturally, this gate will need to be defeated in the deployed contract
        // require(uint64(keccak256(msg.sender)) ^ uint64(_gateKey) == uint64(0) - 1);
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}