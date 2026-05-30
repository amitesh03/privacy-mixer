// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MerkleTreeWithHistory
/// @notice Incremental Merkle tree with root history for ZK mixer
abstract contract MerkleTreeWithHistory {
    uint32 public constant ROOT_HISTORY_SIZE = 30;
    uint32 public immutable levels;

    bytes32[] public filledSubtrees;
    bytes32[30] public roots;
    uint32 public currentRootIndex;
    uint32 public nextIndex;

    // Precomputed zero values for each level (keccak256-based for testing)
    bytes32[] public zeros;

    event LeafInserted(bytes32 indexed leaf, uint32 leafIndex, bytes32 root);

    constructor(uint32 levels_) {
        require(levels_ > 0 && levels_ <= 32, "MerkleTree: invalid levels");
        levels = levels_;
        filledSubtrees = new bytes32[](levels_);
        zeros = new bytes32[](levels_);

        // Compute zero values
        zeros[0] = keccak256(abi.encodePacked(uint256(0)));
        for (uint32 i = 1; i < levels_; i++) {
            zeros[i] = hashLeftRight(zeros[i - 1], zeros[i - 1]);
        }
        for (uint32 i = 0; i < levels_; i++) {
            filledSubtrees[i] = zeros[i];
        }
        roots[0] = _computeRoot();
    }

    function _insert(bytes32 leaf) internal returns (uint32 index) {
        require(nextIndex < 2 ** levels, "MerkleTree: tree full");
        index = nextIndex;
        uint32 currentIndex = index;
        bytes32 currentLevelHash = leaf;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                filledSubtrees[i] = currentLevelHash;
                currentLevelHash = hashLeftRight(currentLevelHash, zeros[i]);
            } else {
                currentLevelHash = hashLeftRight(filledSubtrees[i], currentLevelHash);
            }
            currentIndex /= 2;
        }

        currentRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        roots[currentRootIndex] = currentLevelHash;
        nextIndex++;
        emit LeafInserted(leaf, index, currentLevelHash);
    }

    function isKnownRoot(bytes32 root) public view returns (bool) {
        if (root == bytes32(0)) return false;
        uint32 i = currentRootIndex;
        for (uint32 j = 0; j < ROOT_HISTORY_SIZE; j++) {
            if (roots[i] == root) return true;
            if (i == 0) i = ROOT_HISTORY_SIZE - 1;
            else i--;
        }
        return false;
    }

    function getLastRoot() public view returns (bytes32) {
        return roots[currentRootIndex];
    }

    function hashLeftRight(bytes32 left, bytes32 right) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(left, right));
    }

    function _computeRoot() internal view returns (bytes32 root) {
        root = zeros[0];
        for (uint32 i = 1; i < levels; i++) {
            root = hashLeftRight(root, zeros[i - 1]);
        }
    }
}
