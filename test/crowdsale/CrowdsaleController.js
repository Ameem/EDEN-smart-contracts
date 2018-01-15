const web3 = require("web3");
const EdenToken = artifacts.require("./EdenToken.sol");
const CrowdsaleController = artifacts.require("./CrowdsaleController.sol");
const helpers = require("../testHelpers");

contract('CrowdsaleController', (accounts) => {
  it("fallback must validate amount, data", async () => {
    const invalidEthValue = 72858683297876; // ~ 0.1$
    const validEthValue = 7285868329787546; // ~ 10$
    const tokenInstance = await EdenToken.new();
    const controller = await CrowdsaleController.new(tokenInstance.address, accounts[0]);
    await controller.setBeneficiary(accounts[0]);

    // Invalid amount
    try {
      await controller.sendTransaction({ value: invalidEthValue, from: accounts[1], data: web3.utils.stringToHex('test-string') });
    } catch (error) {
      helpers.assertException(error);
    }

    // Invalid data
    try {
      await controller.sendTransaction({ value: validEthValue, from: accounts[1], data: null });
    } catch (error) {
      helpers.assertException(error);
    }

    // All params are valid
    const data = await controller.sendTransaction({ value: validEthValue, from: accounts[1], data: web3.utils.stringToHex('test-string') });
    const contributionEvent = data.logs[0];
    assert.equal(contributionEvent.event, 'NewContribution')
  });
});
