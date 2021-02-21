// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./abstracts/ERC20Pausable.sol";
import "./abstracts/Burnable.sol";
import "./abstracts/ETHlessTransfer.sol";
import "./abstracts/Reservable.sol";
import "./roles/CurrencyBoard.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract LuniverseGluwacoin is ERC20Pausable, CurrencyBoard, Burnable, Reservable, ETHlessTransfer {
    constructor(string memory name, string memory symbol, uint8 decimals) public
    ExtendedERC20(name, symbol, decimals) CurrencyBoard(msg.sender)  {}

    function mint(address account, uint256 amount) public onlyController returns (bool) {
        _mint(account, amount);
        return true;
    }

    function pause() public onlyController returns (bool) {
        super.pause();
        return paused();
    }

    function unpause() public onlyController returns (bool) {
        super.unpause();
        return paused();
    }
}
