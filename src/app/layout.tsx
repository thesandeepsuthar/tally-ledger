'use client';

import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const navItems = [
  { label: "Overview", href: "/" },
  { label: "New Transaction", href: "/transactions" },
  { label: "Ledger", href: "/ledger" },
  { label: "Inventory", href: "/inventory" },
  { label: "Reports", href: "/reports" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}>
      <body>
        <div className="flex min-h-screen font-sans text-sm">
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
                    className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[13px] font-medium no-underline cursor-pointer ${
                      isActive
                        ? "bg-white/[0.09] text-white"
                        : "text-[#C9D2C3] hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto px-[22px] pt-4 border-t border-white/10">
              <div className="text-[11.5px] text-[#9FB0A5] mt-2">
                Tally Ledger v1
              </div>
            </div>
          </aside>
          <div className="flex-1 min-w-0 flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
