import { useState, useCallback } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { keccak256, encodePacked, type Hex } from 'viem'
import { MIXER_ADDRESS, MIXER_ABI, DENOMINATION } from '../config/contracts'

export interface Note {
  nullifier: Hex
  secret: Hex
  commitment: Hex
  noteString: string
}

function randomBytes32(): Hex {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return ('0x' +
    Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')) as Hex
}

function generateCommitment(nullifier: Hex, secret: Hex): Hex {
  return keccak256(encodePacked(['bytes32', 'bytes32'], [nullifier, secret]))
}

export function useMixer() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<Hex | null>(null)

  const generateNote = useCallback((): Note => {
    const nullifier = randomBytes32()
    const secret = randomBytes32()
    const commitment = generateCommitment(nullifier, secret)
    const noteString = `mixer-eth-0.01-${nullifier.slice(2)}${secret.slice(2)}`
    return { nullifier, secret, commitment, noteString }
  }, [])

  const parseNote = useCallback((noteString: string): Note | null => {
    try {
      // Format: mixer-eth-0.01-<64 hex nullifier><64 hex secret>
      const match = noteString.match(
        /^mixer-eth-[\d.]+-([\da-fA-F]{64})([\da-fA-F]{64})$/
      )
      if (!match) return null
      const nullifier = ('0x' + match[1]) as Hex
      const secret = ('0x' + match[2]) as Hex
      const commitment = generateCommitment(nullifier, secret)
      return { nullifier, secret, commitment, noteString }
    } catch {
      return null
    }
  }, [])

  const deposit = useCallback(async (): Promise<Note | null> => {
    if (!walletClient || !publicClient) {
      setError('Wallet not connected')
      return null
    }
    setLoading(true)
    setError(null)
    setTxHash(null)
    try {
      const note = generateNote()
      const hash = await walletClient.writeContract({
        address: MIXER_ADDRESS,
        abi: MIXER_ABI,
        functionName: 'deposit',
        args: [note.commitment],
        value: DENOMINATION,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setTxHash(hash)
      return note
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Deposit failed'
      setError(msg.length > 200 ? msg.slice(0, 200) + '...' : msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [walletClient, publicClient, generateNote])

  const withdraw = useCallback(
    async (noteString: string, recipient: Hex): Promise<boolean> => {
      if (!walletClient || !publicClient) {
        setError('Wallet not connected')
        return false
      }
      const note = parseNote(noteString)
      if (!note) {
        setError('Invalid note format')
        return false
      }
      setLoading(true)
      setError(null)
      setTxHash(null)
      try {
        // Mock proof - the MockVerifier accepts anything
        const mockProof = ('0x' + '00'.repeat(256)) as Hex
        const root = (await publicClient.readContract({
          address: MIXER_ADDRESS,
          abi: MIXER_ABI,
          functionName: 'getLastRoot',
        })) as Hex
        const nullifierHash = keccak256(
          encodePacked(['bytes32'], [note.nullifier])
        )
        const hash = await walletClient.writeContract({
          address: MIXER_ADDRESS,
          abi: MIXER_ABI,
          functionName: 'withdraw',
          args: [
            mockProof,
            root,
            nullifierHash,
            recipient,
            '0x0000000000000000000000000000000000000000',
            BigInt(0),
            BigInt(0),
          ],
          value: BigInt(0),
        })
        await publicClient.waitForTransactionReceipt({ hash })
        setTxHash(hash)
        return true
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Withdrawal failed'
        setError(msg.length > 200 ? msg.slice(0, 200) + '...' : msg)
        return false
      } finally {
        setLoading(false)
      }
    },
    [walletClient, publicClient, parseNote]
  )

  return { deposit, withdraw, generateNote, parseNote, loading, error, txHash }
}
