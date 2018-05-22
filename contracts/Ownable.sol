pragma solidity ^0.4.23;

contract Ownable {
    address public owner;

    constructor (address _address) public {
        owner = _address;
    }

    modifier isOwner {
        require(owner == msg.sender);
        _;
    }

    function transferOwnership(address _address) public returns (bool) {
        require(_address != address(0));

        owner = _address;
        return true;
    }
}
