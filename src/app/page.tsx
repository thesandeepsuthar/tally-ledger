export default function Dashboard() {
  return (
    <div className="flex min-h-screen font-sans text-sm">
      {/* ===== Sidebar ===== */}
      <aside className="max-lg:hidden w-[220px] flex-none bg-green-deep text-[#EDEFE7] flex flex-col py-[22px]">
        <div className="px-[22px] pb-[22px] border-b border-white/10 mb-[18px]">
          <div className="font-serif font-semibold text-xl tracking-[0.02em] text-white">
            Ledger
          </div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-[#9FB0A5] mt-1">
            Reconciliation Portal
          </div>
        </div>
        <nav className="flex flex-col gap-px px-3">
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[13px] font-medium cursor-pointer bg-white/[0.09] text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Overview
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            New Transaction
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Ledger
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Inventory
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Reports
          </a>
        </nav>
        <div className="mt-auto px-[22px] pt-4 border-t border-white/10">
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A] shadow-[0_0_0_3px_rgba(89,192,138,0.18)]" />
            Database — connected
          </div>
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A] shadow-[0_0_0_3px_rgba(89,192,138,0.18)]" />
            API — healthy, 42ms
          </div>
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#E3B23C] shadow-[0_0_0_3px_rgba(227,178,60,0.18)]" />
            Sync queue — 1 pending
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
          <div>
            <h1 className="font-serif font-semibold text-[19px]">Overview</h1>
            <div className="text-xs text-muted mt-0.5">
              Tuesday, 28 July 2026 · All amounts in ₹
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-[20px] border border-rule-strong bg-surface text-muted">
              <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A]" />
              All systems normal
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-[20px] border border-rule-strong bg-surface text-muted">
              Priya Sharma · Counter Staff
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-[30px] pb-[60px]" />
      </div>
    </div>
  );
}
