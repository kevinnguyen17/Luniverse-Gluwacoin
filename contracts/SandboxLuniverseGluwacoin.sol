// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./abstracts/ERC20Pausable.sol";
import "./abstracts/Burnable.sol";
import "./abstracts/ETHlessTransfer.sol";
import "./abstracts/SandboxPeggable.sol";
import "./abstracts/Reservable.sol";

/**
 * @dev Luniverse Gluwacoin for Sandbox
 */
contract SandboxLuniverseGluwacoin is ERC20Pausable, GluwaRole, LuniverseRole, Burnable, SandboxPeggable, Reservable, ETHlessTransfer {
    constructor(string memory name, string memory symbol, uint8 decimals) public
    ExtendedERC20(name, symbol, decimals) GluwaRole(msg.sender) LuniverseRole(msg.sender) {}
}
