# My Ethernaut Attempt

## Overview

The Ethernaut is a capture-the-flag style contest for finding bugs in
Solidity contract.

It was created by OpenZeppelin and is available [here](https://ethernaut.zeppelin.solutions/).

I will use this repository to describe my thought process, hold any code I write and document any useful insights.

## Progress

- [x] [Level 0. Hello Ethernaut](#hello)
- [ ] Level 1. Fallback
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
