pragma solidity ^0.5.0;

contract Forcer {
    function () external payable {}

    function close(address payable target) public {
        selfdestruct(target);
    }
}