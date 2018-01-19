const web3 = require("web3");
const EdenToken = artifacts.require("./EdenToken.sol");
const CrowdsaleController = artifacts.require("./CrowdsaleController.sol");
const helpers = require("../testHelpers");

contract('CrowdsaleController', (accounts) => {
  beforeEach(async () => {
    this.invalidEthValue = 91411020512633; // ~ 0.1$
    this.validEthValue = 9141102051263300; // ~ 10$
    this.txData = web3.utils.stringToHex('test-data-id');

    this.tokenInstance = await EdenToken.new();
    this.crowdsalseController = await CrowdsaleController.new(this.tokenInstance.address, accounts[0]);
  });

  it("contract constants valid after deploy", async () => {
    assert.equal((await this.crowdsalseController.etherRaised()).valueOf(), 0);
    assert.equal((await this.crowdsalseController.ednToUsd()).valueOf(), 100);
    assert.equal((await this.crowdsalseController.ethToUsdRate()).valueOf(), 0);
    assert.equal((await this.crowdsalseController.beneficiary()).valueOf(), accounts[0]);
    assert.equal((await this.crowdsalseController.owner()).valueOf(), accounts[0]);
  });

  /* Admin methods */
  /* Beneficiary management */
  it("not allow to call setBeneficiary by not owner", async () => {
    try {
      await this.crowdsalseController.setBeneficiary(accounts[1], { from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("not allow to call setBeneficiary with not valid address", async () => {
    try {
      await this.crowdsalseController.setBeneficiary(0x0);
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("not allow to call setBeneficiary by not owner", async () => {
    try {
      await this.crowdsalseController.setBeneficiary(accounts[1], { from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });


  /* ETH Raised management */
  it("not allow to call updateEtherRaisedCounter by not owner", async () => {
    try {
      await this.crowdsalseController.updateEtherRaisedCounter(100, { from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("allow to call updateEtherRaisedCounter by owner", async () => {
    await this.crowdsalseController.updateEtherRaisedCounter(100);
    assert.equal((await this.crowdsalseController.etherRaised()).valueOf(), 100)
  });

  /* ETH-USD Rate management */
  it("not allow to call updateEthToUsdRate by not owner", async () => {
    try {
      await this.crowdsalseController.updateEthToUsdRate(100, { from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("allow to call updateEthToUsdRate by owner", async () => {
    await this.crowdsalseController.updateEthToUsdRate(100);
    assert.equal((await this.crowdsalseController.ethToUsdRate()).valueOf(), 100)
  });

  /* Crowdsale State Management */

  it("not allow to call setActiveState by not owner", async () => {
    try {
      await this.crowdsalseController.setActiveState({ from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("not allow to call setStoppedState by not owner", async () => {
    try {
      await this.crowdsalseController.setStoppedState({ from: accounts[1] });
    } catch (error) {
      return helpers.assertException(error);
    }
    assert.fail('should have thrown before');
  });

  it("allow to call setActiveState and setStoppedState by owner", async () => {
    await this.crowdsalseController.setActiveState();
    assert.equal((await this.crowdsalseController.crowdsaleStarted()).valueOf(), true);

    await this.crowdsalseController.setStoppedState();
    assert.equal((await this.crowdsalseController.crowdsaleStarted()).valueOf(), false);
  });


  /* Fallback Function */
  it("fallback must validate amount, data and state", async () => {
    await this.crowdsalseController.setBeneficiary(accounts[0]);
    await this.crowdsalseController.updateEthToUsdRate(109396);

    // Invalid State
    try {
      await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[1], data: this.txData });
    } catch (error) {
      helpers.assertException(error);
    }

    await this.crowdsalseController.setActiveState();

    // Invalid amount
    try {
      await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[1], data: this.txData });
    } catch (error) {
      return helpers.assertException(error);
    }

    // Invalid data
    try {
      await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[1], data: null });
    } catch (error) {
      return helpers.assertException(error);
    }

    // All params are valid
    const data = await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[1], data: this.txData });
    const contributionEvent = data.logs[0];
    assert.equal(contributionEvent.event, 'NewContribution');

    const tokenBalance = await this.crowdsalseController.supplied(accounts[1]);
    assert.equal(tokenBalance.toNumber(), 11500000000000000000); // ~ 10 + (10 * 0.15); 15% bonus in first day
  });

  it("updates supplied after multiple donations", async () => {
    let tokenBalance;

    await this.crowdsalseController.setBeneficiary(accounts[0]);
    await this.crowdsalseController.updateEthToUsdRate(109396);
    await this.crowdsalseController.setActiveState();

    await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[2], data: this.txData });
    tokenBalance = await this.crowdsalseController.supplied(accounts[2]);

    await this.crowdsalseController.sendTransaction({ value: this.validEthValue, from: accounts[2], data: this.txData });
    assert.equal((await this.crowdsalseController.supplied(accounts[2])).toNumber(), tokenBalance * 2);
  });
});
