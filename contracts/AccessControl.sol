// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AccessControlVulnerable {
    uint256 private price;

    constructor(uint256 _price) {
        price = _price;
    }

   function getPrice() external view returns (uint256) {
        return price;
        }
    function updatePrice(uint256 _price) external {
        price = _price;
    }
}

contract AccessControlSecure is Ownable {

    uint256 private price;

    constructor(uint256 _price) {
        price = _price;
    }

   function getPrice() external view returns (uint256) {
        return price;
        }
    function updatePrice(uint256 _price) external onlyOwner {
        price = _price;
    }
    
}
