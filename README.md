[![license](https://img.shields.io/github/license/jamesisaac/react-native-background-task.svg)](https://opensource.org/licenses/MIT)

### Luniverse Gluwacoin

Gluwacoin for [Luniverse](https://luniverse.io/)

Read [Controlled Gluwacoin](Luniverse%20Gluwacoin.md) for details.

### ERC-20 Wrapper Gluwacoin

Gluwacoin backed by another [ERC-20](https://eips.ethereum.org/EIPS/eip-20) token

Read [ERC-20 Wrapper Gluwacoin](ERC-20%20Wrapper%20Gluwacoin.md) for details.

## Setup

### Installing Dependencies

```commandline
$ npm install
```

#### Installing OpenZeppelin
```commandline
$ npm install @openzeppelin/cli
```

#### Initializing the openzeppelin project
```commandline
$ npx oz init
```

#### Linking the Contracts Ethereum Package

You need this for local testing. We will use a preset of ERC20 to use as a base token for the ERC-20 Wrapper Gluwacoin.

```commandline
$ npx oz link @openzeppelin/contracts-ethereum-package
```

#### Run a local testnet

Let’s deploy an ERC20 token contract to our development network.
Make sure to have a Ganache instance running, or start one by running:
```commandline
$ npx ganache-cli --deterministic
```
Note that the current version of Ganache does not work on `Node 14`.
We are using `Node 12`.
https://github.com/trufflesuite/ganache-cli/issues/732