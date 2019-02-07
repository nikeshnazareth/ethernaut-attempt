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
- [x] [Level 2. Fallout](#fallout)
- [x] [Level 3. Coin Flip](#coinflip)
- [x] [Level 4. Telephone](#telephone)
- [x] [Level 5. Token](#token)
- [x] [Level 6. Delegation](#delegation)
- [x] [Level 7. Force](#force)
- [x] [Level 8. Vault](#vault)
- [x] [Level 9. King](#king)
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

<a name='fallout'>

### Level 2

* There is a `Fallout` contract
* The goal is to get ownership of the contract
* There are some irrelevant functions to adjust the allocations
(which are also buggy - sending allocations does not reduce the balance)
* The supposed constructor is misspelled (as _Fal1out_) which means it is callable
* It sets the owner to the caller

So the strategy is to simply call that function and become the owner.

This is implemented in _migrations/level2.js_

Note that this bug is mitigated with the new syntax, where constructors are not named after the contract
but are just called _constructor_.

<a name='coinflip'/>

### Level 3

* There is a `CoinFlip` contract
* There is a `flip` function that accepts a guess, generates a random bit and updates the winning streak:
   * If the guess matched the random bit, increment the streak
   * If the guess did not match the random bit, reset the streak to 0
   * Note: the guess is a boolean, and the random bit is cast to a boolean before comparison
* The goal is to get a winning streak of 10
* The random number generation mechanism within `flip` is:
   * Ensure this is the first time the function is called this block
   * Divide the previous block's hash by 0x8000000000000000000000000000000000000000000000000000000000000000
   * This is an integer division that rounds down
   * Note that this value is 256 bits long (a 1 followed by 255 0s)
   * A block hash is also 256 bits long
   * This means the random number equals the previous block hash's first bit
* Since block hashes are public, anyone can predict the outcome of the flip before it occurs

So the strategy is to repeatedly (10 times):
1. retrieve the previous block's hash
2. use it to predict the outcome of the flip
3. 'guess' correctly

This is implemented in _migrations/level3.js_

<a name='telephone'/>

### Level 4

* There is a `Telephone` contract
* The goal is to get ownership of the contract
* There is a `changeOwner` function that sets the owner to a passed value, provided `tx.origin != msg.sender`
* Recall `tx.origin` is the externally owned account (EOA) that initiated the transaction
* `msg.sender` is the EOA or contract that directly called the current function

So the strategy is to call `changeOwner` from a relay contract, which will ensure:
* `tx.origin` is the account that called the relay contract
* `msg.sender` is the address of the relay contract

This is implemented in _migrations/level4.js_

<a name='token'/>

### Level 5

* There is a `Token` contract
* We have already been given 20 tokens
* The goal is to get more
* The token distribution is recorded in a state variable `balances`
* There is a `transfer` function
   * it accepts `_to` and `_value` parameters
   * if confirms that the sender's balance exceeds `_value`
   * it then reduces the sender's balance increases `_to`'s balance by `_value`
* The `balances` and `_value` parameter have type `uint`
* The guard against overspending is achieved by subtracting `_value` from the sender's balance
and confirming the result is non-negative.
* Since both parameters are `uint`s, if `_value` exceeds the sender's balance, it will underflow
and the check will stil pass
* Additionally, when `_value` is subtracted from the sender's balance, it will underflow.

So the strategy is to send 21 tokens to anyone else so our balance will underflow.

This is implemented in _migrations/level5.js_

<a name='delegation'/>

### Level 6

* There is a `Delegation` contract
* The goal is to claim ownership of the contract.
* It is initialised with a state variable equal to a `Delegate` contract
* It's fallback function executes `delegatecall(msg.data)` on the `Delegate` contract
* The `Delegate` contract has a `pwn` function the sets its owner to the msg sender
* `delegatecall` is intended for library functions that execute in the context of the *caller* function
* This means that if we can get the `Delegation` to `delegatecall` to the `pwn` function,
it will set the owner of `Delegation` to the message sender

So the strategy is to invoke `Delegation`'s fallback function with message data corresponding
to the `pwn` function of `Delegate`

This is implemented in _migrations/level6.js_

<a name='force'/>

### Level 7

* There is a `Force` contract, which is empty
* There is no payable function.
* The goal is to send ETH to the contract
* There are two ways to send ETH to a contract without a payable function:
   * we can mine directly to that address
   * we can call `selfdestruct` on a contract with ETH, and direct the refund to the target contract

So the strategy is:
1. Create a contract that accepts ETH
1. Send some ETH to the contract
1. Call `selfdestruct` on the contract and direct the refund to the target

This is implemented in _migrations/level7.js_

<a name='vault'/>

### Level 8

* There is a `Vault` contract
* It has a private state variable `locked` set to true
* The goal is to set that to false
* It has a `password` state variable that is initialised on deployment
* There is an `unlock` function that will set `locked` to false if we supply the right password
* The fact that the state variable is private means we can't query it with the contract interface
* It is not a secret value though - it is still stored on the blockchain
* We can retrieve it by looking at the contract storage

So the strategy is:
1. Get the password from the `Vault` storage
1. Call `unlock` with the password

This is implemented in _migrations/level8.js_

<a name='king'/>

### Level 9

* There is a `King` contract
* It has a state variable `king`
* The goal is to become the king and then prevent anyone from reclaiming the throne.
* The contract is initialised with a 1 ETH `prize` on deployment
* It has a payable fallback function that:
   * ensures the transaction amount exceeds the current prize (or the sender is the owner)
   * sends the amount to the current king
   * makes the message sender the new king
   * updates the prize to be the transaction amount
* We can become king by sending more than 1 ETH.
* If we use a contract, its fallback function will be called
whenever the owner attempts to reclaim the thrown (because that involves sending us the new amount)

So the strategy is:
1. Create a contract to be king
1. Set the fallback function to always revert, preventing the owner from reclaiming the throne.
1. Claim the throne

Note: the contract should have a mechanism for us to withdraw the funds in it.
I will ignore that for now.

This is implemented in _migrations/level9.js_
