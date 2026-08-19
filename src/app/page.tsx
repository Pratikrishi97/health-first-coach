"use client";

import { useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";
import { SidebarNav, BottomNav } from "@/components/nav";
import { DemoSwitcher } from "@/components/demo-switcher";
import { LandingView } from "@/components/views/landing-view";
import { OnboardingView } from "@/components/views/onboarding-view";
import { HomeView } from "@/components/views/home-view";
import { CoachView } from "@/components/views/coach-view";
import { HabitsView } from "@/components/views/habits-view";
import { ProgressView } from "@/components/views/progress-view";
import { LearnView } from "@/components/views/learn-view";
import { ProfileView } from "@/components/views/profile-view";
import { PrivacyView } from "@/components/views/privacy-view";
import { DevicesView } from "@/components/views/devices-view";
import { SafetyView } from "@/components/views/safety-view";
import { NudgesView } from "@/components/views/nudges-view";
import { TimelineView } from "@/components/views/timeline-view";
import { WeeklyReviewView } from "@/components/views/weekly-review-view";
import { PlanLabView } from "@/components/views/plan-lab-view";
import { TodayPlanView } from "@/components/views/today-plan-view";
import { RecoveryView } from "@/components/views/recovery-view";
import { LifeContextView } from "@/components/views/life-context-view";
import { PlanView } from "@/components/views/plan-view";
import { cn } from "@/lib/utils";

// ============================================================
// Main page — SPA view router
// ============================================================
// We use a single client component because the entire app
// shares one root store (zustand + localStorage). The "view"
// state decides which top-level screen to render.
// ============================================================

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Home() {
  const view = useAppStore((s) => s.view);
  const profile = useAppStore((s) => s.profile);
  const largeTextMode = useAppStore((s) => s.largeTextMode);
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground animate-pulse">
            <SparklesIcon />
          </div>
          <p className="text-xs text-muted-foreground">Loading your coach…</p>
        </div>
      </div>
    );
  }

  // Landing + Onboarding render as full screens (no app shell)
  if (view === "landing") {
    return (
      <>
        <LandingView />
        <DemoSwitcher />
      </>
    );
  }

  if (view === "onboarding" || !profile) {
    return (
      <>
        <OnboardingView />
        <DemoSwitcher />
      </>
    );
  }

  // Coach view manages its own full-height layout (chat UX)
  if (view === "coach") {
    return (
      <div className="md:flex min-h-screen">
        <SidebarNav />
        <main className={cn("flex-1 min-w-0", largeTextMode && "text-large-mode")}>
          <CoachView />
        </main>
        <BottomNav />
        <DemoSwitcher />
      </div>
    );
  }

  // All other authenticated views share the app shell
  return (
    <div className="md:flex min-h-screen">
      <SidebarNav />
      <main className={cn("flex-1 min-w-0", largeTextMode && "text-large-mode")}>
        {view === "home" && <HomeView />}
        {view === "plan" && <PlanView />}
        {view === "today_plan" && <TodayPlanView />}
        {view === "habits" && <HabitsView />}
        {view === "progress" && <ProgressView />}
        {view === "learn" && <LearnView />}
        {view === "profile" && <ProfileView />}
        {view === "privacy" && <PrivacyView />}
        {view === "devices" && <DevicesView />}
        {view === "safety" && <SafetyView />}
        {view === "nudges" && <NudgesView />}
        {view === "timeline" && <TimelineView />}
        {view === "weekly_review" && <WeeklyReviewView />}
        {view === "plan_lab" && <PlanLabView />}
        {view === "recovery" && <RecoveryView />}
        {view === "life_context" && <LifeContextView />}
      </main>
      <BottomNav />
      <DemoSwitcher />
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
    </svg>
  );
}
