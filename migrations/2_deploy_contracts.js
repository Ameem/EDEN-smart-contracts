const EdenToken = artifacts.require("./EdenToken.sol");
const CrowdsaleController = artifacts.require("./CrowdsaleController");

module.exports = async (deployer) => {
  await deployer.deploy(EdenToken);
  deployer.deploy(CrowdsaleController, EdenToken.address, 0x0);
};
