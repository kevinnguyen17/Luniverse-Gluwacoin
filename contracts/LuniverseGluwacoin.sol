// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/Context.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "./roles/GatekeeperRole.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract LuniverseGluwacoin is Initializable, ERC20, GatekeeperRole {
    function initialize() public initializer {
        GatekeeperRole.initialize(_msgSender());
    }

    uint256[50] private ______gap;
}
