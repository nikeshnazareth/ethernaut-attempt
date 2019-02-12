### Overview

The goal of this problem is to write a `Solver` contract that:
* returns 42 when the function `whatIsTheMeaningOfLife()` is called
* has at most 10 opcodes

### Default compilation

Let's start by looking at the opcodes produced by the solc compiler on
the desired contract:

```
pragma solidity ^0.5.0;

contract Solver {

  function whatIsTheMeaningOfLife() public pure returns (uint) {
    return 42;
  }
}
```

The transaction has the data payload:
> 6080604052348015600f57600080fd5b5060928061001e6000396000f3fe6080604052600436106038577c01000000000000000000000000000000000000000000000000000000006000350463650500c18114603d575b600080fd5b348015604857600080fd5b50604f6061565b60408051918252519081900360200190f35b602a9056fea165627a7a7230582099d746488d54ea91c9c8a0160646707dbe22f09dc69bf261bd5415aabc13c8690029


I used https://etherscan.io/opcode-tool to disassemble this.
*Gotcha*: Inexplicably, they label the opcodes using 1-up indexing in decimal.

Here is the output
```
// Set the free memory pointer to 0x80
[1] PUSH1 0x80
[3] PUSH1 0x40
[4] MSTORE

// If msg.value != 0, revert(0,0)
[5] CALLVALUE
[6] DUP1
[7] ISZERO
[9] PUSH1 0x0f
[10] JUMPI
[12] PUSH1 0x00
[13] DUP1
[14] REVERT

// Arrive here if msg.value == 0 in the constructor
// pop msg.value from the stack ( resetting it )
[15] JUMPDEST
[16] POP

// codecopy(0, 0x001e, 0x92) = copy 0x92 (146) bytes from location 0x1e (30) to location 0
// return(0, 0x92)
[18] PUSH1 0x92
[19] DUP1
[22] PUSH2 0x001e
[24] PUSH1 0x00
[25] CODECOPY
[27] PUSH1 0x00
[28] RETURN
[29] 'fe'(Unknown Opcode)

// run-time code returned by the constructor
[31] 6080604052600436106038577c01000000000000000000000000000000000000000000000000000000006000350463650500c18114603d575b600080fd5b348015604857600080fd5b50604f6061565b60408051918252519081900360200190f35b602a9056fea165627a7a7230582099d746488d54ea91c9c8a0160646707dbe22f09dc69bf261bd5415aabc13c8690029
```

The runtime code disassembles to:
```
// set the free memory pointer to 0x40
[1] PUSH1 0x80
[3] PUSH1 0x40
[4] MSTORE

// if calldatasize < 4, go to 0x38 (56) and revert(0,0)
[6] PUSH1 0x04
[7] CALLDATASIZE
[8] LT
[10] PUSH1 0x38
[11] JUMPI

// else
// get the first 4 bytes of call data (the hash of the function signature)
[41] PUSH29 0x0100000000000000000000000000000000000000000000000000000000
[43] PUSH1 0x00
[44] CALLDATALOAD
[45] DIV

// if the function signature is whatIsTheMeaningOfLife(), go to 0x3d (61)
[50] PUSH4 0x650500c1  // = keccak256('whatIsTheMeaningOfLife()')[:4]
[51] DUP2
[52] EQ
[54] PUSH1 0x3d
[55] JUMPI

// arrive here if calldatasize < 4 or the function signature does not match a known function
// revert(0,0) - there is no fallback function
[56] JUMPDEST
[58] PUSH1 0x00
[59] DUP1
[60] REVERT

// arrive here if whatIsTheMeaningOfLife() was called
// the stack currently looks like [ hash(fnSig) ]
[61] JUMPDEST

// if msg.value != 0, revert(0,0) [ the function is not payable ]
[62] CALLVALUE
[63] DUP1
[64] ISZERO
[66] PUSH1 0x48
[67] JUMPI
[69] PUSH1 0x00
[70] DUP1
[71] REVERT

// arrive here if whatIsTheMeaningOfLife() was called with no ETH
// remove msg.value from the stack, leaving [ hashfn(Sig) ]
[72] JUMPDEST
[73] POP

// push the return address 0x4f (79) onto the stack can call the function at 0x61 (97)
[75] PUSH1 0x4f
[77] PUSH1 0x61
[78] JUMP

// arrive here with the stack looking like [ 42, hash(fnSig) ]
// store 42 in the first free memory location and return it
[79] JUMPDEST
[81] PUSH1 0x40
[82] DUP1
[83] MLOAD
[84] SWAP2
[85] DUP3
[86] MSTORE
[87] MLOAD
[88] SWAP1
[89] DUP2
[90] SWAP1
[91] SUB
[93] PUSH1 0x20
[94] ADD
[95] SWAP1
[96] RETURN

// arrive here with the stack looking like [ return address , hash(fnSig) ]
// push 42 onto the stack and return
[97] JUMPDEST
[99] PUSH1 0x2a
[100] SWAP1
[101] JUMP

// unused opcodes
[102] fea165627a7a7230582099d746488d54ea91c9c8a0160646707dbe22f09dc69bf261bd5415aabc13c8690029
```


