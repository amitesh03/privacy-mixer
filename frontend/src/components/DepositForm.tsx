import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMixer, type Note } from '../hooks/useMixer'
import { DepositIcon, CopyIcon, DownloadIcon, CheckIcon, AlertIcon } from './Icons'

export function DepositForm() {
  const { deposit, loading, error, txHash } = useMixer()
  const [note, setNote] = useState<Note | null>(null)
  const [copied, setCopied] = useState(false)

  const handleDeposit = async () => {
    const result = await deposit()
    if (result) setNote(result)
  }

  const copyNote = () => {
    if (!note) return
    navigator.clipboard.writeText(note.noteString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadNote = () => {
    if (!note) return
    const blob = new Blob([note.noteString], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mixer-note-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
          <DepositIcon className="w-5 h-5 text-accent-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900 tracking-tight">DEPOSIT ETH</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Fixed amount · save your note</p>
        </div>
      </div>

      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border-2 border-amber-500/20 bg-amber-50 p-5 space-y-4 shadow-inner">
              <div className="flex items-center gap-2">
                <AlertIcon className="w-5 h-5 text-amber-500" />
                <p className="text-amber-700 font-bold text-sm tracking-wide">
                  CRITICAL: Save this cryptographic note
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 break-all font-mono text-xs font-medium leading-relaxed text-gray-800 border border-amber-100 shadow-sm">
                {note.noteString}
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyNote}
                  className="flex-1 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border-none text-amber-900 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      COPY TXT
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadNote}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 uppercase tracking-wide shadow-sm"
                >
                  <DownloadIcon className="w-4 h-4" />
                  DL .TXT
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {txHash && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-emerald-600 text-xs break-all font-mono font-medium p-3 bg-emerald-50 rounded-xl border border-emerald-100"
          >
            Tx: {txHash}
          </motion.p>
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
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.99 } : {}}
        onClick={handleDeposit}
        disabled={loading}
        className="w-full py-4 rounded-xl glow-btn primary text-sm font-display font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-2"
      >
        {loading ? (
          <motion.div
             className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <DepositIcon className="w-5 h-5" />
        )}
        <span className="relative z-10">{loading ? 'PROCESSING...' : 'INITIATE DEPOSIT'}</span>
      </motion.button>
    </div>
  )
}
