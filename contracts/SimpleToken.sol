pragma solidity ^0.5.0;

contract SimpleToken {

    // public variables
    string public name;
    mapping (address => uint) public balances;

    // constructor
    constructor(string memory _name, address _creator, uint256 _initialSupply) public {
        name = _name;
        balances[_creator] = _initialSupply;
    }

    // collect ether in return for tokens
    function() external payable {
        balances[msg.sender] = msg.value*10;
    }

    // allow transfers of tokens
    function transfer(address _to, uint _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] -= _amount;
        balances[_to] = _amount;
    }

    // clean up after ourselves
    function destroy(address payable _to) public {
        selfdestruct(_to);
    }
}