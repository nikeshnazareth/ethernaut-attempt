# My Ethernaut Attempt

## Overview

The Ethernaut is a capture-the-flag style contest for finding bugs in
Solidity contract.

It was created by OpenZeppelin and is available [here](https://ethernaut.zeppelin.solutions/).

I will use this repository to describe my thought process, hold any code I write and document any useful insights.

#### Implementation note
* The contracts are compiled with solc 0.4.18.
* We are currently using solc 0.5.x.
* Although truffle can be configured to use an old compilers,
it does not produce the `legacyAST` variable, which causes errors.
* Whenever I want truffle to produce an ABI for a level, I modify the
code to be compatible with the latest compiler.

## Progress

- [x] [Level 0. Hello Ethernaut](#hello)
- [x] [Level 1. Fallback](#fallback)
- [ ] Level 2. Fallout
- [ ] Level 3. Coin Flip
- [ ] Level 4. Telephone
- [ ] Level 5. Token
- [ ] Level 6. Delegation
- [ ] Level 7. Force
- [ ] Level 8. Vault
- [ ] Level 9. King
- [ ] Level 10. Re-entrancy
- [ ] Level 11. Elevator
- [ ] Level 12. Privacy
- [ ] Level 13. Gatekeeper One
- [ ] Level 14. Gatekeeper Two
- [ ] Level 15. Naught Coin
- [ ] Level 16. Preservation
- [ ] Level 17. Locked
- [ ] Level 18. Recovery
- [ ] Level 19. MagicNumber
- [ ] Level 20. Alien Codex
- [ ] Level 21. Denial
- [ ] Level 22. Shop

<a name='hello'/>

### Level 0

This level is designed to get used to interacting with contracts through the console.
* The level presents a series of instructions (eg. call the function `info()`)
* It eventually instructs us to enter the password in `authenticate`
* There is a state variable named `password` set to **ethernaut0**
* Pass that to `authenticate` to complete the level

<a name='fallback'>

### Level 1

* There is a `Fallback` contract
* The goal is to take ownership and reduce the balance to 0
* There is a `contributions` variable that tracks how much each user has contributed
* The constructor assigns 1000 ETH to the owner
( notionally - the contract does not own any ETH )
* There is a payable `contribute` function:
   * You must send less than 0.001 ETH
   * Your contribution gets recorded against your account
   * If you become the highest contributor, you also become the owner.
* Obviously, calling `contribute` a million times is not the desired solution
* There is a `withdraw` function that lets the owner drain the contract
* There is a fallback function:
   * You need to send some ETH
   * You need to already have contributed some ETH
   * You become the owner

So the strategy is:
1. Call `contribute` with 1 Wei (so we can call the fallback function)
1. Call the fallback function with 1 Wei to become the owner
1. Call `withdraw` to drain the contract

This is implemented in _migrations/level1.js_
