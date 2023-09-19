// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract WeakRandomnessBet is Ownable {
    using Address for address payable;

    uint8 public winningNumber;
    mapping(address => uint8) public bets;
    bool public betsOpen;
    bool public prizeClaimed;

    constructor() {
        betsOpen = true;
    }

    function placeBet(uint8 number) external payable {
        require(betsOpen, "Bets are closed");
        require(msg.value == 1 ether, "Bet must be 1 ether");
        require(
            number >= 1 && number <= 10,
            "Number must be between 1 and 10"
        );
        require(bets[msg.sender] == 0, "You already placed a bet");

        bets[msg.sender] = number;
    }

    function closeBets() external onlyOwner {
        betsOpen = false;
        winningNumber = getRandomNumber();
    }

    function getRandomNumber() public view returns (uint8) {
        console.log("timestamp in contract:", block.timestamp);
        return uint8(uint256(block.timestamp) % 10) + 1;
    }

    function withdraw() external {
        require(!prizeClaimed, "Prize already claimed");
        require(bets[msg.sender] == winningNumber, "You didn't win");

        prizeClaimed = true;
        payable(msg.sender).sendValue(address(this).balance);
    }
}
