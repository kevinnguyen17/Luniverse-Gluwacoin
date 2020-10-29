// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./abstracts/BeforeTransferERC20.sol";
import "./abstracts/Burnable.sol";
import "./abstracts/ETHlessTransfer.sol";
import "./abstracts/SandboxPeggable.sol";
import "./abstracts/Reservable.sol";
import "./roles/GluwaRole.sol";
import "./roles/LuniverseRole.sol";

/**
 * @dev Luniverse Gluwacoin for Sandbox
 */
contract SandboxLuniverseGluwacoin is BeforeTransferERC20, GluwaRole, LuniverseRole, Burnable, SandboxPeggable, Reservable, ETHlessTransfer {
    constructor(string memory name, string memory symbol, uint8 decimals) public
    BeforeTransferERC20(name, symbol, decimals) GluwaRole(msg.sender) LuniverseRole(msg.sender) {}
}
