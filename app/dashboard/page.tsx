"use client"

import { Zap, ScanSearch, Activity, Clock, Wifi, Users, Fingerprint, Shield, ShieldCheck, Server, Globe, ArrowUpRight, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
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
            <Link href="/account-checker" className="px-3 py-1.5 text-xs font-medium text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors rounded-lg">
              Checker
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
              <BarChart3 className="w-5 h-5 text-[#6366f1]" />
              <h1 className="text-xl font-bold tracking-tight text-[#fafafa]">Dashboard</h1>
            </div>
            <p className="text-sm text-[#52525b] ml-8">Operations overview and real-time module status.</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-delay-1">
            {[
              { label: "Total Bypasses", value: "2,847", change: "+12.4%", icon: Zap, positive: true },
              { label: "Account Checks", value: "5,194", change: "+8.7%", icon: ScanSearch, positive: true },
              { label: "System Uptime", value: "99.9%", change: "30 days", icon: Activity, neutral: true },
              { label: "Active Users", value: "142", change: "+3 today", icon: Users, positive: true },
            ].map((s) => (
              <div key={s.label} className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#52525b]">{s.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-[#3f3f46]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#fafafa] tabular-nums mb-1">{s.value}</p>
                <p className={`text-xs font-medium tabular-nums ${s.neutral ? "text-[#52525b]" : "text-emerald-500"}`}>
                  {s.change}
                </p>
              </div>
            ))}
          </div>

          {/* Module cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 animate-delay-2">
            <Link href="/" className="group">
              <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 h-full transition-colors group-hover:border-[#6366f1]/25">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/15 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-[#6366f1]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#fafafa]">Bypasser Module</h3>
                      <p className="text-xs text-[#52525b]">Cookie-based age override</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/8 border border-emerald-500/15 rounded-md">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-semibold text-emerald-500">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-[#1e1e24]">
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Success</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">94.2%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Avg Time</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">48s</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Today</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">87</p>
                  </div>
                </div>

                <div className="w-full py-2.5 bg-[#6366f1] text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 group-hover:bg-[#5558e6] transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                  Launch Module
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </Link>

            <Link href="/account-checker" className="group">
              <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 h-full transition-colors group-hover:border-[#6366f1]/25">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/15 flex items-center justify-center">
                      <ScanSearch className="w-5 h-5 text-[#6366f1]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#fafafa]">Account Checker</h3>
                      <p className="text-xs text-[#52525b]">Deep profile intelligence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/8 border border-emerald-500/15 rounded-md">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-semibold text-emerald-500">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-[#1e1e24]">
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Scans</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">347</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Avg Time</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">12s</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Today</p>
                    <p className="text-base font-bold text-[#fafafa] tabular-nums">24</p>
                  </div>
                </div>

                <div className="w-full py-2.5 bg-[#6366f1] text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 group-hover:bg-[#5558e6] transition-colors">
                  <ScanSearch className="w-3.5 h-3.5" />
                  Launch Module
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>

          {/* System info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-delay-3">
            {/* Services */}
            <div className="lg:col-span-2 bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4">Service Health</h3>
              <div className="space-y-2">
                {[
                  { name: "Bypass Engine", icon: Fingerprint, latency: "12ms" },
                  { name: "Account Scanner", icon: ScanSearch, latency: "8ms" },
                  { name: "API Gateway", icon: Globe, latency: "3ms" },
                  { name: "Session Manager", icon: Server, latency: "5ms" },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-3 px-4 bg-[#09090b] border border-[#18181b] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#18181b] flex items-center justify-center">
                        <svc.icon className="w-4 h-4 text-[#52525b]" />
                      </div>
                      <span className="text-sm text-[#a1a1aa]">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#52525b]">{svc.latency}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-medium text-emerald-500">Healthy</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#1e1e24] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#3f3f46]" />
                <p className="text-xs text-[#3f3f46]">All systems checked just now</p>
              </div>
            </div>

            {/* Server specs */}
            <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-4">Infrastructure</h3>
              <div className="space-y-4">
                {[
                  { label: "Region", value: "US-EAST-1" },
                  { label: "Latency", value: "12ms" },
                  { label: "Protocol", value: "TLS 1.3" },
                  { label: "Encryption", value: "AES-256-GCM" },
                  { label: "Version", value: "v4.2.1" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#52525b]">{item.label}</span>
                    <span className="text-xs font-mono text-[#a1a1aa] bg-[#18181b] px-2 py-0.5 rounded">{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#1e1e24]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52525b]">Network</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-500">Stable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
