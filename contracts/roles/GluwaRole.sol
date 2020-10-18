// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/GSN/Context.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

contract GluwaRole is Initializable, Context {
    using Address for address;
    using Roles for Roles.Role;

    event GluwaAdded(address indexed account);
    event GluwaRemoved(address indexed account);

    Roles.Role private _Gluwas;

    function initialize(address sender) public initializer {
        if (!isGluwa(sender)) {
            _addGluwa(sender);
        }
    }

    modifier onlyGluwa() {
        require(isGluwa(_msgSender()), "GluwaRole: caller does not have the Gluwa role");
        _;
    }

    function isGluwa(address account) public view returns (bool) {
        return _Gluwas.has(account);
    }

    function addGluwa(address account) public onlyGluwa {
        _addGluwa(account);
    }

    function removeGluwa(address account) public onlyGluwa {
        _removeGluwa(account);
    }

    function renounceGluwa() public {
        _removeGluwa(_msgSender());
    }

    function _addGluwa(address account) internal {
        _Gluwas.add(account);
        emit GluwaAdded(account);
    }

    function _removeGluwa(address account) internal {
        _Gluwas.remove(account);
        emit GluwaRemoved(account);
    }

    uint256[50] private ______gap;
}
