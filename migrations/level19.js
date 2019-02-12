const level19 = async (web3, MagicNum) => {
    const targetAddress = '0x0c82814701b6f30c394ec2cf352d0e2437a23b9e';
    console.log(`Exploiting Level19 target ${targetAddress}...`);

    console.log('Retrieving target contract...');
    const target = await MagicNum.at(targetAddress);

    // This was derived in MagicNumber.md
    // Note that only the last 10 bytes are the solver code. Everything else is the (unnecessarily bloated) constructor
    const solverByteCode = '0x6080604052348015600f57600080fd5b50600a806100206000396000f3000000602a60005260206000f3';

    console.log('Retrieving current address...');
    const player = (await web3.eth.getAccounts())[0];

    console.log('Deploying the Solver contract...');
    const receipt = await web3.eth.sendTransaction({from: player, to: 0, data: solverByteCode});
    const solverAddress = receipt.contractAddress;

    console.log('Submitting solver...');
    await target.setSolver(solverAddress);
};

module.exports = level19;