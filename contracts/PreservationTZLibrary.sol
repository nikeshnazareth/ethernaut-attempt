pragma solidity ^0.5.0;

contract PreservationTZLibrary {
    uint public unusedA;
    uint public unusedB;
    uint public owner;

    function setTime(uint addr) public {
        owner = addr;
    }
}