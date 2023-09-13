// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "hardhat/console.sol";

contract SensitiveData {

    bytes32 private secret;

    constructor(bytes32 _secret) {
        secret = _secret;
    }

    function deposit () payable external {
        require(msg.value > 0);
        
    }

    function withdraw(bytes32 _password) external {
        require(_password == secret,"Invalid Password");
        require(address(this).balance > 0, "Insufficient Balance");
        (bool success,) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer Failed");
    }

}