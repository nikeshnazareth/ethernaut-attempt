## Solidity Assembly

### Overview

* Solidity assembly provides more fine grained control for additional functionality or optimisations
* It bypasses many security features so should be used with caution

### Syntax
* Use normal `//` and `/* */` comments
* Put inline assembly within an `assembly { }` block
* Opcodes can be used in functional style `add(1, mload(0))`
* Variable declarations: `let x:= add(y, 3)` ( initialised to zero if not specified )
* Local variable are scoped inside blocks

### Opcodes

A cursory view of the opcodes seems similar to other assembly languages.
I will transcribe and group them anyway to force me to understand them individually at least once.

Many opcodes have obvious functions so I won't explain them.

Signed numbers use two's complement.


| Execution ||
|---|---|
| stop | stop execution (don't push anything on the stack) |

| Arithmetic ||
|---|---|
| add(x, y) |
| sub(x, y) |
| mul(x, y) |
| div(x, y) |
| sdiv(x, y) | signed division |
| mod(x, y) |
| smod(x, y) | signed modulo |
| exp(x, y) |
| addmod(x, y, m) | (x + y) % m |
| mulmod(x, y, m) | (x * y) % m |

| Comparison ||
|---|---|
| lt(x, y)|
| gt(x, y)|
| slt(x, y) | signed less than |
| sgt(x, y) | signed greater than |
| eq(x, y)|
| iszero(x)|

| Bit operations ||
|---|---|
| not(x) | every bit is negated |
| and(x, y) |
| or(x, y) |
| xor(x, y) |
| shl(x, y) | logical shift left |
| shr(x, y) | logical shift right |
| sar(x, y) | arithmetic shift right, the sign bit is copied |
| signextend(i, x) | sign extend from (i*8+7)th bit counting from least significant |

| Indexing ||
|---|---|
|byte(n, x)| nth byte of x, where the most significant byte is 0 |

| Cryptography ||
|---|---|
| keccak256(p,n) | keccak( n bytes from position p in memory ) |

| Navigation ||
|---|---|
| jump(label) ||
| jumpi(label, cond) | jump to label if cond is nonzero |
| pc | program counter ( current position in code ) |

| Stack Manipulation ||
|---|---|
| pop(x) | remove the element pushed by x ??? |
| dup1 ... dup16 | copy nth stack slot to the top (counting from the top), increasing the stack size |
| swap1 ... swap16 | swap topmost and nth stack slot below it |

| Input / Output ||
|---|---|
| mload(p) | The 32-byte word at position p |
| mstore(p, v) | Set the 32-byte word at position p to v|
| mstore8(p, v) | Set the single byte at position p to (v & 0xff) |
| sload(p) | The storage slot at position p |
| sstore(p,v) | Set the storage slot at position p to v |
| msize | size of memory (ie. largest accessed memory index ) |

| Introspection ||
|---|---|
| gas | gas still available |
| address | the address of the current contract / execution context |
| balance(a) | wei balance at addresss a |
| caller | call sender (excluding `delegatecall`) |
| callvalue | wei sent with the current call |
| calldataload(p) | 32 bytes of call data starting from position p |
| calldatasize | size of call data in bytes |
| calldatacopy(t, f, s) | copy s bytes from calldata at position f to memory at position t |
| codesize | size of the current contract / execution context |
| codecopy(t, f, s) | copy s bytes from code at position f to memory at position t |
| extcodesize(a) | size of the code at address a |
| extcodecopy(a, t, f, s) | codecopy(t, f, s) but use code at address a |
| returndatasize | size of the last returndata |
| returndatacopy(t, f, s) | copy s bytes from returndata at position f to memory at position t |
| extcodehash(a) | code hash of address a |
| origin | transaction sender |
| gasprice | the gas price of the transaction |
| blockhash(b) | hash of block number b (can only be used for the last 256 blocks excluding the current one) |
| coinbase | current miner |
| timestamp | the timestamp of the current block in seconds since epoch |
| number | the current block number |
| difficulty | the difficulty of the current block |
| gaslimit | the gas limit of the current block |

| Contract Interaction ||
|---|---|
| create(v, p, n) | create new contract with n bytes of code from position p. Send v wei. Return the new address |
| create2(v, p, n, s) | create(v, p, n) but the address is determined by the code, the current contract address and 256-bit value s |
| call(g, a, v, in, insize, out, outsize) | call contract at address a with input/output at memory locations in/out and size insize/outsize. Provide g gas. Send v wei. Return 1/0 for succes/failure |
| callcode(g, a, v, in, insize, out, outsize) | identical to `call` but stay in the context of the current contract (using the code from `a`) |
| delegatecall(g, a, in, insize, out, outsize) | identical to `delegatecall` but also keep `caller` and `callvalue` |
| staticcall(g, a, in, insize, out, outsize) | identical to call with v=0 but do not allow state modifications |
| return(p, s) | end execution, return s bytes of data at memory position p |
| revert(p, s) | identical to return but revert state changes |
| selfdestruct(a) | end execution, destroy current contract and send funds to a |
| invalid | end execution with invalid instruction |
| log0(p, s) | log without topics. Use s bytes from memory location p (for the logged data, I think ) |
| log1(p, s, t1) | identical to `log0` with topic t1 |
| log2(p, s, t1, t2) | identical to `log0` with topics t1 and t2 |
| log3(p, s, t1, t2, t3) | identical to `log0` with topics t1, t2 and t3 |
| log4(p, s, t1, t2, t3, t3) | identical to `log0` with topics t1, t2, t3 and t4 |

### Example

Here I will work through the tutorial at https://blog.trustlook.com/2019/01/07/understand-evm-bytecode-part-1/

#### Constructor

Consider the contract

```
pragma solidity 0.4.25;

contract Demo1 {
    uint public balance;

    function add(uint value) public returns (uint256) {
        balance = balance + value;
        return balance;
    }
}
```

This compiles to
> 608060405234801561001057600080fd5b5060fd8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631003e2d214604e578063b69ef8a814608c575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060b4565b6040518082815260200191505060405180910390f35b348015609757600080fd5b50609e60cb565b6040518082815260200191505060405180910390f35b600081600054016000819055506000549050919050565b600054815600a165627a7a72305820999b89b3628a98c6332d083eb49ec205ad06b31b4d44f4c8c55f2e06230cfbe9002

The first part is the (empty) constructor:
```
// mstore(0x40, 0x80)
// The memory address at 0x40 is the free memory pointer
// Setting it to 0x80 suggests that this is where the heap starts
00: 6080   PUSH1 0x80
02: 6040   PUSH1 0x40
04: 52     MSTORE

// The stack is currently empty
// Check if msg.value is zero
05: 34     CALLVALUE  // add msg.value to the stack
06: 80     DUP1       // duplicate msg.value
07: 15     ISZERO     // pop the msg.value and replace it with (msg.value == 0)

// The stack currently looks like: [ msg.value == 0, msg.value ]
// Jump to location 0x0010 if msg.value === 0
08: 61     PUSH2 0x0010
0B: 57     JUMPI

// If we arrive here, msg.value != 0
// The stack currently looks like: [ msg.value ]
// revert(0,0) = revert and return 0 bytes of data ( at location 0 )
// This check is introduced by the compiler for non payable functions
0C: 6000   PUSH1 0x00
0E: 80     DUP1
0F: FD     REVERT

// If we arrive here, msg.value == 0
// The stack currently looks like: [ msg.value ]
// Remove the top item - I don't know why we duplicated it in the first place
10: 5B     JUMPDEST
11: 50     POP

// codecopy(0x00, 0x001f, 0xc7) = Copy 0xc7 bytes from code at 0x1f to 0x00
12: 60C7   PUSH1 0xc7
14: 80     DUP1
15: 61001F PUSH2 0x001f
18: 60     PUSH1 0x00
1A: 39     CODECOPY

// The stack currently looks like [ 0xc7 ]
// return (0x00, 0xc7) = return the 0xc7 bytes at location 0x00
//                     = the code we copied. Everything after the constructor
1B: 60     PUSH1 0x00
1D: F3     RETURN
1E: 00     STOP
```

This snippet:
* ensures msg.value is empty (the constructor is non-payable)
* returns the code after the constructor
* seems to duplicate and then pop msg.value unnecessarily.
This is probably just a predefined pattern - keep the msg.value on the top of the stack until it is no longer needed.


Let's contrast this with an example with a constructor:
```
pragma solidity 0.4.25;

contract Demo2 {
    uint public balance;

    constructor (uint value) public {
        balance = value;
    }

    function add(uint value) public returns (uint256) {
        balance = balance + value;
        return balance;
    }
}
```

This compiles to the same bytecode with the extra steps (before the return sequence)
```
// mload(0x40) = push the free memory pointer onto the stack (in our case 0x80)
0012    60  PUSH1 0x40
0014    51  MLOAD

// the stack currently looks like: [ FMP:0x80 ]
// push 0x20 onto the stack and then
// codecopy(FMP, 0x00fa, 0x20) = copy the last 32 bytes of code (from 0x00fa) to the FMP
// this is the passed in parameter
0015    60  PUSH1 0x20
0017    80  DUP1
0018    61  PUSH2 0x00fa
001B    83  DUP4
001C    39  CODECOPY

// the stack currently looks like [ 0x20, FMP:0x80 ]
// mstore(0x40, add(FMP, 0x20)) = increment the FMP to beyond the copied code
// leave the address 0x80 (pointing to the passed in parameter) on the stack
001D    81  DUP2
001E    01  ADD
001F    60  PUSH1 0x40
0021    52  MSTORE

// sstore(0, mload(0x80)) = store the passed in parameter in storage slot 0
0022    51  MLOAD
0023    60  PUSH1 0x00
0025    55  SSTORE
```

This snippet:
* Copies the last 32-bytes of code to memory
* Since we know what the code does, we can conclude that this is where the parameter is stored
* Saves the parameter into storage slot 0 (ie the `balance` variable)

#### Runtime

Let's move on to the runtime bytecode.

```
// mstore(0x40, 0x80) = set the free memory pointer to 0x80
0000    60  PUSH1 0x80
0002    60  PUSH1 0x40
0004    52  MSTORE

// if (calldatasize < 0x04), go to 0x48
0005    60  PUSH1 0x04
0007    36  CALLDATASIZE
0008    10  LT
0009    60  PUSH1 0x48
000B    57  *JUMPI
.
.
.
// revert(0,0) (return 0 bytes at location 0)
0048    5B  JUMPDEST
0049    60  PUSH1 0x00
004B    80  DUP1
004C    FD  *REVERT
```

This snippet:
* sets the free memory pointer to 0x80
* reverts if there is less than 4 bytes of call data
* the first 4 bytes of data is the hash value for the function signature,
which is used to determine which function to call
* if the fallback function was implemented, we would call that instead of reverting

The  missing section in the above snippet is:
```
// (calldataload(0) / 1 << 224) & 0xffffff = put the first 4 bytes of calldata on the stack
// I'm not sure why you need the AND, unless they're worried about sign extension
0C: 63  PUSH4 0xffffffff
11: 7C  PUSH29 0x100000000000000000000000000000000000000000000000000000000
2F: 60  PUSH1 0x00
31: 35  CALLDATALOAD
32: 04  DIV
33: 16  AND

// if the first four bytes equals 0x1003e2d2, jump to 0x4d
// ( leaving the first 4 bytes of calldata on the stack )
34: 63  PUSH4 0x1003e2d2
39: 81  DUP2
3A: 14  EQ
3B: 60  PUSH1 0x4d
3D: 57  *JUMPI
// if the first four bytes equals 0xb69ef8a8, jump to 0x74
// ( leaving the first 4 bytes of calldata on the stack )
3E: 80  DUP1
3F: 63  PUSH4 0xb69ef8a8
44: 14  EQ
45: 60  PUSH1 0x74
47: 57  *JUMPI
```

So the code up to 0x4d is simply deciding which code to run:
* if `calldatasize` < 4 or none of the following match, go to the default (either fallback function or revert)
* if `calldata[:4] == HASH('add(uint256)')`, go to the `add` function
* if `calldata[:4] == HASH('balance()')`, go to the `balance` function

Let's look at the `add` function:
```
004D    5B  JUMPDEST

// if msg.value != 0, revert(0,0)
// [ add is not payable ]
004E    34  CALLVALUE
004F    80  DUP1
0050    15  ISZERO
0051    60  PUSH1 0x58
0053    57  *JUMPI
0054    60  PUSH1 0x00
0056    80  DUP1
0057    FD  *REVERT

0058    5B  JUMPDEST
// remove the function signature from the stack
0059    50  POP

// Set the stack to: [ calldata[4:36] = value, 0x62 ] and jump to 0x86
// note: address 0x62 is a return address
005A    60  PUSH1 0x62
005C    60  PUSH1 0x04
005E    35  CALLDATALOAD
005F    60  PUSH1 0x86
0061    56  *JUMP
.
.
.
0086    5B  JUMPDEST
// push 0 on the stack and then load the value at storage slot 0 ( the balance )
0087    60  PUSH1 0x00
0089    80  DUP1
008A    54  SLOAD

// currently the stack looks like [ balance, 0, value, 0x62 ]
// save balance + value to storage slot 0
// leave balance + value on top of the stack
// return to 0x62
008B    82  DUP3
008C    01  ADD
008D    90  SWAP1
008E    81  DUP2
008F    90  SWAP1
0090    55  SSTORE
0091    91  SWAP2
0092    90  SWAP1
0093    50  POP
0094    56  *JUMP
```

This snippet:
* reverts if any ETH is sent to the `add` function
* adds the first call parameter to the value at storage slot 0 (balance += value)
* returns to position 0x86

The missing section is:
```
0062    5B  JUMPDEST
// currently the stack looks like [ newBalance ]
// store newBalance at the original free memory pointer (0x80)
// return the contents of that pointer (without updating it)
0063    60  PUSH1 0x40
0065    80  DUP1
0066    51  MLOAD
0067    91  SWAP2
0068    82  DUP3
0069    52  MSTORE
006A    51  MLOAD
006B    90  SWAP1
006C    81  DUP2
006D    90  SWAP1
006E    03  SUB
006F    60  PUSH1 0x20
0071    01  ADD
0072    90  SWAP1
0073    F3  *RETURN
```

The `balance` function fill in the rest of the missing space inside the `add` function:
```
// if msg.value != 0, revert
// otherwise, add 0x62 (the return address) to the stack and go to 0x95
0074    5B  JUMPDEST
0075    34  CALLVALUE
0076    80  DUP1
0077    15  ISZERO
0078    60  PUSH1 0x7f
007A    57  *JUMPI
007D    80  DUP1
007E    FD  *REVERT
007F    5B  JUMPDEST
0080    50  POP
0081    60  PUSH1 0x62
0083    60  PUSH1 0x95
0085    56  *JUMP
.
.
.
// add the balance value to the top of the stack and return to 0x62
// ( recall this simply returns the value at the top of the stack )
0095    5B  JUMPDEST
0096    60  PUSH1 0x00
0098    54  SLOAD
0099    81  DUP2
009A    56  *JUMP
```

#### Storage packing

Consider the contract
```
pragma solidity 0.4.25;
contract Demo3 {

  uint128 public balance1;
  uint128 public balance2;
  uint256 public balance3;

  function add() public returns (uint256) {
        balance3 = balance1 + balance2;
        return balance3;
    }
}
```

The addition within the `add` function compiles to:
```
011E    60  PUSH1 0x00
0120    54  SLOAD
0121    6F  PUSH16 0xffffffffffffffffffffffffffffffff
0132    80  DUP1
0133    82  DUP3
0134    16  AND
0135    70  PUSH17 0x0100000000000000000000000000000000
0147    90  SWAP1
0148    92  SWAP3
0149    04  DIV
014A    81  DUP2
014B    16  AND
014C    91  SWAP2
014D    90  SWAP1
014E    91  SWAP2
014F    01  ADD
0150    16  AND
0151    60  PUSH1 0x01
0153    81  DUP2
0154    90  SWAP1
0155    55  SSTORE
```

Note that `balance1` and `balance2` are sharing the first storage slot,
and the EVM uses masking to select the top and bottom halves individually.

#### Struct

```
pragma solidity 0.4.25;
contract Data2 {
    struct Funder {
        address addr;
        uint256 amount;
    }
    Funder test;
    function deposit(address addr, uint256 amount) public returns (uint256) {
        test.addr = addr;
        test.amount = amount;
        return amount;
     }
}
```

The `deposit` code produces
```
sstore( 0x0, uint160( arg0 ) )
sstore( 0x1, arg1 )
```

In other words, `test.addr` uses the first storage slot and `test.amount` uses the second.
( but they will be packed if possible )

#### Mappings

```
pragma solidity ^0.4.25;
contract Bank {
    mapping(address => uint256) public balanceOf;   // balances, indexed by addresses
    function deposit(uint256 amount) public payable {
        require(msg.value == amount);

        balanceOf[msg.sender] += amount;     // adjust the account's balance
    }
}
```

The `balanceOf` code compiles to:
```
mstore( 0x0, msg.data( 0x04 ) & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF );
mstore( 0x20, 0x0 /* the storage slot of the mapping */);
temp0 = keccak256( 0x0, 0x40 );
return ( sload( temp0 ) );
```

In words:
* We set a memory location to the first parameter (cast to an address);
* We set the next memory location to 0 ( the storage slot of the mapping );
* temp0 = hash( address || storage location )
* use the hash as the storage location to return

Let's consider a 2-level mapping:

```
mapping(address => mapping(address => uint256)) public tokens;
```

Let `arg0` and `arg1` be the addresses. The `tokens` code compiles to:
```
mstore( 0x0, arg0 );
mstore( 0x20, 0x0 /* the storage slot of the outer mapping */ );
temp0 = keccak256( 0x0, 0x40 );
mstore ( 0x0, arg1 );
mstore ( 0x20, temp0 /* the storage slot of the inner mapping */ );
return ( sload( temp1 ) );
```

In words:
* Use the same technique as the 1D case to calculate the storage location of the inner mapping
* Use the same technique again to calculate the storage location of the uint256,
ensuring that the result of the first calculation is used in the second hash

As an aside, this is why the free memory pointer is saved at 0x40: the previous memory is used for hashing


#### Multiple storage variables

```
pragma solidity 0.4.25;
contract Data4 {
    struct Funder {
        uint256 last_deposit;
        uint256 amount;
    }
    mapping(address => Funder) public balanceOf;
}
```

Now `balanceOf` compiles to:
```
mstore( 0x0, arg0 );
mstore( 0x20, 0x0 );
temp0 = keccak256( 0x0, 0x40 );
return( sload ( temp0 ), sload( ( temp0 + 0x1 ) ) );
```

In words:
* we use the hash technique to decide where to store the struct
* the struct still uses contiguous memory.


#### Variable length array

```
pragma solidity 0.4.25;
contract Data4 {
    address[] public senders;
    function add() public {
        senders.push(msg.sender);
    }
}
```

Now `senders` compiles to:
```
assert( ( arg0 < sload( 0x0 /* the storage location */ ) ) )
mstore ( 0x0, 0x0 /* the storage location */ )
temp0 = keccak256( 0x0, 0x20 );
return( uint160 ( sload( ( temp0 + arg0 ) ) ) );
```

In words:
* the length of the array is stored at its storage location
* the contents of the array are found by hashing the storage location
* the contents of the array are stored in a contiguous block

#### Strings

```
pragma solidity 0.4.25;
contract Data6 {
    string public hello = "Hello World!";
}
```

```
// load the free memory pointer
temp0 = mload(0x40);


mstore(0x40,(temp0 + (0x20 + (((0x1F + ((((0x100 * ((0x1 & sload(0x0)) == 0)) - 0x1) & sload(0x0)) / 0x2)) / 0x20) * 0x20))));
mstore(temp0,((((0x100 * ((0x1 & sload(0x0)) == 0)) - 0x1) & sload(0x0)) / 0x2));
var5 = (0x20 + temp0);
var7 = ((((0x100 * ((0x1 & sload(0x0)) == 0)) - 0x1) & sload(0x0)) / 0x2);
if (var7)
{
    if ((0x1F < var7))
    {
        temp1 = (var5 + var7);
        var5 = temp1;
        mstore(0x0,0x0);
        temp2 = keccak256(0x0,0x20);
        var7 = var5;
        var6 = temp2;
label_00000148:
        mstore(var7,sload(var6));
        var6 = (0x1 + var6);
        var7 = (0x20 + var7);
        if ((var5 > var7))
        {
            goto label_00000148;
        }
        else
        {
            temp4 = (var5 + (0x1F & (var7 - var5)));
            var5 = temp4;
label_00000165:
            return;
        }
    }
    else
    {
        mstore(var5,((sload(0x0) / 0x100) * 0x100));
        goto label_00000165;
    }
}
```

In words:
* If the string is 31 bytes or smaller, it can fit in a storage slot.
   * set the last bit to 0
   * set the last byte to by the length of the string multiplied by 2
   * the string is saved in the first 31 bytes
* If the string is larger than 31 bytes:
   * set the last bit to 1
   * set the storage slot to the length of the string multiplied by 2
   * save the string in the same way as a variable length array
