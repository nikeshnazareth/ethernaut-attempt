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
- [x] [Level 10. Re-entrancy](#reentrance)
- [x] [Level 11. Elevator](#elevator)
- [x] [Level 12. Privacy](#privacy)
- [x] [Level 13. Gatekeeper One](#gatekeeper1)
- [ ] [Level 14. Gatekeeper Two](#gatekeeper2)
- [x] [Level 15. Naught Coin](#naughtcoin)
- [x] [Level 16. Preservation](#preservation)
- [x] [Level 17. Locked](#locked)
- [x] [Level 18. Recovery](#recovery)
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

<a name='reentrance'/>

### Level 10

* There is a `Reentrance` contract with 1 ETH
* The goal is to steal the funds from the contract
* It tracks address balances with a `balances` mapping
* It has a `donate` function which allows a user to donate ETH to any address
* It has a `withdraw(_amount)` function that:
   * confirms the message sender has a balance of at least `_amount`
   * sends `_amount` to the message sender
   * reduce the message sender's balance by `_amount`
* This is vulnerable to the re-entrancy attack:
   * the message sender is a contract
   * it has a callback function that calls `withdraw`
   * since `withdraw` sends funds before reducing the balance, re-entrant calls will all be executed
     with the original balance and then the balance will be reduced after sending the funds.
* This means that an attacker can withdraw their balance multiple times in a single call.
* In this case, it also means that their balance will underflow to a massive value
( which will all them to withdraw all the funds )
* In a typical re-entrancy attack, the fallback function should have an exit condition to prevent
  an out-of-gas exception reverting the transaction
* In this case, the `withdraw` function sends funds with `call`, which will simply return false
  once it is out of gas.

So the strategy is:
1. Create an attacker contract
1. Set the fallback to call `withdraw`.
1. Point the attacker contract to the target `Reentrance` contract
1. Call `donate` with the attacker contract address
1. Trigger the `withdraw` function, which will loop between the attacker fallback and `withdraw`
1. Drain the rest of the funds.

This is implemented in _migrations/level10.js_

<a name='elevator'/>

### Level 11

* There is an `Elevator` contract
* It has a `top` variable defaulting to _false_
* The goal is to set that variable to _true_
* There is a `Building` interface with one function:
   * `function isLastFloor(uint) view external returns (bool);
* The `Elevator` contract has a `goTo(_floor)` function that:
   * Casts the sender to a `Building`
   * If `isLastFloor(_floor)` return false, set `top` to `isLastFloor(_floor)`
* Note that this implies that if the function returns the same value both times,
  `top` remains false
* The fact that `isLastFloor` is a `view` function seems to imply it cannot modify storage.
* However, it is possible to cast any address to any type, so casting to `Building` does not guarantee conformance to the interface
* This may create a run-time error if an executed function is missing or accepts the wrong parameter types

So the strategy is:
1. Create a phony `Building` contract that does not inherit from `Building`, but does implement `isLastFloor`
1. Return _false_ on the first call and _true_ on the second call
1. Trigger the `Elevator` contract's `goTo` function from the attacker contract.

This is implemented in _migrations/level11.js_

<a name='privacy'/>

### Level 12

* There is an `Privacy` contract
* It has a `locked` state variable
* The goal is to set that to false
* It seems similar to the [Level 8](#vault) challenge
* There are a number of state variables, one of which is `data`
* If we can submit a processed version of `data` to the `unlock` function, it will unlock the contract
* We should be able to just look at the contract storage while paying attention to variable sizes.

###### Storage Layout Refresher
* The first item in a (32-byte) storage slot is lower-order aligned
* If an item cannot fit in the rest of a storage slot, it is moved to the next one
* Structs and array data always occupy a new (whole) slot, but individually items are still packed
* Inherited contracts can have storage slots shared between variables from different contracts
* `constant` variables do not occupy storage slots

In our case, the storage is packed as follows:

27 bytes | 2 bytes | 1 byte | 1 byte | 1 byte |
---------|---------|--------|--------|--------|
( unused ) | awkwardness | denomination | flattening | locked |

32 bytes |
---------|
data\[0\]|

32 bytes |
---------|
data\[1\]|

32 bytes |
---------|
data\[2\]|

So the strategy is:
1. Read the 4th storage location ( `data[2]` )
1. Take the top half ( `bytes16( data[2] )` )
1. Pass that value to the `unlock` function

This is implemented in _migrations/level12.js_

<a name='gatekeeper1'/>

### Level 13

* There is a `GatekeeperOne` contract
* The goal is to register as an entrant
* There is an `enter` function which lets you register if you can pass three modifiers
* The first one ensures `msg.sender != tx.origin`, which means we need to use a contract
* The second one ensures `gasleft() % 8191 === 0`, so we have to set the gas appropriately
* The third one ensures the passed `_gateKey` parameter satisfies three simultaneous conditions:
   * `uint32(_gateKey) == uint16(_gateKey)` => bytes 2 and 3 (counting from the right) are zero
   * `uint32(_gateKey) != uint64(_gateKey)` => bytes 4-7 are collectively non-zero
   * `uint32(_gateKey) == uint16(tx.origin)` => bytes 0 and 1 are the bottom two bytes of tx.origin
* Experimenting with Remix suggests the gas used by the first gate is 39, but the particular value will
  depend on the compiler and optimizations used.
* I don't know of a sensible way to deal with this, so I will just brute force possible gas values.
* The third gate does not compile with Remix (even with an old compiler) because you can no longer cast bytes to uints.
  This means I can't directly check the gas usage of the whole function. For simplicity, I will just provide significantly
  more gas than required per call.

So the strategy is:
* Create a registration contract
* Generate a `_gateKey` value in line with the third gate
* Call `enter` with this value and (10 * 8191 + i) gas, for a range of i.
  (Note: we don't need to brute force different transactions - the contract itself can brute force as long as we use the
  `call` function instead of `transfer`)

This is implemented in _migrations/level13.js_

<a name='gatekeeper2'/>

### Level 14

* There is a `GatekeeperTwo` contract
* This has the same structure as the previous challenge with different modifiers
* The first one ensures `msg.sender != tx.origin`, which means we need to use a contract
* The second one uses inline assembly to ensure `extcodesize(caller) == 0`. This implies that the caller does not have any code (it is not a contract)
* I think these two conditions can be met if we use `delegatecall` in our contract (so the `caller` parameter is still the externally-owned account).
* I would have guessed that this means we can't update the state of the `GatekeeperTwo`, but maybe it uses its own variables if our contract does not have a matching variable
  (ie. if our contract does not have an `entrant` variable, then we can still update the `GatekeeperTwo` contract's `entrant` variable through `delegatecall`)
* Or maybe we have to use assembly to jump to the function without changing the context, but if such a thing is possible, it is probably a massive security issue
* Experimenting with Remix I have been able to confirm:
   * `caller` is typically the calling contract, but if `delegatecall` is used, it is the previous caller.
   * this means we can bypass the `extcodesize(caller) == 0` check if we use `delegatecall`
   * however, a function called with `delegatecall` will not affect the called contract's state, so we can't update `entrant`
* I can't think of another way to ensure the first two gates can be both passed.
* I will leave it for now - if I really can't come up with any ideas I will look at the solutions

<a name='naughtcoin'/>

### Level 15

* There is a `NaughtCoin` contract, which is a `StandardToken`
* We currently hold all the coins.
* The `transfer` function has been overloaded to prevent us specifically from sending the tokens.
* The goal is to bypass the timelock and be able to transfer them freely.
* The `StandardToken` allows us to assign tokens to other addresses (the other addresses can spend tokens on our behalf)

So the strategy is:
1. Assign the tokens to another address that we hold
2. Transfer them to that address

This is implemented in _migrations/level15.js_

<a name='preservation'/>

### Level 16

* There is a `Preservation` contract
* The goal is to take ownership
* The contract has two library addresses `timeZone1Library` and `timeZone2Library`
* When either `setFirstTime` or `setSecondTime` is called, `setTime` in the corresponding
  library instance is executed using `delegatecall`.
* The `LibraryContract` is specified and its `setTime` function simply sets the `storedTime` value to the passed parameter.
* Because `delegatecall` maintains scope, this sets the `storedTime` variable in the target contract.
* There is no direct way to set the owner.
* I suspect we need to overflow the storage, except `storedTime` is after the `owner` variable and all
  the relevant values are `uint`s.
* I also suspect that any casting shenanigans we could play would be prevented by the new compiler.
* If we could set one of the library addresses, we can point it to our own contract, which can then edit the state arbitrarily.
* But neither of the functions that we can call directly set the state.
* Another idea: we know the address of the libraries, so we could call them directly (to set their own state) or via `delegatecall`
* Note: In order to use the latest compiler, I replaced the line:
   * timeZone1Library.delegatecall(setTimeSignature, _timeStamp), with
   * timeZone1Library.delegatecall(abi.encodeWithSignature("setTime(uint256)", _timeStamp))
* Maybe the old `delegatecall` accepted more parameters
* OH, I just discovered an important fact. I thought `delegatecall` did lookups by variable names.
* Actually, **The `delegatecall` callee performs variable lookups by storage slot number**
* Each variable name is simply an index into the storage
* So in this case, the library contract has `storedTime` set at slot 0. When `setTime` is called, it sets
  slot 0 to be the passed in `uint`.
* When the library is `delegatecall`ed from the `Preservation` contract, it will set whatever is stored at slot 0,
which happens to be the first library address.

So the strategy is:
1. Create an attack contract with a `setTime(uint)` function that overwrites the third storage slot
1. Call `setSecondTime` with the attack contract address as a parameter
   ( our attack contract is now `timeZone1Library` )
1. Call `setFirstTime` with the player address, overwriting the owner storage slot

This is implemented in _migrations/level16.js_

<a name='locked'/>

### Level 17

* There is a `Locked` contract
* It has a storage variable `unlocked` initialised to `false`
* The goal is to set it to `true`
* There is only one function `register`, which updates the other state variables
* `register` declares an uninitialised
* in the challenge version, the struct defaults to `storage`, and since it's uninitialised, it default to zero.
* In the current version of solidity, you have to specify either `memory` or `storage` and you cannot
  compile a contract with an uninitialised storage variable
* In this case, values written into the struct will overwrite the first storage slot,
  which holds the `unlocked` variable

So the strategy is:
1. Call `register` with a `bytes32` name parameter that has a non-zero last byte

This is implemented in _migrations/level17.js_

<a name='recovery'/>

### Level 18

* There is a `Recovery` contract
* It generates new `SimpleToken` contracts
* The creator generated a new token, sent ETH to the contract and has now lost the address
* The goal is to recover the lost ETH
* The first step should be to find the lost contract. When contracts are deployed, addresses are generated as follows:
   * RLP encode \[ sender, nonce ]
   * Compute Keccak256 of the result
   * Take the bottom 20 bytes
* Since we know the `Recovery` contract address and we're trying to find the first deployed contract (nonce = 1), we should be able to calculate the address.
* The `SimpleToken` contract has a `destroy` function that will return the funds to the specified address

So the strategy is:
1. Calculate the address of the `SimpleToken` contract
1. Call `destroy` with the player address

This is implemented in _migrations/level18.js_
