// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

/**
 * @dev Signature verification
 */
library Validate {
    using Address for address;
    using ECDSA for bytes32;

    /**
     * @dev Throws if given `sig` is an incorrect signature of the `sender`.
     */
    function validateSignature(address contractAddress, address sender, address recipient, uint256 amount, uint256 fee,
        uint256 nonce, bytes memory sig) internal pure returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(contractAddress, sender, recipient, amount, fee, nonce));
        bytes32 messageHash = hash.toEthSignedMessageHash();

        address signer = messageHash.recover(sig);
        require(signer == sender, "Validate: invalid signature");

        return true;
    }

    function validateHash(bytes memory b) internal pure returns (bool) {
        if(b.length != 64) return false;

        for (uint i=0; i<64; i++) {
            if (b[i] < "0") return false;
            if (b[i] > "9" && b[i] <"a") return false;
            if (b[i] > "f") return false;
        }

        return true;
    }
}
