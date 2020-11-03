## Preamble

    Title: Sidechain Gluwacoin Standard
    Author: Tae Lim Oh <taelim.oh@gluwa.com>
    Type: Standard
    Created: 2020-10-19


## Simple Summary

A standard interface for 2-way pegged [Gluwacoin](https://gluwacoin.com) deployed on a sidechain.


## Abstract

The following standard allows the implementation of a standard API for Gluwacoin with two gatekeepers: Gluwa and Luniverse.
A user on the Ethereum network can peg his or her Gluwacoin to a gateway contract.
Gatekeepers verify if Gluwacoin is pegged on the Ethereum network.
If both Gatekeepers approves the peg, Gluwa can mint the Gluwacoin to the user on Luniverse.
The user can burn his or her balance when wants to return to the Ethereum network.
The user will submit the transaction ID of the burn to the gateway contract on the Ethereum network.
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

#### Sidechain Gluwacoin Specific Methods

##### peg

Creates a peg object in `sender` address. 
The amount of the peg is `amount` and each peg has `txnHash`  which is unique.
A peg represents a Gluwacoin deposit to the Luniverse Gluwacoin Gateway contract.

``` solidity
function peg(bytes32 txnHash, uint256 amount, address sender)
```

##### gluwaApprove

Approves a peg object in `sender` address.
The peg is specified by `txnHash`.
Reserved for the `Gluwa` role.

``` solidity
function gluwaApprove(bytes32 txnHash)
```

##### luniverseApprove

Approves a peg object in `sender` address.
The peg is specified by `txnHash`.
Reserved for the `Luniverse` role.

``` solidity
function luniverseApprove(bytes32 txnHash)
```

##### mint

Creates `amount` tokens to the `sender` of the `peg` specified by `txnHash`.

**Note** 
- the `peg` must be Gluwa Approved and Luniverse Approved.
- the caller must have a `Gluwa` role or `Luniverse` role.

``` solidity
function mint(bytes32 txnHash)
```

##### isGluwa

Returns if the `account` has Gluwa role or not.

``` solidity
function isGluwa(address account)
```

##### addGluwa

Assign Gluwa role to the `account`.

**Note** 
- the caller must have a `Gluwa` role.

``` solidity
function addGluwa(address account)
```

##### removeGluwa

Remove Gluwa role from the `account`.

**Note** 
- the caller must have a `Gluwa` role.

``` solidity
function removeGluwa(address account)
```

##### renounceGluwa

The caller renounces Gluwa role.

**Note** 
- the caller must have a `Gluwa` role.

``` solidity
function renounceGluwa()
```

##### isLuniverse

Returns if the `account` has Luniverse role or not.

``` solidity
function isLuniverse(address account)
```

##### addLuniverse

Assign Luniverse role to the `account`.

**Note** 
- the caller must have a `Luniverse` role.

``` solidity
function addLuniverse(address account)
```

##### removeLuniverse

Remove Luniverse role from the `account`.

**Note** 
- the caller must have a `Luniverse` role.

``` solidity
function removeLuniverse(address account)
```

##### renounceLuniverse

The caller renounces Luniverse role.

**Note** 
- the caller must have a `Luniverse` role.

``` solidity
function renounceLuniverse()
```



Refer to [Gluwacoin](https://docs.gluwacoin.com/gluwacoin-token-standard) for general Gluwacoin methods and events.

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).