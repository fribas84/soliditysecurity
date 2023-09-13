const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vunerable Access Control", function () {
  async function deployVulnerableFixture() {
    const [owner, attacker] = await ethers.getSigners();

    const AccessControlVulnerable = await ethers.getContractFactory(
      "AccessControlVulnerable"
    );
    const accessControlVulnerable = await AccessControlVulnerable.deploy(200);

    return { accessControlVulnerable, owner, attacker };
  }

  async function deploySecureFixture() {
    const [owner, attacker, newOwner] = await ethers.getSigners();
    const AccessControlSecure = await ethers.getContractFactory(
      "AccessControlSecure"
    );
    const accessControlSecure = await AccessControlSecure.deploy(200);

    return { accessControlSecure, owner, attacker, newOwner };
  }

  describe("Vulnerable Contract", function () {
    it("Deploy should be ok and price should be equal to 200", async function () {
      const { accessControlVulnerable } = await loadFixture(
        deployVulnerableFixture
      );
      expect(await accessControlVulnerable.getPrice()).to.equal("200");
    });

    it("Attacker should be able to change the price", async function () {
      const { accessControlVulnerable, owner, attacker } = await loadFixture(
        deployVulnerableFixture
      );
      await accessControlVulnerable.connect(attacker).updatePrice(100);
      expect(await accessControlVulnerable.getPrice()).to.equal("100");
    });
  });

  describe("Secure Contract", function () {
    it("Deploy should be ok and price should be equal to 200", async function () {
      const { accessControlSecure } = await loadFixture(deploySecureFixture);
      expect(await accessControlSecure.getPrice()).to.equal("200");
    });
    it("Attacker can't change the price", async function () {
        const {accessControlSecure, attacker} = await loadFixture(deploySecureFixture);
        await expect(accessControlSecure.connect(attacker).updatePrice(100)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Owner can change the price", async function () {
        const {accessControlSecure} = await loadFixture(deploySecureFixture);
        await accessControlSecure.updatePrice(100);
        expect(await accessControlSecure.getPrice()).to.equal("100");
    });
    it("New owner can change the price", async function () {
        const {accessControlSecure, newOwner} = await loadFixture(deploySecureFixture);
        await accessControlSecure.transferOwnership(newOwner.address); 
        await accessControlSecure.connect(newOwner).updatePrice(100);
        expect(await accessControlSecure.getPrice()).to.equal("100");
    });
    it("Attacker can't change the owner", async function () {
        const {accessControlSecure, attacker, newOwner} = await loadFixture(deploySecureFixture);
        await expect(accessControlSecure.connect(attacker).transferOwnership(newOwner.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
