const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", function () {
  async function deployFixture() {
    const [owner, user, attacker] = await ethers.getSigners();
    const ReentrancyVulnerable = await ethers.getContractFactory(
      "ReentrancyVulnerable"
    );
    const reentrancyVulnerable = await ReentrancyVulnerable.deploy();
    
    const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker",attacker);
    const reentrancyAttacker = await ReentrancyAttacker.deploy(reentrancyVulnerable.target);

    return { reentrancyVulnerable, reentrancyAttacker,owner, user, attacker };
  }

  it("Deploy should be, and owner should be able to deposit and withdraw", async function () { 
    const { reentrancyVulnerable, owner, } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(0);
    await reentrancyVulnerable.deposit({ value: ethers.parseEther("5000") });
    const ownerBalance = await ethers.provider.getBalance(owner.address);
    expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(ethers.parseEther("5000"));
    await reentrancyVulnerable.withdraw();
    expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(0);
    expect(ownerBalance).be.lessThan(await ethers.provider.getBalance(owner.address));
  });
  it("Another user cannot widthdraw funds when it has nothing to withdraw", async function () {
  
    const { reentrancyVulnerable, user } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(0);
    await reentrancyVulnerable.deposit({ value: ethers.parseEther("5000") });
    expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(ethers.parseEther("5000"));
    await expect(reentrancyVulnerable.connect(user).withdraw()).to.revertedWith("Nothing to Withdraw");
  });

    it("Attacker is able to withdraw more than it has deposited", async function () {
        const {reentrancyVulnerable, reentrancyAttacker, attacker} = await loadFixture(deployFixture);
        expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(0);
        await reentrancyVulnerable.deposit({ value: ethers.parseEther("5000") });
        expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(ethers.parseEther("5000"));
        const reentrancyAttackerBalance = await ethers.provider.getBalance(attacker.address);
        await reentrancyAttacker.attack({value: ethers.parseEther("1000")});
        expect(await ethers.provider.getBalance(reentrancyVulnerable.target)).to.equal(0);
        expect(reentrancyAttackerBalance).be.lessThan(await ethers.provider.getBalance(attacker.address));

    });
});
