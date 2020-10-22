// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "../LuniverseGluwacoin.sol";

contract LuniverseGluwacoinMock is Initializable, LuniverseGluwacoin {

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        initialize(name, symbol, decimals);
    }

    uint256[50] private __gap;
}