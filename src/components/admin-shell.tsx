"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Wallet,
  Upload,
  Settings as SettingsIcon,
  FileArchive,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  Users,
  ScrollText,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminGlobalSearch } from "@/components/admin-global-search";
import { PendingStrukBadge } from "@/components/pending-struk-badge";
import { BrandLogo } from "@/components/brand-logo";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Data Anggota", href: "/admin/anggota", icon: Users },
  { label: "Verifikasi Struk", href: "/admin/struk", icon: ImageIcon },
  { label: "Struk Generator", href: "/admin/struk-generator", icon: ReceiptText },
  { label: "Kas & Transaksi", href: "/admin/kas", icon: Wallet },
  { label: "Import Data", href: "/admin/import", icon: Upload },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  { label: "Pengaturan", href: "/admin/settings", icon: SettingsIcon },
  { label: "Laporan & Reset", href: "/admin/laporan", icon: FileArchive },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onNavigate?: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn("sidebar-item", active && "sidebar-item-active")}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={20} strokeWidth={2} />
      <span>{label}</span>
      {badge}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-[var(--ink)]"
        style={{ borderBottom: "3px solid var(--ink)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="brutal-btn brutal-btn-neutral p-2 md:hidden"
            aria-label="Buka menu admin"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{
                background: "var(--accent-primary)",
                border: "3px solid #ffffff",
                borderRadius: 8,
              }}
            >
              <BrandLogo size={34} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base text-white">SIDU Admin</span>
              <span className="text-[10px] font-semibold text-white/60 -mt-0.5">
                {process.env.NEXT_PUBLIC_INSTANCE_NAME ?? "HTN 26"}
              </span>
            </div>
          </Link>
        </div>

        {/* Global search (desktop only) */}
        <AdminGlobalSearch />

        <div className="flex items-center gap-2">
          <Link
            href="/beranda"
            className="brutal-btn brutal-btn-neutral px-3 py-2 text-sm"
            aria-label="Kembali ke mode anggota"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Mode Anggota</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="brutal-btn brutal-btn-danger px-3 py-2 text-sm"
            aria-label="Keluar admin"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside
          className="hidden md:flex w-64 shrink-0 flex-col bg-[var(--surface)]"
          style={{ borderRight: "3px solid var(--ink)" }}
        >
          <div className="sidebar-label">Menu Admin</div>
          <nav className="flex flex-col gap-1 px-3 pb-4">
            {NAV.map((it) => (
              <NavItem
                key={it.href}
                href={it.href}
                label={it.label}
                icon={it.icon}
                active={pathname === it.href}
                badge={it.href === "/admin/struk" ? <PendingStrukBadge /> : undefined}
              />
            ))}
          </nav>
        </aside>

        {/* Drawer mobile */}
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label="Menu admin"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="relative w-72 max-w-[80vw] flex flex-col bg-[var(--surface)]"
              style={{ borderRight: "3px solid var(--ink)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "3px solid var(--ink)" }}
              >
                <span className="font-extrabold">Menu Admin</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="brutal-btn brutal-btn-ghost p-2"
                  aria-label="Tutup menu"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pt-2">
                <div className="sidebar-label">Menu Admin</div>
                <nav className="flex flex-col gap-1 px-3 pb-4">
                  {NAV.map((it) => (
                    <NavItem
                      key={it.href}
                      href={it.href}
                      label={it.label}
                      icon={it.icon}
                      active={pathname === it.href}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</div>
        </main>
      </div>

      <footer
        className="mt-auto bg-[var(--ink)] px-4 py-3 text-center text-xs text-white/60 font-semibold"
      >
        SIDU Admin Panel — {process.env.NEXT_PUBLIC_INSTANCE_NAME ?? "HTN 26"}
      </footer>
    </div>
  );
}