### Optimization

Our goal is to reproduce that functionality in only 10 opcodes. Some things to notice:
* The constructor code is not part of our contract
   * The `MagicNumber` contract will not be able to detect the size of the constructor
   * Therefore, we don't need to optimize it, we can reuse the one from here (as long as we change the code size and location)
* Most of the code above involves checking input parameters and finding the right function to call
* To reduce the code to 10 opcodes, we will need to remove all of that.
* Note that the success condition is that we return 42 when 'whatIsTheMeaningOfLife()` is called
* There is no requirement about what happens in other situations
* We can ignore `msg.value` and `calldata` and simply return 42 every time, whether or not the right function is called

The run-time code then reduces to:
```
mstore8(0, 42)
return(0, 1)
```

To ensure word alignment, let's use 32-byte words
```
mstore(0, 42)
return(0, 0x20)
```

Or in opcodes:
```
602a PUSH1 42
6000 PUSH1 0
52 MSTORE(0, 42)
6020 PUSH1 0x20
6000 PUSH1 0
F3 RETURN
```

This is 6 operations in 10 bytes:
>

Recall the constructor code was 29 bytes:
> 6080604052348015600f57600080fd5b5060928061001e6000396000f3

Since we're not optimizing constructor code, we can get round numbers if we pad it to 32:
> 6080604052348015600f57600080fd5b5060928061001e6000396000f3000000

When we append them together we get:
> 6080604052348015600f57600080fd5b5060928061001e6000396000f3000000602a60005260206000f3

Lastly we should tweak the code size parameters. Instead of returning 0x92 bytes from position 0x1e,
we should return 0x0a bytes from position 0x20.
> 6080604052348015600f57600080fd5b50600a806100206000396000f3000000602a60005260206000f3

As a final check, this is the disassembled version:
```
// set the free memory pointer to 0x80
[1] PUSH1 0x80
[3] PUSH1 0x40
[4] MSTORE

// if msg.value != 0, revert(0,0)
[5] CALLVALUE
[6] DUP1
[7] ISZERO
[9] PUSH1 0x0f
[10] JUMPI
[12] PUSH1 0x00
[13] DUP1
[14] REVERT

// arrive here if msg.value == 0
// pop msg.value from the stack (resetting it)
[15] JUMPDEST
[16] POP

// codecopy(0, 0x20, 0xa) = copy 0xa (10) bytes from position 0x20 (32) to memory location 0
// return(0, 0xa) = return the 10 bytes at memory location 0
[18] PUSH1 0x0a
[19] DUP1
[22] PUSH2 0x0020
[24] PUSH1 0x00
[25] CODECOPY
[27] PUSH1 0x00
[28] RETURN
[29] STOP
[30] STOP
[31] STOP

// the runtime code we wanted
// mstore(0, 42)
// return(0, 0x20)
[33] PUSH1 0x2a
[35] PUSH1 0x00
[36] MSTORE
[38] PUSH1 0x20
[40] PUSH1 0x00
[41] RETURN
```

### Deployment

To deploy the contract, send a transaction to address 0 with the constructor bytecodes in the data field

This is implemented in _migrations/level19.js_