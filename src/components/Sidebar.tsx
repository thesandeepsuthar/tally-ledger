'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Overview', href: '/', icon: '◇' },
  { label: 'New Transaction', href: '/transactions', icon: '+' },
  { label: 'Ledger', href: '/ledger', icon: '📒' },
  { label: 'Inventory', href: '/inventory', icon: '📦' },
  { label: 'Reports', href: '/reports', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="max-lg:hidden w-[220px] flex-none bg-green-deep text-[#EDEFE7] flex flex-col py-[22px]">
      <div className="px-[22px] pb-[22px] border-b border-white/10 mb-[18px]">
        <Link href="/" className="font-serif font-semibold text-xl tracking-[0.02em] text-white no-underline">
          Ledger
        </Link>
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-[#9FB0A5] mt-1">
          Reconciliation Portal
        </div>
      </div>

      <nav className="flex flex-col gap-px px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[13px] font-medium cursor-pointer no-underline ${
                isActive
                  ? 'bg-white/[0.09] text-white'
                  : 'text-[#C9D2C3] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
