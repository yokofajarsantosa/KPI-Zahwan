"use client"

import { useEffect, useMemo, useState } from "react"
import {
  type AuditRow,
  type StatusAudit,
  type TabKey,
  type YearData,
  buildAuditContext,
  loadYear,
  saveYear,
} from "@/lib/audit-data"
import { AiAssistant } from "@/components/ai-assistant"
import { AuditSidebar } from "@/components/audit-sidebar"
import { AuditHeader } from "@/components/audit-header"
import { KpiCards } from "@/components/kpi-cards"
import { AuditCharts } from "@/components/audit-charts"
import { AuditTable } from "@/components/audit-table"
import { AddActivityModal } from "@/components/add-activity-modal"
import { ClipboardList, FolderKanban } from "lucide-react"

const YEARS = [2026, 2025, 2024]

export default function Page() {
  const [year, setYear] = useState(2026)
  const [data, setData] = useState<YearData | null>(null)
  const [tab, setTab] = useState<TabKey>("jadwal")
  const [modalOpen, setModalOpen] = useState(false)

  // Load whenever the year changes.
  useEffect(() => {
    setData(loadYear(year))
  }, [year])

  const persist = (next: YearData) => {
    setData(next)
    const ok = saveYear(year, next)
    if (!ok) {
      window.alert(
        "Penyimpanan lokal penuh. Perubahan tidak dapat disimpan permanen — mohon hapus sebagian berkas terlampir.",
      )
    }
  }

  const activeRows = data ? data[tab] : []
  const allRows = useMemo(
    () => (data ? [...data.jadwal, ...data.luar] : []),
    [data],
  )
  const auditContext = useMemo(
    () => (data ? buildAuditContext(year, data) : ""),
    [data, year],
  )

  const updateRow = (id: string, patch: Partial<AuditRow>) => {
    if (!data) return
    const next: YearData = {
      ...data,
      [tab]: data[tab].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }
    persist(next)
  }

  const addRow = (row: AuditRow) => {
    if (!data) return
    persist({ ...data, [tab]: [...data[tab], row] })
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Memuat data eksekutif…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AuditSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AuditHeader year={year} onYearChange={setYear} years={YEARS} />

        <main className="flex-1 space-y-6 px-6 py-6">
          <KpiCards rows={allRows} />
          <AuditCharts rows={allRows} />

          {/* Tabs */}
          <div className="space-y-4">
            <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setTab("jadwal")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "jadwal"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Jadwal Audit Utama
              </button>
              <button
                type="button"
                onClick={() => setTab("luar")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "luar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                Pekerjaan di Luar Jadwal
              </button>
            </div>

            <AuditTable
              rows={activeRows}
              tab={tab}
              onStatusChange={(id, status: StatusAudit) =>
                updateRow(id, { status })
              }
              onUpload={(id, berkas) => updateRow(id, { berkas })}
              onAdd={() => setModalOpen(true)}
            />
          </div>
        </main>

        <footer className="border-t border-border px-6 py-5">
          <p className="text-center text-xs text-muted-foreground">
            Dikembangkan oleh: Muhandis Zahwan, S.Akun.
          </p>
        </footer>
      </div>

      <AddActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addRow}
        tab={tab}
        nextNo={activeRows.length + 1}
      />

      <AiAssistant auditContext={auditContext} year={year} />
    </div>
  )
}
