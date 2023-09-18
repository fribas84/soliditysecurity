const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial of Service", function () {
  async function deployFixture() {
    const [owner, user, attacker] = await ethers.getSigners();
    const AuctionVulnerable = await ethers.getContractFactory(
      "AuctionVulnerable"
    );
    const auctionVulnerable = await AuctionVulnerable.deploy();
    return { auctionVulnerable, owner, user, attacker };
  }
  it("Deploy should be ok, and owner should be able to bid and be the currentLeader", async function () { 
    const { auctionVulnerable, owner } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(auctionVulnerable.target)).to.equal(0);
    await auctionVulnerable.bid({ value: ethers.parseEther("5000") });
    const ownerBalance = await ethers.provider.getBalance(owner.address);
    expect(await ethers.provider.getBalance(auctionVulnerable.target)).to.equal(ethers.parseEther("5000"));
    expect(await auctionVulnerable.currentLeader()).to.equal(owner.address);
  });
  it("A user can bid, then the owner can bid higher, cann refund all", async function () {
    const { auctionVulnerable, owner, user } = await loadFixture(deployFixture);
    expect(await ethers.provider.getBalance(auctionVulnerable.target)).to.equal(0);
    await auctionVulnerable.connect(user).bid({ value: ethers.parseEther("2000") });
    const userBalance = await ethers.provider.getBalance(user.address);
    expect(await ethers.provider.getBalance(auctionVulnerable.target)).to.equal(ethers.parseEther("2000"));
    expect(await auctionVulnerable.currentLeader()).to.equal(user.address);
    await auctionVulnerable.bid({ value: ethers.parseEther("5000") });
    expect(await auctionVulnerable.currentLeader()).to.equal(owner.address);
    await auctionVulnerable.refundAll();
    expect (await ethers.provider.getBalance(user.address)).to.be.greaterThan(userBalance);
  });
  it("Should revert if computation plugin hits block gas limit", async function () {
    const {auctionVulnerable,attacker} = await loadFixture(deployFixture);
    for(let i=0;i<1500;i++){
        await auctionVulnerable.connect(attacker).bid({value: 200 + i});
    }
    await auctionVulnerable.refundAll();
  });
});
