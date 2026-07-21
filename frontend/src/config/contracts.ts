export const MIXER_ADDRESS = (import.meta.env.VITE_MIXER_ADDRESS ??
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`

// 0.01 ETH for Sepolia, override via env
export const DENOMINATION = BigInt(
  import.meta.env.VITE_DENOMINATION ?? '10000000000000000'
)

export const MIXER_ABI = [
  {
    name: 'denomination',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'nextIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    name: 'getLastRoot',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
  {
    name: 'commitments',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'nullifierHashes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'proof', type: 'bytes' },
      { name: 'root', type: 'bytes32' },
      { name: 'nullifierHash', type: 'bytes32' },
      { name: 'recipient', type: 'address' },
      { name: 'relayer', type: 'address' },
      { name: 'fee', type: 'uint256' },
      { name: 'refund', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'Deposit',
    type: 'event',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'leafIndex', type: 'uint32', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const
