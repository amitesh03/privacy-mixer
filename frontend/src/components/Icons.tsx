export function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <polygon points="12 2 4 6 4 13 12 22 20 13 20 6 12 2" />
      <polygon points="12 6 8 8 8 12 12 17 16 12 16 8 12 6" opacity="0.4" />
    </svg>
  )
}

export function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="10" width="16" height="12" />
      <path d="M7 10V6a5 5 0 0110 0v4" />
    </svg>
  )
}

export function DepositIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <line x1="12" y1="2" x2="12" y2="16" />
      <polyline points="7 11 12 16 17 11" />
      <polyline points="4 21 20 21" />
    </svg>
  )
}

export function WithdrawIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <line x1="12" y1="16" x2="12" y2="2" />
      <polyline points="7 7 12 2 17 7" />
      <polyline points="4 21 20 21" />
    </svg>
  )
}

export function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="9" y="9" width="12" height="12" />
      <path d="M5 15H3V3h12v2" />
    </svg>
  )
}

export function DownloadIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M21 15v4H3v-4" />
      <polyline points="8 10 12 15 16 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="21 5 9 19 3 12" />
    </svg>
  )
}

export function AlertIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <polygon points="12 2 22 20 2 20" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function EthIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 6 12 12 15 18 12" opacity="0.3" />
      <polygon points="12 23 6 13 12 16 18 13" />
    </svg>
  )
}

export function WalletIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 9h18" />
      <rect x="15" y="11" width="3" height="2" fill="currentColor" />
    </svg>
  )
}
