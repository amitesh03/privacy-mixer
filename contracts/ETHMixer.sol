// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MerkleTreeWithHistory.sol";

interface IVerifier {
    function verifyProof(bytes calldata proof, uint256[6] calldata input) external view returns (bool);
}

/// @title ETHMixer
/// @notice Privacy mixer: deposit fixed denomination ETH, withdraw to any address with ZK proof
contract ETHMixer is MerkleTreeWithHistory {
    uint256 public immutable denomination;
    IVerifier public immutable verifier;

    mapping(bytes32 => bool) public nullifierHashes;
    mapping(bytes32 => bool) public commitments;

    event Deposit(bytes32 indexed commitment, uint32 leafIndex, uint256 timestamp);
    event Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee);

    constructor(
        address verifier_,
        uint256 denomination_,
        uint32 merkleTreeLevels
    ) MerkleTreeWithHistory(merkleTreeLevels) {
        require(denomination_ > 0, "Mixer: zero denomination");
        require(verifier_ != address(0), "Mixer: zero verifier");
        denomination = denomination_;
        verifier = IVerifier(verifier_);
    }

    /// @notice Deposit exactly `denomination` ETH with a commitment
    function deposit(bytes32 commitment) external payable {
        require(msg.value == denomination, "Mixer: wrong denomination");
        require(!commitments[commitment], "Mixer: duplicate commitment");
        commitments[commitment] = true;
        uint32 insertedIndex = _insert(commitment);
        emit Deposit(commitment, insertedIndex, block.timestamp);
    }

    /// @notice Withdraw using a ZK proof
    function withdraw(
        bytes calldata proof,
        bytes32 root,
        bytes32 nullifierHash,
        address payable recipient,
        address payable relayer,
        uint256 fee,
        uint256 refund
    ) external payable {
        require(fee <= denomination, "Mixer: fee too large");
        require(!nullifierHashes[nullifierHash], "Mixer: already spent");
        require(isKnownRoot(root), "Mixer: unknown root");
        require(msg.value == refund, "Mixer: wrong refund");

        require(
            verifier.verifyProof(
                proof,
                [
                    uint256(root),
                    uint256(nullifierHash),
                    uint256(uint160(address(recipient))),
                    uint256(uint160(address(relayer))),
                    fee,
                    refund
                ]
            ),
            "Mixer: invalid proof"
        );

        nullifierHashes[nullifierHash] = true;

        uint256 payout = denomination - fee;
        (bool ok,) = recipient.call{value: payout}("");
        require(ok, "Mixer: recipient transfer failed");

        emit Withdrawal(recipient, nullifierHash, relayer, fee);
    }
}
