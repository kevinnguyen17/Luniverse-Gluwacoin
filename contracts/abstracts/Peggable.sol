// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/Context.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

import "../roles/GluwaRole.sol";
import "../roles/LuniverseRole.sol";

/**
 * @dev Extension of {ERC20} that allows users to 2-way peg tokens from a sidechain of Luniverse, the Ethereum.
 * When the fund is sent to a gateway contract on Ethereum, either Gluwa or Luniverse can add a `peg`.
 * The `peg` has to get approved by both Gluwa and Luniverse before getting processed
 * --minting Gluwacoins corresponding to the peg.
 * Also, only Gluwa or Luniverse can process approved pegs.
 * You cannot process a peg more than once.
 */
abstract contract Peggable is Initializable, ERC20, GluwaRole, LuniverseRole {
    using Address for address;

    struct Peg {
        uint256 _amount;
        address _sender;
        bool _gluwaApproved;
        bool _luniverseApproved;
        bool _processed;
    }

    // string mapping to Peg.
    mapping (string => Peg) private _pegged;

    function initialize() public initializer {}

    function getPeg(string txnHash) public view returns (uint256 amount, address sender, bool gluwaApproved,
        bool luniverseApproved, bool processed) {
        Peg memory peg = _pegged[txnHash];

        amount = peg._amount;
        sender = peg._sender;
        gluwaApproved = peg._gluwaApproved;
        luniverseApproved = peg._luniverseApproved;
        processed = peg._processed;
    }

    function peg(string txnHash, uint256 amount, address sender) public {
        require(!_pegged[txnHash], "Peggable: the txnHash is already pegged");
        require(isGluwa(_msgSender()) || isLuniverse(_msgSender()),
            "Peggable: caller does not have the Gluwa role or the Luniverse role");

        _pegged[txnHash] = Peg(amount, sender, false, false, false);
    }

    function gluwaApprove(string txnHash) public {
        require(isGluwa(_msgSender()), "Peggable: caller does not have the Gluwa role");
        require(!_pegged[txnHash]._gluwaApproved, "Peggable: the txnHash is already Gluwa Approved");

        _pegged[txnHash]._gluwaApproved = true;
    }

    function luniverseApprove(string txnHash) public {
        require(isLuniverse(_msgSender()), "Peggable: caller does not have the Luniverse role");
        require(!_pegged[txnHash]._luniverseApproved, "Peggable: the txnHash is already Luniverse Approved");

        _pegged[txnHash]._luniverseApproved = true;
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the Peg must be Gluwa Approved and Luniverse Approved.
     * - the caller must have the Gluwa role or the Luniverse role.
     */
    function mint(string txnHash) public returns (bool) {
        require(isGluwa(_msgSender()) || isLuniverse(_msgSender()),
            "Peggable: caller does not have the Gluwa role or the Luniverse role");

        _processPeg(txnHash);

        address account = _pegged[txnHash]._sender;
        uint256 account = _pegged[txnHash]._amount;

        _mint(account, amount);

        return true;
    }

    function _processPeg(string txnHash) internal {
        require(_pegged[txnHash]._gluwaApproved, "Peggable: the txnHash is not Gluwa Approved");
        require(_pegged[txnHash]._luniverseApproved, "Peggable: the txnHash is not Luniverse Approved");
        require(!_pegged[txnHash]._processed, "Peggable: the txnHash is already processed");

        _pegged[txnHash]._processed = true;
    }

    uint256[50] private __gap;
}