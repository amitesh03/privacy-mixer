import { useState, Suspense, lazy } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { DepositForm } from './components/DepositForm'
import { WithdrawForm } from './components/WithdrawForm'
import { ShieldIcon, DepositIcon, WithdrawIcon, EthIcon, WalletIcon } from './components/Icons'
import { MIXER_ADDRESS, MIXER_ABI } from './config/contracts'

const Scene3D = lazy(() =>
  import('./components/Scene3D').then((m) => ({ default: m.Scene3D }))
)

type Tab = 'deposit' | 'withdraw'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(12px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.1, duration: 0.7, ease: EASE_OUT },
  }),
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: 'blur(16px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(16px)',
    transition: { duration: 0.4 },
  },
}

function MixerStats() {
  const publicClient = usePublicClient()
  const { data: nextIndex } = useQuery({
    queryKey: ['nextIndex'],
    queryFn: () =>
      publicClient!.readContract({
        address: MIXER_ADDRESS,
        abi: MIXER_ABI,
        functionName: 'nextIndex',
      }),
    enabled: !!publicClient,
    refetchInterval: 10_000,
  })
  const { data: denomination } = useQuery({
    queryKey: ['denomination'],
    queryFn: () =>
      publicClient!.readContract({
        address: MIXER_ADDRESS,
        abi: MIXER_ABI,
        functionName: 'denomination',
      }),
    enabled: !!publicClient,
  })

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 mb-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {[
        {
          label: 'Total Deposits',
          value: nextIndex?.toString() ?? '—',
          icon: <ShieldIcon className="w-5 h-5 text-accent-500" />,
        },
        {
          label: 'Fixed Amount',
          value: denomination ? `${formatEther(denomination as bigint)} ETH` : '—',
          icon: <EthIcon className="w-5 h-5 text-accent-500" />,
        },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          custom={i}
          className="glass-card stat-card p-5 text-center cursor-default group"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="opacity-80 group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
            <p className="text-[12px] uppercase tracking-[0.2em] text-gray-500 font-bold font-display">
              {stat.label}
            </p>
          </div>
          <p className="text-gray-900 text-3xl font-bold tracking-tight font-display">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function TabSwitcher({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'deposit', label: 'Deposit', icon: <DepositIcon className="w-4 h-4" /> },
    { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon className="w-4 h-4" /> },
  ]

  return (
    <div className="flex glass-card p-1.5 mb-8 relative border-gray-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-300 relative z-10 font-display uppercase tracking-wide ${
            tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {t.icon}
          {t.label}
          {tab === t.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-xl bg-gray-900 shadow-xl"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const { isConnected } = useAccount()
  const [tab, setTab] = useState<Tab>('deposit')

  return (
    <div className="min-h-screen relative text-gray-900">
      {/* Background layers */}
      <div className="mesh-gradient">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="grain-overlay" />

      {/* 3D Scene — hero area only */}
      <div className="fixed top-0 left-0 w-full h-[55vh] opacity-50 pointer-events-none" style={{ zIndex: 1 }}>
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </div>

      {/* Main content */}
      <div className="relative" style={{ zIndex: 10 }}>
        <div className="max-w-xl mx-auto px-6 py-10">
          {/* Header */}
          <motion.header
            className="flex items-center justify-between mb-16"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                <ShieldIcon className="w-7 h-7 text-accent-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-gray-900 font-display">
                  PRIVACY MIXER
                </h1>
                <p className="text-[10px] text-accent-600 font-bold tracking-[0.2em] uppercase">
                  ZK · Sepolia Testnet
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="avatar"
              />
            </motion.div>
          </motion.header>

          {/* Hero text */}
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto text-balance"
            >
              Deposit ETH and withdraw to any address with a zero-knowledge proof. 
              <span className="text-gray-900 font-semibold block mt-1">Unlinkable. Uncensorable. Pristine.</span>
            </motion.p>
          </motion.div>

          {/* Stats */}
          {isConnected && <MixerStats />}

          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TabSwitcher tab={tab} setTab={setTab} />
          </motion.div>

          {/* Form area */}
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.div
                key="connect"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="glass-card p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center"
                >
                  <WalletIcon className="w-8 h-8 text-accent-500" />
                </motion.div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Wallet Disconnected</h3>
                <p className="text-gray-500 text-sm mb-8">
                  Connect your wallet to engage the mixer protocol.
                </p>
                <ConnectButton />
              </motion.div>
            ) : tab === 'deposit' ? (
              <motion.div
                key="deposit"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DepositForm />
              </motion.div>
            ) : (
              <motion.div
                key="withdraw"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <WithdrawForm />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.footer
            className="mt-16 text-center"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] font-display">
              Demo project · MockVerifier
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-[12px] font-semibold text-accent-500 hover:text-accent-600 transition-colors duration-200"
            >
              View Protocol Source ↗
            </a>
          </motion.footer>
        </div>
      </div>
    </div>
  )
}
