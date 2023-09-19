# Solidity Essential Security 
Simple Solidity sercurity vulnerabilites to present at [Universidad Nacional de Cuyo - Cryptoeconomics course](https://fce.uncuyo.edu.ar/cursos/item/diplomado-en-criptoeconomia)

Install all dependencies with `npm install`
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

## Weak Randomness
Contract with a weak random generator, that is easy to guess
To run test:
`npx hardhat test test/WeakRandomness.js`
### Miner / Validator Attack
a Miner / Validator can manipulate the EVM Timestamp to guess the number
## Versions
- Hardhat: 2.17.3
- Ethers: 6.7.1