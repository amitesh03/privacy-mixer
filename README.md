# Privacy Mixer

A privacy-preserving protocol for non-interactive Ethereum transfers on the Sepolia testnet. Privacy Mixer breaks the on-chain link between sender and recipient addresses by pooling fixed-denomination deposits into an incremental Merkle tree and validating withdrawals through zero-knowledge proofs and cryptographic nullifiers.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.2-yellow.svg?style=flat-square)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF.svg?style=flat-square)](https://vitejs.dev/)
[![Wagmi](https://img.shields.io/badge/Wagmi-v2-black.svg?style=flat-square)](https://wagmi.sh/)
[![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-purple.svg?style=flat-square)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## Overview

Public blockchains expose the complete transaction history of every account. Privacy Mixer restores financial privacy by enabling unlinkable deposits and withdrawals:

1. **Deposit**: A user deposits a fixed amount of ETH (e.g. 0.01 ETH) along with a cryptographic commitment `C = Hash(k || s)`, where `k` is a private nullifier and `s` is a private secret. The commitment is appended as a leaf in an on-chain incremental Merkle tree.
2. **Custody**: Deposited funds are pooled collectively into the smart contract escrow. All deposits of identical denomination are indistinguishable within the anonymity pool.
3. **Withdrawal**: To withdraw, the user supplies a zero-knowledge proof proving knowledge of a valid leaf `C` inside one of the contract's recent Merkle roots, without revealing which leaf belongs to them. The user exposes the nullifier hash `N = Hash(k)`, which the contract records to prevent double-spending.
4. **Relayer Support**: Optional relayer integration enables withdrawals to freshly generated addresses that hold zero ETH, preserving end-to-end network-level privacy without gas linkability.

---

## Cryptographic Mechanism

### 1. Note Generation (Client-Side)

Before interacting with the contract, the client generates two cryptographically secure 256-bit random values:
- **Nullifier (`k`)**: Used to prevent double-spending upon withdrawal.
- **Secret (`s`)**: Ensures zero-knowledge hiding of the leaf commitment.

The commitment and nullifier hash are derived as:
$$\text{Commitment } C = \text{keccak256}(k \parallel s)$$
$$\text{Nullifier Hash } N = \text{keccak256}(k)$$

The client serializes this into a private note string:
```text
mixer-eth-0.01-<64-hex-nullifier><64-hex-secret>
```
*This note never leaves the user's local browser environment.*

### 2. Merkle Tree & Root History

- **Depth**: 20 levels ($2^{20} = 1,048,576$ total deposit capacity).
- **Rolling Root History**: An on-chain circular buffer tracks the last 30 historical Merkle roots. Because transactions can be mined asynchronously, proof verification accepts any root present in this 30-root sliding window, eliminating race conditions during high transaction throughput.

### 3. Double-Spend Prevention

Double-spending is thwarted by registering `nullifierHashes[N] = true` during the withdrawal transaction. Even though the verifier hides which commitment was spent, no two valid withdrawals can yield the same nullifier hash.

---

## System Architecture

```
+-------------------------------------------------------------------+
|                        Client Browser                             |
|  - Wagmi v2 + RainbowKit (Wallet Connection)                      |
|  - Web Crypto API (Secure Random 256-bit Key Generation)          |
|  - Three.js + R3F (Interactive 3D Glass Crystal Visuals)          |
+---------------------------------+---------------------------------+
                                  |
                                  | JSON-RPC (Viem / Ethers)
                                  v
+-------------------------------------------------------------------+
|                     Ethereum Sepolia Testnet                      |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                       ETHMixer.sol                        |   |
|   |  - Fixed Denomination Escrow (0.01 ETH)                   |   |
|   |  - Checks-Effects-Interactions (CEI) & ReentrancyGuard    |   |
|   |  - Relayer Fee Deduction & Payout                         |   |
|   +-----------------------------+-----------------------------+   |
|                                 |                                 |
|                 +---------------+---------------+                 |
|                 |                               |                 |
|                 v                               v                 |
|   +---------------------------+   +---------------------------+   |
|   | MerkleTreeWithHistory.sol |   |     MockVerifier.sol      |   |
|   | - 20-Level Tree           |   | - Proof Verification      |   |
|   | - Circular Root History   |   |   (Groth16 interface)     |   |
|   +---------------------------+   +---------------------------+   |
+-------------------------------------------------------------------+
```

---

## Project Structure

```text
privacy-mixer/
├── contracts/
│   ├── ETHMixer.sol                 # Core escrow, nullifier registry, and withdrawal logic
│   ├── MerkleTreeWithHistory.sol    # Incremental binary Merkle tree with 30-root history
│   └── MockVerifier.sol             # Verifier interface implementation for testing
├── scripts/
│   └── deploy.ts                    # Deployment script for Localhost and Sepolia
├── test/
│   └── ETHMixer.test.ts             # Comprehensive Chai/Hardhat unit tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DepositForm.tsx      # Note generation, deposit transaction, text export
│   │   │   ├── WithdrawForm.tsx     # Note parsing, recipient configuration, withdrawal
│   │   │   ├── Icons.tsx            # Custom SVG icon set
│   │   │   └── Scene3D.tsx          # Three.js glass crystal scene with orbital rings
│   │   ├── config/
│   │   │   ├── contracts.ts         # Contract address and typed ABI definitions
│   │   │   └── wagmi.ts             # Wagmi and RainbowKit chain configurations
│   │   ├── hooks/
│   │   │   └── useMixer.ts          # Custom hook for deposit/withdrawal workflows
│   │   ├── App.tsx                  # Main layout, stats, and tab navigation
│   │   ├── index.css                # Neo-brutalist / glassmorphic styling system
│   │   └── main.tsx                 # React root and Wagmi/QueryClient providers
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── tailwind.config.js           # Design tokens, color palette, and keyframe animations
│   └── vite.config.ts               # Vite build and bundling configuration
├── hardhat.config.ts                # Solidity compiler and network configuration
├── package.json                     # Root project configuration
├── tsconfig.json                    # TypeScript compiler configuration
└── README.md                        # Documentation
```

---

## Quickstart & Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- A Web3 wallet (e.g. MetaMask, Rainbow)

### 1. Installation

Clone the repository and install dependencies for both the root workspace and frontend:

```bash
# Install root contract dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Compile & Test Smart Contracts

Compile Solidity contracts with the Hardhat Cancun EVM compiler:

```bash
npm run compile
```

Execute the unit test suite:

```bash
npm test
```

**Test Suite Coverage:**

```text
  ETHMixer
    Deposit
      [x] deposits with correct denomination
      [x] reverts wrong denomination
      [x] reverts duplicate commitment
      [x] updates merkle root after deposit
    Withdrawal
      [x] withdraws to recipient
      [x] pays relayer fee
      [x] reverts double spend (same nullifier)
      [x] reverts unknown root
      [x] reverts fee > denomination
    MerkleTree
      [x] root history tracks last 30 roots
      [x] unknown root returns false

  11 passing (1.2s)
```

### 3. Run Local Node & Deploy

Start a standalone Hardhat node in one terminal:

```bash
npm run node
```

Deploy contracts to the local network in a second terminal:

```bash
npm run deploy:local
```

Copy the deployed contract address and denomination into `frontend/.env`.

### 4. Launch Frontend

Start the Vite development server:

```bash
cd frontend
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Sepolia Testnet Deployment

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the required variables:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
DEPLOYER_PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
```

### 2. Deploy Contracts

Execute the Sepolia deployment script:

```bash
npm run deploy:sepolia
```

The deployment output will display the deployed addresses:
```text
Deploying on sepolia with account: 0x...
MockVerifier deployed: 0x...
ETHMixer deployed: 0x...
Denomination: 0.01 ETH
```

### 3. Configure & Build Frontend

Update `frontend/.env` with the deployment addresses:

```env
VITE_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
VITE_MIXER_ADDRESS=0xYOUR_DEPLOYED_ETHMIXER_ADDRESS
VITE_DENOMINATION=10000000000000000
```

Build the production distribution:

```bash
cd frontend
npm run build
```

Deploy the generated `dist/` bundle to Vercel, Netlify, or IPFS.

---

## Security Considerations

- **Educational Disclaimer**: This repository is developed for portfolio and educational demonstration. The included `MockVerifier` contract accepts any proof structure to facilitate testing without requiring large trusted-setup ceremonies. Do not deploy this demonstration contract to Ethereum mainnet with real capital.
- **Production ZK Verification**: A production deployment requires compilation of Circom circuits with snarkjs, generating Groth16 zk-SNARK verification contracts backed by a multi-party computation (MPC) ceremony.
- **Poseidon Hash**: In production, `keccak256` inside the Merkle tree should be replaced by the SNARK-friendly Poseidon hash function to reduce constraint count from ~30,000 constraints per hash down to ~250 constraints.
- **Timing Analysis**: Users should allow multiple deposits to enter the pool between depositing and withdrawing. Immediate withdrawals reduce the effective anonymity set to unity.
- **Relayer Usage**: To achieve network-level unlinkability, withdrawals should be dispatched through decentralized relayers or Tor/VPN connections to prevent IP-to-address correlation.

---

## License

This project is licensed under the [MIT License](LICENSE).
