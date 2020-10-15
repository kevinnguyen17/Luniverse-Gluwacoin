pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

contract GatekeeperRole is Initializable {
    using Address for address;
    using Roles for Roles.Role;

    event GatekeeperAdded(address indexed account);
    event GatekeeperRemoved(address indexed account);

    Roles.Role private _gatekeepers;
    uint8 _gatekeepersCount;

    // address of a gatekeeper candidate mapping to address gatekeeper who approved the candidate
    mapping (address => mapping (address => bool)) private _candidateApproval;
    // address of a gatekeeper candidate mapping to number of approval for that transaction
    mapping (address => uint8) private _candidateApprovalCount;
    // transaction hash of a token pegging mapping to address gatekeeper who approved the peg
    mapping (bytes32 => mapping (address => bool)) private _peggingApproval;
    // transaction hash of a token pegging mapping to number of approval for that peg
    mapping (bytes32 => uint8) private _peggingApprovalCount;
    // transaction hash of a token pegging mapping to if it was processed
    mapping (bytes32 => bool) private _pegged;

    function initialize(address sender) public initializer {
        if (!isGatekeeper(sender)) {
            _addGatekeeper(sender);
        }
    }

    modifier onlyGatekeeper() {
        require(isGatekeeper(_msgSender()), "GatekeeperRole: caller does not have the Gatekeeper role");
        _;
    }

    function isGatekeeper(address account) public view returns (bool) {
        return _gatekeepers.has(account);
    }

    function isCandidateApproved(address account) public view returns (bool) {
        return _candidateApproval[account][_msgSender()];
    }

    function addGatekeeper(address account) public onlyGatekeeper {
        _approveGatekeeper(account);

        if (_candidateApprovalCount[account] == _gatekeepersCount) {
            _addGatekeeper(account);
        }
    }

    function renounceGatekeeper() public {
        _removeGatekeeper(_msgSender());
    }

    function isPegged(bytes32 txnHash) public view returns (bool) {
        return _pegged[txnHash];
    }

    function isPegApproved(bytes32 txnHash, address gatekeeper) public view returns (bool) {
        return _peggingApproval[txnHash][gatekeeper];
    }

    function _approveGatekeeper(address account) internal {
        require(_candidateApproval[account][_msgSender()] == false, "GatekeeperRole: the account is already approved the sender");

        _candidateApproval[account][_msgSender()] = true;
        _candidateApprovalCount[account] = _candidateApprovalCount[account].add(1);
    }

    function _addGatekeeper(address account) internal {
        _gatekeepers.add(account);
        _gatekeepersCount = _gatekeepersCount.add(1);
        emit GatekeeperAdded(account);
    }

    function _removeGatekeeper(address account) internal {
        _minters.remove(account);
        _gatekeepersCount = _gatekeepersCount.sub(1);
        emit MinterRemoved(account);
    }

    uint256[50] private ______gap;
}
