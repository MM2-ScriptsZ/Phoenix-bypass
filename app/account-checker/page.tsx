"use client"

import { useState, useCallback } from "react"
import {
  ScanSearch,
  Lock,
  User,
  Coins,
  Crown,
  Shield,
  ShieldCheck,
  ShieldOff,
  Calendar,
  CreditCard,
  Package,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ChartColumn,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface AccountData {
  success: boolean
  error?: string
  userInfo: {
    name: string
    displayName: string
    id: number
  }
  avatarUrl: string
  robuxBalance: number
  ageVerification: {
    isOver13: string
    accountAgeDays: number
    accountCreationDate: string
    isAgeVerified: boolean
  }
  transactionData: {
    totalSpent: number
    totalIncoming: number
    totalOutgoing: number
  }
  rareItems: {
    hasKorblox: boolean
    hasHeadless: boolean
    hasValkyrie: boolean
  }
  twoFAStatus: {
    has2FAEnabled: boolean
    display: string
  }
  creditData: {
    balance: number
    currency: string
  }
  rap: number
  limitedsCount: number
  hasPremium: boolean
  emailAddress: string
  emailVerified: string
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US")
}

function StatRow({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3 px-3.5 bg-[#09090b] rounded-lg border border-[#18181b]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#18181b] border border-[#27272a]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold truncate tabular-nums ${accent ? "text-[#fafafa]" : "text-[#a1a1aa]"}`}>{value}</p>
      </div>
    </div>
  )
}

function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold ${
        value
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-[#18181b] text-[#52525b] border border-[#27272a]"
      }`}
    >
      {value ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </span>
  )
}

export default function AccountCheckerPage() {
  const [cookie, setCookie] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<AccountData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = useCallback(async () => {
    if (!cookie.trim() || isChecking) return
    setIsChecking(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/check-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie: cookie.trim() }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Failed to check account.")
      }
    } catch {
      setError("Connection failed. Check your network.")
    } finally {
      setIsChecking(false)
    }
  }, [cookie, isChecking])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
    setCookie("")
  }, [])

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      {/* Navigation */}
      <header className="border-b border-[#1e1e24]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#6366f1]" />
            </div>
            <span className="text-sm font-semibold text-[#fafafa]">Bypasser</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Bypass
            </Link>
            <Link href="/dashboard" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Dashboard
            </Link>
            <Link href="/dualhook" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Dualhook
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-1">
              <ScanSearch className="w-5 h-5 text-[#6366f1]" />
              <h1 className="text-xl font-bold tracking-tight text-[#fafafa]">Account Checker</h1>
            </div>
            <p className="text-sm text-[#52525b] ml-8">Cookie-based account intelligence and data extraction.</p>
          </div>

          {!result ? (
            <div className="max-w-md mx-auto animate-delay-1">
              {/* Input card */}
              <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1e1e24] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#3f3f46]" />
                  <span className="text-sm font-medium text-[#a1a1aa]">Enter Cookie</span>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#a1a1aa]">.ROBLOSECURITY Cookie</label>
                    <textarea
                      placeholder="_|WARNING:-DO-NOT-SHARE-THIS.-Sharing-this-will-allow..."
                      value={cookie}
                      onChange={(e) => setCookie(e.target.value)}
                      className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none font-mono min-h-[88px] resize-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCheck}
                    disabled={!cookie.trim() || isChecking}
                    className="w-full py-3.5 bg-[#6366f1] hover:bg-[#5558e6] disabled:bg-[#18181b] disabled:text-[#3f3f46] text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <ScanSearch className="w-4 h-4" />
                        Check Account
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { step: "01", title: "Paste Cookie", desc: "Enter .ROBLOSECURITY" },
                  { step: "02", title: "Authenticate", desc: "Session validation" },
                  { step: "03", title: "View Data", desc: "Full account report" },
                ].map((item) => (
                  <div key={item.step} className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 text-center">
                    <span className="text-[10px] font-mono text-[#3f3f46] block mb-1">{item.step}</span>
                    <p className="text-xs font-semibold text-[#a1a1aa] mb-0.5">{item.title}</p>
                    <p className="text-[10px] text-[#3f3f46]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              {/* Profile header */}
              <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
                <div className="h-1 w-full bg-[#6366f1]" />
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {result.avatarUrl ? (
                      <img
                        src={result.avatarUrl}
                        alt={`${result.userInfo.name} avatar`}
                        className="w-16 h-16 rounded-2xl border-2 border-[#27272a]"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#18181b] border-2 border-[#27272a] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#3f3f46]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-[#fafafa] truncate">{result.userInfo.displayName}</h2>
                      <p className="text-sm text-[#52525b] font-mono">@{result.userInfo.name} / ID: {result.userInfo.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.roblox.com/users/${result.userInfo.id}/profile`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-xs font-medium text-[#a1a1aa] transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Profile
                      </a>
                      <button
                        onClick={handleReset}
                        className="px-3.5 py-2 bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        New Check
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Economy */}
                <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#6366f1]" /> Economy
                  </h3>
                  <div className="space-y-2">
                    <StatRow icon={<Coins className="w-4 h-4 text-[#6366f1]" />} label="Robux" value={formatNumber(result.robuxBalance)} accent />
                    <StatRow icon={<Package className="w-4 h-4 text-[#52525b]" />} label="RAP" value={formatNumber(result.rap)} />
                    <StatRow icon={<Package className="w-4 h-4 text-[#52525b]" />} label="Limiteds" value={result.limitedsCount.toString()} />
                    <StatRow icon={<CreditCard className="w-4 h-4 text-[#52525b]" />} label="Credit" value={`$${result.creditData.balance.toFixed(2)} ${result.creditData.currency}`} />
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ChartColumn className="w-3.5 h-3.5 text-[#6366f1]" /> Transactions
                  </h3>
                  <div className="space-y-2">
                    <StatRow icon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />} label="Incoming" value={`+${formatNumber(result.transactionData.totalIncoming)}`} />
                    <StatRow icon={<ArrowDownRight className="w-4 h-4 text-red-400" />} label="Outgoing" value={`-${formatNumber(result.transactionData.totalOutgoing)}`} />
                    <StatRow icon={<Coins className="w-4 h-4 text-[#52525b]" />} label="Total Spent" value={formatNumber(result.transactionData.totalSpent)} accent />
                  </div>
                </div>

                {/* Account */}
                <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#6366f1]" /> Account Info
                  </h3>
                  <div className="space-y-2">
                    <StatRow icon={<Calendar className="w-4 h-4 text-[#52525b]" />} label="Created" value={result.ageVerification.accountCreationDate} />
                    <StatRow icon={<Calendar className="w-4 h-4 text-[#52525b]" />} label="Age" value={`${formatNumber(result.ageVerification.accountAgeDays)} days`} />
                    <StatRow icon={<User className="w-4 h-4 text-[#52525b]" />} label="Bracket" value={result.ageVerification.isOver13} />
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Inventory */}
                <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#6366f1]" /> Rare Items
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Korblox", val: result.rareItems.hasKorblox },
                      { label: "Headless", val: result.rareItems.hasHeadless },
                      { label: "Valkyrie", val: result.rareItems.hasValkyrie },
                      { label: "Premium", val: result.hasPremium },
                    ].map(item => (
                      <div key={item.label} className="bg-[#09090b] border border-[#18181b] rounded-lg p-3">
                        <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-2">{item.label}</p>
                        <BoolBadge value={item.val} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1]" /> Security
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 px-3.5 bg-[#09090b] rounded-lg border border-[#18181b]">
                      <div className="flex items-center gap-2.5">
                        {result.twoFAStatus.has2FAEnabled ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ShieldOff className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm text-[#a1a1aa]">Two-Factor Auth</span>
                      </div>
                      <BoolBadge value={result.twoFAStatus.has2FAEnabled} trueLabel="Enabled" falseLabel="Disabled" />
                    </div>
                    <div className="flex items-center justify-between py-3 px-3.5 bg-[#09090b] rounded-lg border border-[#18181b]">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#52525b]" />
                        <span className="text-sm text-[#a1a1aa]">Email</span>
                      </div>
                      <span className="text-xs font-mono text-[#71717a] bg-[#18181b] px-2 py-0.5 rounded">
                        {result.emailAddress
                          ? result.emailAddress.includes("@")
                            ? `${result.emailAddress.split("@")[0].substring(0, 3)}***@${result.emailAddress.split("@")[1]}`
                            : `${result.emailAddress.substring(0, 3)}***`
                          : "None"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-3.5 bg-[#09090b] rounded-lg border border-[#18181b]">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#52525b]" />
                        <span className="text-sm text-[#a1a1aa]">Email Verified</span>
                      </div>
                      <BoolBadge value={result.emailVerified === "Verified"} trueLabel="Yes" falseLabel="No" />
                    </div>
                    <div className="flex items-center justify-between py-3 px-3.5 bg-[#09090b] rounded-lg border border-[#18181b]">
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#52525b]" />
                        <span className="text-sm text-[#a1a1aa]">Age Verified</span>
                      </div>
                      <BoolBadge value={result.ageVerification.isAgeVerified} trueLabel="Verified" falseLabel="No" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
