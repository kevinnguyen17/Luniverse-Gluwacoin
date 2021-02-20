pragma solidity >=0.5.16;
import "@openzeppelin/contracts/access/Roles.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract CurrencyBoard is Context, Ownable {
    using Address for address;
    using Roles for Roles.Role;

    Roles.Role private _Admins;
    Roles.Role private _Minters;

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

        
  
    modifier onlyAdmin() {
        require(isAdmin(_msgSender()), "Minter Role: caller does not have the Minter role");
        _;
    }

    modifier onlyMinter() {
        require(isMinter(_msgSender()), "Minter Role: caller does not have the Minter role");
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return _Admin.has(account);
    }

    function addAdmin(address account) public onlyOwner {
        _addAdmin(account);
        _addMinter(account);
    }

    function removeAdmin(address account) public onlyOwner {
        _removeAdmin(account);
        _removeMinter(account);
    }

    function _addAdmmin(address account) internal {
        _Admins.add(account);
        emit AdminAdded(account);
    }

     function _removeAdmin(address account) internal {
        _Admins.remove(account);
        emit AdminRemoved(account);
    }

  

    function isMinter(address account) public view returns (bool) {
        return _Minters.has(account);
    }

    function addMinter(address account) public onlyAdmin {
        _addMinter(account);
    }

    function removeMinter(address account) public onlyMinter {
        _removeMinter(account);
    }

    function renounceMinter() public {
        _removeMinter(_msgSender());
    }

    function _addMinter(address account) internal {
        _Minters.add(account);
        emit MinterAdded(account);
    }

    function _removeMinter(address account) internal {
        _Minters.remove(account);
        emit MinterRemoved(account);
    }
}