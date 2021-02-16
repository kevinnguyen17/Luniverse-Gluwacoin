## Preamble

    Title: Sidechain Controlled Gluwacoin Standard
    Author: Tae Lim Oh <taelim.oh@gluwa.com>
    Type: Standard
    Created: 2021-02-17


## Simple Summary

A standard interface for controlled [Gluwacoin](https://gluwacoin.com) deployed on a sidechain.


## Abstract

The following standard allows the implementation of a standard API for Gluwacoin with a currency board.
A user on the Ethereum network can transfer his or her Gluwacoin to the currency board to transfer it to the sidechain.
The currency board burns the Gluwacoin on the Ethereum network and mint the equivalent amount to the user on Luniverse.
The user can burn his or her balance when wants to return to the Ethereum network.
The user will submit the transaction ID of the burn to the currency board on the Ethereum network.
This standard is Gluwacoin compatible, and, thus, ERC-20 compliant.


## Motivation

A standard interface to add any sidechain to the Gluwa ecosystem.

Gluwacoin Standard has extended on ERC-20 to enhance usability.
ETHless transfer freed users from buying Ether before they can start using a dapp.
Non-custodial exchange functions allow users to make exchange without giving up custody of their fund 
and access a pool of orders instead of taking a whole order at a time.
Again, without buying Ether.
Also, [Gluwa](https://gluwa.com) provides a suite of web services to ease on-boarding,
including [REST API](https://docs.gluwa.com/api/api), 
mobile apps ([iOS](https://apps.apple.com/app/gluwa/id1021292326), [Android](https://play.google.com/store/apps/details?id=com.gluwa.android)), 
and [dashboard](https://dashboard.gluwa.com/).


## Specification

## Token
### Methods

**NOTE**: Callers MUST handle `false` from `returns (bool success)`.
Callers MUST NOT assume that `false` is never returned!

#### Sidechain Controlled Gluwacoin Specific Methods

##### mint

Creates `amount` tokens to the `sender`.

**Note** 
- the caller must have a `Controller` role.

``` solidity
function mint(bytes32 txnHash)
```

##### isController

Returns if the `account` has the Controller role or not.

``` solidity
function isController(address account)
```

##### addController

Assign Controller role to the `account`.

**Note** 
- the caller must have a `Controller` role.

``` solidity
function addController(address account)
```

##### removeController

Remove Controller role from the `account`.

**Note** 
- the caller must have a `Controller` role.

``` solidity
function removeController(address account)
```

##### renounceController

The caller renounces Controller role.

**Note** 
- the caller must have a `Controller` role.

``` solidity
function renounceController()
```



Refer to [Gluwacoin](https://docs.gluwacoin.com/gluwacoin-token-standard) for general Gluwacoin methods and events.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).