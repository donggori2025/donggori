"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, LayoutTemplate, Library, PanelLeft, PanelLeftClose, Search, Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { WorkspacePanel } from "./workspace-switcher";

const NAV = [
  { href: "/dashboard", label: "대시보드", icon: LayoutGrid },
  { href: "/templates", label: "템플릿", icon: LayoutTemplate },
  { href: "/library", label: "라이브러리", icon: Library },
  { href: "/trash", label: "휴지통", icon: Trash2 },
];

const SHELL_COLLAPSE_KEY = "faddit-shell-collapsed";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { workspaceProducts, currentWorkspace } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SHELL_COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHELL_COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return workspaceProducts.slice(0, 6);
    return workspaceProducts.filter((p) =>
      [p.name, p.code, p.status, p.factory, currentWorkspace.name].join(" ").toLowerCase().includes(query),
    );
  }, [q, workspaceProducts, currentWorkspace.name]);

  const hideChrome =
    pathname === "/" || pathname.startsWith("/products/") || pathname.startsWith("/share/");
  const fillViewport = pathname.startsWith("/products/");

  return (
    <div className="grain flex h-full overflow-hidden bg-paper text-ink">
      {!hideChrome && (
        <aside
          className={cn(
            "flex shrink-0 flex-col overflow-visible border-r border-mist bg-snow/80 transition-[width] duration-200",
            collapsed ? "w-[56px]" : "w-[220px]",
          )}
        >
          <UserMenu unread collapsed={collapsed} />
          <nav className={cn("flex flex-col gap-0.5 pt-2", collapsed ? "items-center px-1" : "px-3")}>
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center rounded-xl text-[13px] transition-colors",
                    collapsed ? "h-9 w-9 justify-center" : "gap-2.5 px-3 py-2",
                    active ? "bg-paper text-ink" : "text-stone hover:bg-paper hover:text-ink",
                  )}
                >
                  <Icon size={15} strokeWidth={1.7} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
          <WorkspacePanel collapsed={collapsed} />
          <div className={cn("mt-auto pb-3", collapsed ? "flex justify-center px-1" : "px-3")}>
            <button
              type="button"
              title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              onClick={toggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone hover:bg-paper hover:text-ink"
            >
              {collapsed ? <PanelLeft size={15} strokeWidth={1.7} /> : <PanelLeftClose size={15} strokeWidth={1.7} />}
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!hideChrome && (
          <header className="flex h-14 shrink-0 items-center border-b border-mist bg-snow/70 px-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-[280px] items-center gap-2 rounded-full border border-mist bg-paper px-3 text-[12px] text-stone"
            >
              <Search size={13} />
              제품, 원단, 담당자 검색
              <span className="ml-auto rounded-md bg-mist px-1.5 py-0.5 text-[10px] text-stone">⌘K</span>
            </button>
          </header>
        )}
        <main className={cn("min-h-0 flex-1", fillViewport ? "overflow-hidden" : "overflow-auto")}>{children}</main>
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-[2px]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-[520px] overflow-hidden rounded-2xl border border-mist bg-snow shadow-[0_20px_60px_rgba(26,25,22,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-mist px-4">
              <Search size={14} className="text-stone" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hoodie, 26SS-HD-01, Cotton 420g…"
                className="h-12 w-full bg-transparent text-[14px] outline-none"
              />
            </div>
            <div className="max-h-[360px] overflow-auto p-2">
              {results.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-stone">검색 결과가 없습니다</p>}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/products/${p.id}`);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-paper"
                >
                  <div>
                    <p className="text-[13px] font-medium">{p.name}</p>
                    <p className="text-[11px] text-stone">{p.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
