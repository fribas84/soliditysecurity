# Solidity Essential Security 
Simple and essentials Solidity security projects
## Access Control
Vulnerable contract that anyone can modify a state variable, to fix it, it uses Open Zeppelin Ownable contract

To run test:
`npx hardhat test test/AccessControl.js`

## Reading Sensitive Private Data
Reading private variables from the SC memory
To run test:
`npx hardhat test test/SensitiveData.js`

## Reentrancy Attack
Attacker contract performs a reentrancy attack into a vulnerable contract not implementing `Checks - Effects - Interaction` Pattern.
To run test:
`npx hardhat test test/Reentrancy.js`
## Versions
- Hardhat: 2.17.3
- Ethers: 6.7.1