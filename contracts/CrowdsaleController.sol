pragma solidity ^0.4.0;
import './SmartTokenController.sol';
import './interfaces/ISmartToken.sol';


contract CrowdsaleController is SmartTokenController {
    string public name = "EDEN Crowdsale contract";
    address public beneficiary;
    uint numContributions;
    uint public etherRaised;

    event NewContribution(uint256 value, address from, bytes txData);

    modifier validateData {
        require(msg.data.length != 0);
        _;
    }

    function CrowdsaleController(ISmartToken _token, address _beneficiary)
        SmartTokenController(_token)
    {
        beneficiary = _beneficiary;
    }

    function setBeneficiary(address _beneficiary) public ownerOnly validAddress(_beneficiary) {
        beneficiary = _beneficiary;
    }

    function updateEtherRaisedCounter(uint _amount) public ownerOnly {
        etherRaised = _amount;
    }

    function issueTokens(address _to, uint256 _amount) active ownerOnly {

    }

    function calculateTokenReturn(uint256 _amount) active {

    }

    function ()
        payable
//        validateAmount
        validateData
    {
        handleContribution(msg.value, msg.sender, msg.data);
    }

    function handleContribution(uint256 _value, address _from, bytes _data) private {
        require(beneficiary.send(msg.value));

        NewContribution(_value, _from, _data);
    }

    function handleTokenIssuance(address _to, uint256 _amount) private active {
        token.issue(_to, _amount);
    }
}
