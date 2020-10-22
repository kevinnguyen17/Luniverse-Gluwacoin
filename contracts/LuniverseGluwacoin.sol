// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/Context.sol";
import "./abstracts/BeforeTransferERC20.sol";
import "./abstracts/Burnable.sol";
import "./abstracts/ETHlessTransfer.sol";
import "./abstracts/Peggable.sol";
import "./abstracts/Reservable.sol";
import "./roles/GluwaRole.sol";
import "./roles/LuniverseRole.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract LuniverseGluwacoin is Initializable, BeforeTransferERC20, GluwaRole, LuniverseRole, Burnable, Peggable, Reservable, ETHlessTransfer {
    function initialize(string memory name, string memory symbol, uint8 decimals) public initializer {
        BeforeTransferERC20.initialize(name, symbol, decimals);
        GluwaRole.initialize(_msgSender());
        LuniverseRole.initialize(_msgSender());
    }

    uint256[50] private ______gap;
}
