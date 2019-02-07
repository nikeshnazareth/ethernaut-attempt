import "./Ownable.sol";

pragma solidity ^0.5.0;


contract Fallback is Ownable {

    mapping(address => uint) public contributions;

    constructor() public {
        contributions[msg.sender] = 1000 * (1 ether);
    }

    function contribute() public payable {
        require(msg.value < 0.001 ether);
        contributions[msg.sender] += msg.value;
        if(contributions[msg.sender] > contributions[owner]) {
            owner = msg.sender;
        }
    }

    function getContribution() public view returns (uint) {
        return contributions[msg.sender];
    }

    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    function() payable external {
        require(msg.value > 0 && contributions[msg.sender] > 0);
        owner = msg.sender;
    }
}