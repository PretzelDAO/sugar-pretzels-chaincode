// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = require('@nomiclabs/hardhat-ethers')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');


  // We get the contract to deploy
  const SugarPretzel = await hre.ethers.getContractFactory("SugarPretzels");

  // SET TRUSTED FORWARDING CONTRACT HERE
  const sugarPretzel = await SugarPretzel.deploy('0x83A54884bE4657706785D7309cf46B58FE5f6e8a');

  await sugarPretzel.deployed();

  console.log("sugarPretzel deployed to:", sugarPretzel.address);
  const addr = sugarPretzel.address

  // first deploy paymaster contract
  const NaivePaymaster = await hre.ethers.getContractFactory("NaivePaymaster");
  const naivePaymaster = await NaivePaymaster.deploy(addr);
  console.log("naivePaymaster deployed to:", naivePaymaster.address);


  const accounts = await hre.ethers.getSigners();
  const amountInEther = '0.02';




  //  SET RELAY HUB HERE
  let txObj = await naivePaymaster.setRelayHub('0x6650d69225CA31049DB7Bd210aE4671c0B1ca132')
  console.log('txHash set relayHub', txObj.hash)



  // Create a transaction object
  let tx = {
    to: naivePaymaster.address,
    // Convert currency unit from ether to wei
    value: hre.ethers.utils.parseEther(amountInEther),
    gasLimit: hre.ethers.utils.hexlify(300000), // 100000
    // gasPrice: hre.ethers.utils.parseUnits('2', 'gwei')
  }


  txObj = await accounts[0].sendTransaction(tx)
  console.log('txHash fund paymaster / relayhub', txObj.hash)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
