"use client";

import {
  Home,
  MessageCircle,
  CheckCircle2,
  LineChart,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { AppView } from "@/lib/types";

interface NavItem {
  view: AppView;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "coach", label: "Coach", icon: MessageCircle },
  { view: "habits", label: "Habits", icon: CheckCircle2 },
  { view: "progress", label: "Progress", icon: LineChart },
  { view: "learn", label: "Learn", icon: BookOpen },
  { view: "profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          return (
            <li key={item.view} className="flex-1">
              <button
                onClick={() => setView(item.view)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    active && "bg-primary/10"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SidebarNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const profile = useAppStore((s) => s.profile);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Health-First</div>
            <div className="text-[11px] text-muted-foreground">Coach</div>
          </div>
        </div>
      </div>

      <nav aria-label="Primary" className="px-3 flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = view === item.view;
            const Icon = item.icon;
            return (
              <li key={item.view}>
                <button
                  onClick={() => setView(item.view)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {profile && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setView("profile")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
              {profile.name.charAt(0)}
            </div>
            <div className="leading-tight overflow-hidden">
              <div className="text-sm font-medium truncate">{profile.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">View profile</div>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
