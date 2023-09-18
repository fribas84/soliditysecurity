require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
  solidity: "0.8.18",
  gasReporter: {
    enabled: true,
  },
  mocha:{
    timeout: 20000000,
  },
  networks:{
    hardhat:{
      blockGasLimit: 20000000,
    }
  }
};
