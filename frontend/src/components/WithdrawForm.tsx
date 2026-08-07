import { useState } from 'react'
import { useAccount } from 'wagmi'
import { type Hex } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { useMixer } from '../hooks/useMixer'
import { WithdrawIcon, CheckIcon } from './Icons'

export function WithdrawForm() {
  const { address } = useAccount()
  const { withdraw, loading, error, txHash } = useMixer()
  const [noteString, setNoteString] = useState('')
  const [recipient, setRecipient] = useState<string>(address ?? '')
  const [success, setSuccess] = useState(false)

  const handleWithdraw = async () => {
    setSuccess(false)
    const recipientAddr = (recipient || address) as Hex
    if (!recipientAddr) return
    const ok = await withdraw(noteString.trim(), recipientAddr)
    if (ok) setSuccess(true)
  }

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
          <WithdrawIcon className="w-5 h-5 text-accent-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900 tracking-tight">WITHDRAW</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Paste note · specify recipient</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold font-display">
          SECRET NOTE
        </label>
        <textarea
          value={noteString}
          onChange={(e) => setNoteString(e.target.value)}
          placeholder="mixer-eth-1-..."
          rows={3}
          className="input-field font-mono text-sm resize-none shadow-inner"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.15em] text-gray-500 font-bold font-display">
          RECIPIENT ADDRESS
        </label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={address ?? '0x...'}
          className="input-field font-mono text-sm shadow-inner"
        />
        {address && (
          <motion.button
            whileHover={{ x: 3 }}
            onClick={() => setRecipient(address)}
            className="text-accent-500 text-[11px] font-bold uppercase tracking-wide hover:text-accent-600 transition-colors duration-200 mt-2 flex items-center gap-1"
          >
            ← USE CONNECTED WALLET
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {success && txHash && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50 p-4 shadow-inner mt-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="w-5 h-5 text-emerald-500" />
                <p className="text-emerald-700 font-bold text-sm">Withdrawal Successful</p>
              </div>
              <p className="text-emerald-600 text-xs break-all font-mono bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                Tx: {txHash}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-600 text-xs font-medium p-3 bg-red-50 rounded-xl border border-red-100"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={!loading && noteString.trim() ? { scale: 1.01 } : {}}
        whileTap={!loading && noteString.trim() ? { scale: 0.99 } : {}}
        onClick={handleWithdraw}
        disabled={loading || !noteString.trim()}
        className="w-full py-4 rounded-xl glow-btn primary text-sm font-display font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <WithdrawIcon className="w-5 h-5" />
        )}
        <span className="relative z-10">{loading ? 'PROCESSING...' : 'EXECUTE WITHDRAWAL'}</span>
      </motion.button>
    </div>
  )
}
