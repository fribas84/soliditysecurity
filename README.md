# Solidity Essenncial Security
Simple Solidity security projects
## Access Control
Vulnerable contract that anyone can modify a state variable, to fix it, it uses Open Zeppelin Ownable contract

To run test:
`npx hardhat test test/AccessControl.js`

## Sensitive Data
Reading private variables from the SC memory
To run test:
`npx hardhat test test/SensitiveData.js`