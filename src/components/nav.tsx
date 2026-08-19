"use client";

import {
  Home,
  MessageCircle,
  CheckCircle2,
  LineChart,
  BookOpen,
  User,
  Sparkles,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { AppView } from "@/lib/types";
import { MOTION } from "@/lib/motion";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  view: AppView;
  label: string;
  icon: LucideIcon;
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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60"
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
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  active && "bg-primary/10"
                )}>
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
  const weeklyReview = useAppStore((s) => s.weeklyReview);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-sidebar h-screen sticky top-0">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.spring }}
            className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-premium-sm"
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Health-First</div>
            <div className="text-[11px] text-muted-foreground">Coach</div>
          </div>
          <ThemeToggle className="ml-auto" />
        </div>
      </div>

      <nav aria-label="Primary" className="px-3 flex-1 overflow-y-auto slim-scroll">
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
                      ? "bg-primary text-primary-foreground shadow-premium-sm"
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

        {/* Secondary nav: Timeline + Weekly Review */}
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <div className="px-3 mb-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
            Your journey
          </div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setView("timeline")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  view === "timeline"
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Calendar className="h-[18px] w-[18px]" />
                Timeline
              </button>
            </li>
            {weeklyReview && (
              <li>
                <button
                  onClick={() => setView("weekly_review")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    view === "weekly_review"
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <LineChart className="h-[18px] w-[18px]" />
                  Week in review
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary pulse-dot" />
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setView("plan_lab")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  view === "plan_lab"
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Sparkles className="h-[18px] w-[18px]" />
                Plan Lab
              </button>
            </li>
          </ul>
        </div>
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
