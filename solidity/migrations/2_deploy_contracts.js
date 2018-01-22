const SafeMath = artifacts.require('./SafeMath.sol');
const EdenToken = artifacts.require("./EdenToken.sol");
const CrowdsaleController = artifacts.require("./CrowdsaleController");

module.exports = async (deployer) => {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, CrowdsaleController);

  await deployer.deploy(EdenToken);
  deployer.deploy(CrowdsaleController, EdenToken.address, 0x0);
};
