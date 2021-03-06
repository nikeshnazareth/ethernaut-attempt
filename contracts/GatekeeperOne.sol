pragma solidity ^0.5.0;

contract GatekeeperOne {

    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        // conversions from bytes to uints are no longer allowed so I have commented them out
        // naturally, this gate will need to be defeated in the deployed contract
        // require(uint32(_gateKey) == uint16(_gateKey));
        // require(uint32(_gateKey) != uint64(_gateKey));
        // require(uint32(_gateKey) == uint16(tx.origin));
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}