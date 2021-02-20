pragma solidity >=0.5.0;
import "@openzeppelin/contracts/access/Roles.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract CurrencyBoard is Context, Ownable {
    using Address for address;
    using Roles for Roles.Role;

    Roles.Role private _Admins;
    Roles.Role private _Controllers;

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event ControllerAdded(address indexed account);
    event ControllerRemoved(address indexed account);

    constructor(address sender) public {
        if (!isAdmin(sender)) {
            addAdmin(sender);
        }
    }   
  
    modifier onlyAdmin() {
        require(isAdmin(_msgSender()), "Admin Role: caller does not have theAdmin role");
        _;
    }

    modifier onlyController () {
        require(isController (_msgSender()), "Controller  Role: caller does not have the Controller  role");
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return _Admin.has(account);
    }

    function addAdmin(address account) public onlyOwner {
        _addAdmin(account);
        _addController (account);
    }

    function removeAdmin(address account) public onlyOwner {
        _removeAdmin(account);
        _removeController (account);
    }

    function _addAdmmin(address account) internal {
        _Admins.add(account);
        emit AdminAdded(account);
    }

     function _removeAdmin(address account) internal {
        _Admins.remove(account);
        emit AdminRemoved(account);
    }

  

    function isController (address account) public view returns (bool) {
        return _Controllers.has(account);
    }

    function addController (address account) public onlyAdmin {
        _addController (account);
    }

    function removeController (address account) public onlyAdmin  {
        _removeController (account);
    }

    function renounceController () public only Controller {
        _removeController (_msgSender());
    }

    function _addController (address account) internal {
        _Controllers.add(account);
        emit ControllerAdded(account);
    }

    function _removeController (address account) internal {
        _Controllers.remove(account);
        emit ControllerRemoved(account);
    }
}