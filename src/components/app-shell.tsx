"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  QrCode,
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { label: "Beranda", href: "/beranda", icon: Home },
  { label: "Profil Saya", href: "/profil", icon: User },
  { label: "Barcode", href: "/barcode", icon: QrCode },
];

const DAFTAR = [
  { label: "Lunas", href: "/daftar/lunas", icon: CheckCircle2 },
  { label: "Belum Lunas", href: "/daftar/belum-lunas", icon: CircleDashed },
  { label: "Tertunggak", href: "/daftar/tertunggak", icon: AlertTriangle },
];

const KEUANGAN = [
  { label: "Grafik Kas", href: "/kas", icon: BarChart3 },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onNavigate?: () => void;
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
    </Link>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3 pb-4">
      <div className="sidebar-label">Navigasi</div>
      {NAV.map((it) => (
        <NavItem
          key={it.href}
          href={it.href}
          label={it.label}
          icon={it.icon}
          active={pathname === it.href}
          onNavigate={onNavigate}
        />
      ))}

      <div className="sidebar-label">Daftar Anggota</div>
      {DAFTAR.map((it) => (
        <NavItem
          key={it.href}
          href={it.href}
          label={it.label}
          icon={it.icon}
          active={pathname === it.href}
          onNavigate={onNavigate}
        />
      ))}

      <div className="sidebar-label">Keuangan</div>
      {KEUANGAN.map((it) => (
        <NavItem
          key={it.href}
          href={it.href}
          label={it.label}
          icon={it.icon}
          active={pathname === it.href}
          onNavigate={onNavigate}
        />
      ))}

      <div className="sidebar-label">Admin</div>
      <Link
        href="/admin"
        onClick={onNavigate}
        className={cn("sidebar-item", pathname.startsWith("/admin") && "sidebar-item-active")}
      >
        <Shield size={20} strokeWidth={2} />
        <span>Panel Admin</span>
      </Link>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-[var(--surface)]"
        style={{ borderBottom: "3px solid var(--ink)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="brutal-btn brutal-btn-neutral p-2 md:hidden"
            aria-label="Buka menu navigasi"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <Link href="/beranda" className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{
                background: "var(--accent-primary)",
                border: "3px solid var(--ink)",
                borderRadius: 8,
                boxShadow: "3px 3px 0px var(--ink)",
              }}
            >
              <BrandLogo size={34} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base">SIDU</span>
              <span className="text-[10px] font-semibold text-[#6b6b6b] -mt-0.5">
                {process.env.NEXT_PUBLIC_INSTANCE_NAME ?? "HTN 26"}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="brutal-btn brutal-btn-neutral px-3 py-2 text-sm"
            aria-label="Keluar"
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
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Drawer mobile */}
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
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
                <span className="font-extrabold">Menu</span>
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
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setDrawerOpen(false)}
                />
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
        className="mt-auto bg-[var(--surface)] px-4 py-3 text-center text-xs text-[#6b6b6b] font-semibold"
        style={{ borderTop: "3px solid var(--ink)" }}
      >
        SIDU — {process.env.NEXT_PUBLIC_INSTANCE_NAME ?? "HTN 26"} · Sistem Iuran Kas Bulanan
      </footer>
    </div>
  );
}
