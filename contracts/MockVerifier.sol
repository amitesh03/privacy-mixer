// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockVerifier
/// @notice Test verifier — accepts any proof. Replace with SnarkJS-generated verifier in production.
/// @dev In production: snarkjs zkey export solidityverifier circuit.zkey Verifier.sol
contract MockVerifier {
    /// @notice Always returns true for testing. Production verifier validates Groth16 proof.
    function verifyProof(
        bytes calldata, /* proof */
        uint256[6] calldata /* publicInputs: [root, nullifierHash, recipient, relayer, fee, refund] */
    ) external pure returns (bool) {
        return true;
    }
}
