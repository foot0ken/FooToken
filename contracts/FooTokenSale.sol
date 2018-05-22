pragma solidity ^0.4.23;

import { AddressCollection } from "./libraries/Collection.sol";
import "./FooToken.sol";
import "./Ownable.sol";

contract FooTokenSale is Ownable {
    FooToken public token;
    address public wallet;

    using AddressCollection for AddressCollection.Index;
    AddressCollection.Index internal addressCollectionIndex;
    
    // WhiteList
    struct EntityStruct { bool isAllow; }
    EntityStruct[] internal whiteList;
    
    // loopの是非
    // http://solidity.readthedocs.io/en/develop/security-considerations.html#gas-limit-and-loops
    constructor(FooToken _token, address _wallet, address[] addresses)
        Ownable(msg.sender)
        public
    {
        token = _token;
        wallet = _wallet;

        addWhiteList(addresses);
    }

    function isAllow(address _address) view public returns (bool) {
        bool exists;
        uint256 index;

        (exists, index) = addressCollectionIndex.get(_address);
        if (exists) {
            return whiteList[index].isAllow;
        }

        return false;
    }

    function getWhiteList() public view returns (address[]) {
        return addressCollectionIndex.keys();
    }

    function addWhiteList(address[] addresses) isOwner public returns (bool) {
        for (uint i = 0; i < addresses.length; i++) {
            address _address = addresses[i];

            bool exists;
            uint256 index;
            (exists, index) = addressCollectionIndex.get(_address);
            if (! exists) {
                uint newIndex = whiteList.push(EntityStruct({isAllow: true}));
                addressCollectionIndex.set(_address, newIndex - 1);
            }
        }

        return true;
    }

    function purchaseToken(address beneficiary) payable public {
        require(beneficiary != address(0));

        bool exists;
        uint256 index;
        (exists, index) = addressCollectionIndex.get(beneficiary);
        require(exists && whiteList[index].isAllow);
        
        // wei (1 ether = 1000000000000000000 wei)
        uint256 weiAmount = msg.value;

        uint256 tokens = calc(weiAmount);

        token.mint(beneficiary, tokens);
        
        forwardFunds();
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    // 1 ether => 1000 tokens
    function calc(uint256 weiAmount) internal pure returns (uint256) {
        return weiAmount / 1000000000000000;
    }
}
