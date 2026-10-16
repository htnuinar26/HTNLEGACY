"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  if (!mounted) return <span className="w-10 h-10" aria-hidden="true" />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="brutal-btn brutal-btn-neutral p-2"
      aria-label={dark ? "Gunakan mode terang" : "Gunakan dark mode"}
      title={dark ? "Mode terang" : "Dark mode"}
    >
      {dark ? <Sun size={17} strokeWidth={2.5} /> : <Moon size={17} strokeWidth={2.5} />}
    </button>
  );
}
