pragma solidity ^0.4.11;
import './SmartToken.sol';

contract EdenToken is SmartToken {
    function EdenToken() SmartToken("EDEN Token", "EDN", 18) {
    }
}
