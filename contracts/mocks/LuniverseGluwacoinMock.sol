// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "../LuniverseGluwacoin.sol";

contract LuniverseGluwacoinMock is Initializable, LuniverseGluwacoin {

    constructor(
    ) public {
        initialize();
    }

    uint256[50] private __gap;
}