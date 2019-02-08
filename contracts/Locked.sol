pragma solidity ^0.5.0;

// We can't compile the original Locked contract because of the uninitialised storage variable
// Since we only need the ABI, use an interface instead
interface Locked {
    function register(bytes32 _name, address _mappedAddress) external;
}