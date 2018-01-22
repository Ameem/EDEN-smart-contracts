pragma solidity ^0.4.16;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./SmartTokenController.sol";
import "./interfaces/ISmartToken.sol";

contract CrowdsaleController is SmartTokenController {
    using SafeMath for uint;

    string public name = "EDEN Crowdsale contract";

    address public beneficiary = 0x0;

    uint public startedAt = 0;

    uint public etherRaised = 0;

    uint public ednToUsd = 100;

    uint public ethToUsdRate = 0;

    bool public crowdsaleStarted = false;

    mapping (address => uint) public supplied;

    event NewContribution(uint256 ethContributed, uint256 tokenReturn, address from, bytes txData);

    modifier validateAmount {
        require(msg.value >= ((1 ether) / (ethToUsdRate / 100)));
        _;
    }

    modifier validateData {
        require(msg.data.length != 0);
        _;
    }

    modifier activeStateOnly {
        require(crowdsaleStarted == true);
        _;
    }

    function CrowdsaleController(ISmartToken _token, address _beneficiary)
        SmartTokenController(_token)
    {
        beneficiary = _beneficiary;
    }

    function calculateTokenReturn(uint256 _amount) public constant returns (uint) {
        uint initialAmount = _amount.mul(ethToUsdRate).div(ednToUsd);
        // uint bonusNumerator = calculateCurrentBonusNumerator();
        uint bonusNumerator = 100;

        if (bonusNumerator == 100) {
            return initialAmount;
        }

        uint bonusAmount = initialAmount.mul(bonusNumerator).div(100);
        return initialAmount.add(bonusAmount);
    }

    function ()
        payable
        activeStateOnly
        validateAmount
        validateData
    {
        handleContribution(msg.value, msg.sender, msg.data);
    }

    function handleContribution(uint256 _value, address _from, bytes _data) private {
        require(beneficiary.send(_value));

        uint tokenAmount = calculateTokenReturn(_value);
        supplied[_from] = supplied[_from].add(tokenAmount);
        NewContribution(_value, tokenAmount, _from, _data);
    }

    function issueTokens(address _to, uint256 _amount) active ownerOnly {
        handleTokenIssuance(_to, _amount);
    }

    function handleTokenIssuance(address _to, uint256 _amount) private active ownerOnly {
        token.issue(_to, _amount);
    }

    function setBeneficiary(address _beneficiary) public ownerOnly validAddress(_beneficiary) {
        beneficiary = _beneficiary;
    }

    function updateEtherRaisedCounter(uint _amount) public ownerOnly {
        etherRaised = _amount;
    }

    function updateEthToUsdRate(uint _newEthToUsdRate) public ownerOnly {
        ethToUsdRate = _newEthToUsdRate;
    }

    function setActiveState() public ownerOnly {
        startedAt = now;
        crowdsaleStarted = true;
    }

    function setStoppedState() public ownerOnly {
        crowdsaleStarted = false;
    }

    function calculateCurrentBonusNumerator() 
        public 
        activeStateOnly
        returns (uint) 
    {
        uint bonus = 100;

        if (now < startedAt + 1 days) {
            bonus = 15;
        } else if (now >= startedAt + 1 days && now <= startedAt + 2 days) {
            bonus = 14;
        } else if (now >= startedAt + 2 days && now <= startedAt + 3 days) {
            bonus = 13;
        } else if (now >= startedAt + 3 days && now <= startedAt + 4 days) {
            bonus = 12;
        } else if (now >= startedAt + 4 days && now <= startedAt + 5 days) {
            bonus = 11;
        } else if (now >= startedAt + 5 days && now <= startedAt + 6 days) {
            bonus = 10;
        } else if (now >= startedAt + 6 days && now <= startedAt + 7 days) {
            bonus = 9;
        } else if (now >= startedAt + 7 days && now <= startedAt + 8 days) {
            bonus = 8;
        } else if (now >= startedAt + 8 days && now <= startedAt + 9 days) {
            bonus = 7;
        } else if (now >= startedAt + 9 days && now <= startedAt + 10 days) {
            bonus = 6;
        } else if (now >= startedAt + 10 days && now <= startedAt + 11 days) {
            bonus = 5;
        } else if (now >= startedAt + 11 days && now <= startedAt + 12 days) {
            bonus = 4;
        } else if (now >= startedAt + 12 days && now <= startedAt + 13 days) {
            bonus = 3;
        } else if (now >= startedAt + 13 days && now <= startedAt + 14 days) {
            bonus = 2;
        } else if (now >= startedAt + 14 days && now <= startedAt + 15 days) {
            bonus = 1;
        }

        return bonus;
    }
}
