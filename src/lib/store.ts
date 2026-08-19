"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AnalyticsEvent,
  AppView,
  AppState,
  CoachMessage,
  CoachMode,
  DemoScenario,
  Habit,
  LifeContext,
  LifeContextType,
  PlanAdaptation,
  PlanAdaptationCascade,
  PlanHierarchy,
  PlanHorizon,
  PlanItem,
  PlanStatus,
  TimelineEvent,
  UserProfile,
} from "./types";
import { buildDemoState } from "./demo-data";
import { getCoachReply } from "./coach-engine";
import { generateAdaptivePlan } from "./adaptation-engine";
import { rescheduleAction, createCascadeAdaptation } from "./planning-engine";

// ============================================================
// Global app store — single source of truth for the prototype
// ============================================================
// Persisted to localStorage so the demo survives refresh.
// Reset via `reset()` or by switching demo scenarios.
// ============================================================

interface StoreActions {
  setView: (view: AppView) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: (profile: UserProfile) => void;
  setProfile: (patch: Partial<UserProfile>) => void;
  toggleHabitToday: (habitId: string) => void;
  adjustHabit: (habitId: string, patch: Partial<Habit>) => void;
  pauseHabit: (habitId: string, paused: boolean) => void;
  replaceHabit: (habitId: string, newHabit: Habit) => void;
  sendCoachMessage: (input: string) => CoachMessage;
  resetCoachConversation: () => void;
  track: (type: string, properties?: Record<string, string | number | boolean>) => void;
  dismissNudge: (nudgeId: string) => void;
  setNudgeFrequency: (freq: AppState["nudgeFrequency"]) => void;
  setPreferredCoachingTime: (t: AppState["preferredCoachingTime"]) => void;
  setWeeklySummaryEnabled: (v: boolean) => void;
  setProgressUpdatesEnabled: (v: boolean) => void;
  setLargeTextMode: (v: boolean) => void;
  toggleDevice: (provider: string) => void;
  loadDemo: (scenario: DemoScenario) => void;
  resetAll: () => void;
  clearData: () => void;
  // activity
  startActivity: (habitId: string, title: string, durationMinutes: number) => void;
  tickActivity: () => void;
  completeActivity: () => void;
  cancelActivity: () => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  // FEATURE 1 — Life-Aware Adaptive Plan
  addLifeContext: (type: LifeContextType, label: string, note?: string) => void;
  removeLifeContext: (id: string) => void;
  acceptPlanAdaptation: () => void;
  rejectPlanAdaptation: () => void;
  togglePlanItem: (itemId: string) => void;
  skipPlanItem: (itemId: string) => void;
  modifyPlanItem: (itemId: string, patch: Partial<PlanItem>) => void;
  regeneratePlan: () => void;
  // FEATURE 2 — Recovery Mode
  acceptRecoveryPlan: () => void;
  skipRecoveryToday: () => void;
  dismissRecovery: () => void;
  // FEATURE 5 — Coach Silence
  setCoachMode: (mode: CoachMode) => void;
  dismissProactiveMessage: (id: string) => void;
  snoozeProactiveMessage: (id: string) => void;
  // FEATURE 6 — Long-Term Adaptive Planning
  setPlanHorizon: (horizon: PlanHorizon) => void;
  adjustMonthlyGoal: (goalId: string, newTarget: number) => void;
  acceptMonthlyAdjustment: (goalId: string) => void;
  rescheduleWeeklyAction: (fromDayId: string, toDayId: string) => void;
  completeWeeklyAction: (dayId: string) => void;
  skipWeeklyAction: (dayId: string) => void;
  triggerCascadeAdaptation: (
    trigger: string,
    todayChange: string,
    weekChange: string,
    monthChange: string,
    quarterChange: string,
    message: string
  ) => void;
}

type Store = AppState & StoreActions;

const initialState: AppState = {
  view: "landing",
  onboardingStep: 0,
  profile: null,
  habits: [],
  metrics: [],
  coachConversation: [],
  insights: [],
  nudges: [],
  content: [],
  timeline: [],
  weeklyReview: null,
  nudgeFrequency: "balanced",
  preferredCoachingTime: "morning",
  weeklySummaryEnabled: true,
  progressUpdatesEnabled: true,
  largeTextMode: false,
  activeActivity: null,
  analyticsEvents: [],
  demoScenario: "new",
  // FEATURE 1 — Life-Aware Adaptive Plan
  lifeContexts: [],
  calendarEvents: [],
  todayPlan: [],
  planAdaptations: [],
  pendingAdaptation: null,
  // FEATURE 2 — Recovery Mode
  recovery: null,
  // FEATURE 3 — Health Interpreter
  recommendations: [],
  healthPatterns: [],
  // FEATURE 5 — Coach Silence
  coachMode: "active",
  proactiveMessages: [],
  // FEATURE 6 — Long-Term Adaptive Planning
  planHierarchy: null,
  planHorizon: "today",
  planningInsights: [],
  cascadeAdaptations: [],
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setView: (view) => {
        set({ view });
        get().track("view_changed", { view });
      },

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      completeOnboarding: (profile) => {
        set({
          profile: { ...profile, onboardingComplete: true },
          view: "home",
        });
        get().track("onboarding_completed", {});
        get().track("plan_created", {});
      },

      setProfile: (patch) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : {})),

      toggleHabitToday: (habitId) => {
        set((s) => {
          const habits = s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const todayIdx = h.history.length - 1;
            const wasCompleted = h.history[todayIdx];
            const newHistory = [...h.history];
            newHistory[todayIdx] = !wasCompleted;
            const newCompletedThisWeek = h.completedThisWeek + (wasCompleted ? -1 : 1);
            const newStreak = wasCompleted ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1;
            return {
              ...h,
              history: newHistory,
              completedThisWeek: newCompletedThisWeek,
              currentStreak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
            };
          });
          return { habits };
        });
        const habit = get().habits.find((h) => h.id === habitId);
        const completed = habit?.history[habit.history.length - 1];
        get().track(completed ? "habit_completed" : "habit_missed", { habitId });
      },

      adjustHabit: (habitId, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === habitId ? { ...h, ...patch } : h)),
        })),

      pauseHabit: (habitId, paused) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === habitId ? { ...h, paused } : h)),
        }));
        get().track("habit_paused", { habitId, paused });
      },

      replaceHabit: (habitId, newHabit) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === habitId ? newHabit : h)),
        })),

      sendCoachMessage: (input) => {
        const userMsg: CoachMessage = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: input,
          createdAt: new Date().toISOString(),
        };
        const reply = getCoachReply(input, get());
        const coachMsg: CoachMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "coach",
          content: reply.text,
          createdAt: new Date().toISOString(),
          meta: {
            suggestion: reply.suggestion,
            safety: reply.safetyFlag,
            insight: reply.insight,
          },
        };
        set((s) => ({
          coachConversation: [...s.coachConversation, userMsg, coachMsg],
        }));
        get().track("coach_message_sent", { input_length: input.length });
        if (reply.safetyFlag !== "none") {
          get().track("escalation_triggered", { flag: reply.safetyFlag });
        }
        return coachMsg;
      },

      resetCoachConversation: () => set({ coachConversation: [] }),

      track: (type, properties = {}) =>
        set((s) => ({
          analyticsEvents: [
            ...s.analyticsEvents.slice(-200),
            { type, timestamp: new Date().toISOString(), properties },
          ],
        })),

      dismissNudge: (nudgeId) => {
        set((s) => ({
          nudges: s.nudges.map((n) => (n.id === nudgeId ? { ...n, dismissed: true } : n)),
        }));
        get().track("nudge_dismissed", { nudgeId });
      },

      setNudgeFrequency: (freq) => set({ nudgeFrequency: freq }),
      setPreferredCoachingTime: (t) => set({ preferredCoachingTime: t }),
      setWeeklySummaryEnabled: (v) => set({ weeklySummaryEnabled: v }),
      setProgressUpdatesEnabled: (v) => set({ progressUpdatesEnabled: v }),
      setLargeTextMode: (v) => set({ largeTextMode: v }),

      toggleDevice: (provider) => {
        set((s) =>
          s.profile
            ? {
                profile: {
                  ...s.profile,
                  devices: s.profile.devices.map((d) =>
                    d.provider === provider
                      ? {
                          ...d,
                          connected: !d.connected,
                          lastSyncedAt: !d.connected ? new Date().toISOString() : null,
                        }
                      : d
                  ),
                },
              }
            : {}
        );
        get().track("device_connected", { provider });
      },

      loadDemo: (scenario) => {
        const demo = buildDemoState(scenario);
        set({ ...demo, view: "home" });
        get().track("demo_loaded", { scenario });
      },

      resetAll: () => {
        set({ ...initialState });
        get().track("app_reset", {});
      },

      clearData: () => {
        set({
          profile: null,
          habits: [],
          metrics: [],
          coachConversation: [],
          timeline: [],
          weeklyReview: null,
          activeActivity: null,
          view: "landing",
          onboardingStep: 0,
        });
        get().track("data_deleted", {});
      },

      startActivity: (habitId, title, durationMinutes) => {
        const active: AppState["activeActivity"] = {
          habitId,
          title,
          durationMinutes,
          startedAt: new Date().toISOString(),
          progressMinutes: 0,
          completed: false,
        };
        set({ activeActivity: active });
        get().track("next_best_action_clicked", { habitId, title });
      },

      tickActivity: () => {
        set((s) => {
          if (!s.activeActivity || s.activeActivity.completed) return {};
          const newProgress = s.activeActivity.progressMinutes + 1;
          if (newProgress >= s.activeActivity.durationMinutes) {
            return {
              activeActivity: {
                ...s.activeActivity,
                progressMinutes: s.activeActivity.durationMinutes,
                completed: true,
              },
            };
          }
          return {
            activeActivity: { ...s.activeActivity, progressMinutes: newProgress },
          };
        });
      },

      completeActivity: () => {
        const active = get().activeActivity;
        if (active) {
          // Mark the habit complete
          get().toggleHabitToday(active.habitId);
          // Add a timeline event
          get().addTimelineEvent({
            id: `t-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            type: "goal_completed",
            title: `Completed ${active.title}`,
            description: `Finished your ${active.durationMinutes}-minute session.`,
            icon: "check",
          });
          get().track("habit_completed", { habitId: active.habitId, source: "next_best_action" });
        }
        set({ activeActivity: null });
      },

      cancelActivity: () => set({ activeActivity: null }),

      addTimelineEvent: (event) =>
        set((s) => ({ timeline: [event, ...s.timeline] })),

      // FEATURE 1 — Life-Aware Adaptive Plan
      addLifeContext: (type, label, note) => {
        const ctx: LifeContext = {
          id: `lc-${Date.now()}`,
          type,
          label,
          note,
          date: new Date().toISOString().slice(0, 10),
          addedAt: new Date().toISOString(),
        };
        set((s) => ({ lifeContexts: [...s.lifeContexts, ctx] }));
        get().track("life_context_added", { type, label });
        // Auto-regenerate plan with new context
        get().regeneratePlan();
      },

      removeLifeContext: (id) => {
        set((s) => ({ lifeContexts: s.lifeContexts.filter((c) => c.id !== id) }));
        get().regeneratePlan();
      },

      acceptPlanAdaptation: () => {
        const pending = get().pendingAdaptation;
        if (pending) {
          set((s) => ({
            pendingAdaptation: null,
            planAdaptations: [...s.planAdaptations, { ...pending, accepted: true }],
          }));
          get().track("plan_adaptation_accepted", { trigger: pending.trigger });
          get().addTimelineEvent({
            id: `t-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            type: "plan_adapted",
            title: `Plan adapted: ${pending.triggerLabel}`,
            description: pending.changes.map((c) => c.what).join(". "),
            icon: "plan",
          });
        }
      },

      rejectPlanAdaptation: () => {
        const pending = get().pendingAdaptation;
        if (pending) {
          set((s) => ({
            pendingAdaptation: null,
            planAdaptations: [...s.planAdaptations, { ...pending, accepted: false }],
          }));
          get().track("plan_adaptation_rejected", { trigger: pending.trigger });
        }
      },

      togglePlanItem: (itemId) => {
        set((s) => ({
          todayPlan: s.todayPlan.map((p) =>
            p.id === itemId ? { ...p, completed: !p.completed, skipped: false } : p
          ),
        }));
        const item = get().todayPlan.find((p) => p.id === itemId);
        if (item) {
          get().track(item.completed ? "habit_completed" : "habit_missed", { itemId });
          if (item.completed) {
            get().addTimelineEvent({
              id: `t-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              type: "goal_completed",
              title: `Completed ${item.title}`,
              description: `${item.durationMin}-minute session finished.`,
              icon: "check",
            });
          }
        }
      },

      skipPlanItem: (itemId) => {
        set((s) => ({
          todayPlan: s.todayPlan.map((p) =>
            p.id === itemId ? { ...p, skipped: true, completed: false } : p
          ),
        }));
        get().track("habit_skipped", { itemId });
      },

      modifyPlanItem: (itemId, patch) => {
        set((s) => ({
          todayPlan: s.todayPlan.map((p) =>
            p.id === itemId ? { ...p, ...patch, adapted: true } : p
          ),
        }));
        get().track("plan_item_modified", { itemId });
      },

      regeneratePlan: () => {
        // Regenerate plan using the adaptation engine based on current state
        const result = generateAdaptivePlan(get());
        set((s) => ({
          todayPlan: result.plan,
          pendingAdaptation: result.adaptation,
        }));
        if (result.adaptation) {
          get().track("plan_adapted", { trigger: result.adaptation.trigger });
        }
      },

      // FEATURE 2 — Recovery Mode
      acceptRecoveryPlan: () => {
        const recovery = get().recovery;
        if (recovery) {
          set({ recovery: { ...recovery, active: true } });
          get().track("recovery_plan_accepted", { trigger: recovery.trigger });
          // Set coach mode to recovery
          get().setCoachMode("recovery");
        }
      },

      skipRecoveryToday: () => {
        const recovery = get().recovery;
        if (recovery) {
          const plan = [...recovery.plan];
          if (plan[0]) plan[0] = { ...plan[0], completed: false };
          set({ recovery: { ...recovery, plan } });
          get().track("recovery_skipped_today", {});
        }
      },

      dismissRecovery: () => {
        set({ recovery: null });
        get().track("recovery_dismissed", {});
      },

      // FEATURE 5 — Coach Silence + Trust Layer
      setCoachMode: (mode) => {
        set({ coachMode: mode });
        get().track(mode === "off" ? "coach_silenced" : "coach_reenabled", { mode });
      },

      dismissProactiveMessage: (id) => {
        set((s) => ({
          proactiveMessages: s.proactiveMessages.map((m) =>
            m.id === id ? { ...m, dismissed: true } : m
          ),
        }));
        get().track("nudge_dismissed", { id });
      },

      snoozeProactiveMessage: (id) => {
        const snoozedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        set((s) => ({
          proactiveMessages: s.proactiveMessages.map((m) =>
            m.id === id ? { ...m, snoozedUntil } : m
          ),
        }));
        get().track("nudge_snoozed", { id });
      },

      // FEATURE 6 — Long-Term Adaptive Planning
      setPlanHorizon: (horizon) => {
        set({ planHorizon: horizon });
        get().track("plan_viewed", { horizon });
      },

      adjustMonthlyGoal: (goalId, newTarget) => {
        set((s) => {
          if (!s.planHierarchy) return {};
          const milestones = s.planHierarchy.quarter.milestones.map((m) => ({
            ...m,
            goals: m.goals.map((g) =>
              g.id === goalId
                ? { ...g, target: newTarget, status: newTarget <= g.current ? "on_track" as PlanStatus : g.status, adjustmentRecommended: undefined }
                : g
            ),
          }));
          return {
            planHierarchy: {
              ...s.planHierarchy,
              quarter: { ...s.planHierarchy.quarter, milestones },
              currentMonth: milestones.find((m) => m.current) ?? s.planHierarchy.currentMonth,
            },
          };
        });
        get().track("goal_adjusted", { goalId, newTarget });
      },

      acceptMonthlyAdjustment: (goalId) => {
        const state = get();
        if (!state.planHierarchy) return;
        const goal = state.planHierarchy.currentMonth.goals.find((g) => g.id === goalId);
        if (goal?.adjustmentRecommended) {
          get().adjustMonthlyGoal(goalId, goal.adjustmentRecommended.newTarget);
          get().track("monthly_plan_accepted", { goalId });
        }
      },

      rescheduleWeeklyAction: (fromDayId, toDayId) => {
        set((s) => {
          if (!s.planHierarchy) return {};
          const newWeek = rescheduleAction(s.planHierarchy.currentWeek, fromDayId, toDayId);
          return {
            planHierarchy: {
              ...s.planHierarchy,
              currentWeek: newWeek,
            },
          };
        });
        get().track("plan_item_rescheduled", { fromDayId, toDayId });
      },

      completeWeeklyAction: (dayId) => {
        set((s) => {
          if (!s.planHierarchy) return {};
          const newWeek = {
            ...s.planHierarchy.currentWeek,
            days: s.planHierarchy.currentWeek.days.map((d) =>
              d.id === dayId ? { ...d, completed: true, skipped: false } : d
            ),
            completedSessions: s.planHierarchy.currentWeek.completedSessions + 1,
          };
          return {
            planHierarchy: { ...s.planHierarchy, currentWeek: newWeek },
          };
        });
        get().track("plan_item_completed", { dayId });
      },

      skipWeeklyAction: (dayId) => {
        set((s) => {
          if (!s.planHierarchy) return {};
          const newWeek = {
            ...s.planHierarchy.currentWeek,
            days: s.planHierarchy.currentWeek.days.map((d) =>
              d.id === dayId ? { ...d, skipped: true, completed: false, adapted: true, adaptationReason: "Skipped by user" } : d
            ),
          };
          return {
            planHierarchy: { ...s.planHierarchy, currentWeek: newWeek },
          };
        });
        get().track("plan_item_skipped", { dayId });
      },

      triggerCascadeAdaptation: (trigger, todayChange, weekChange, monthChange, quarterChange, message) => {
        const cascade = createCascadeAdaptation(trigger, todayChange, weekChange, monthChange, quarterChange, message);
        set((s) => ({
          cascadeAdaptations: [cascade, ...s.cascadeAdaptations].slice(0, 10),
        }));
        get().track("plan_adapted", { trigger });
      },
    }),
    {
      name: "health-first-coach",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        view: s.view,
        onboardingStep: s.onboardingStep,
        profile: s.profile,
        habits: s.habits,
        metrics: s.metrics,
        coachConversation: s.coachConversation,
        insights: s.insights,
        nudges: s.nudges,
        content: s.content,
        timeline: s.timeline,
        weeklyReview: s.weeklyReview,
        nudgeFrequency: s.nudgeFrequency,
        preferredCoachingTime: s.preferredCoachingTime,
        weeklySummaryEnabled: s.weeklySummaryEnabled,
        progressUpdatesEnabled: s.progressUpdatesEnabled,
        largeTextMode: s.largeTextMode,
        activeActivity: s.activeActivity,
        analyticsEvents: s.analyticsEvents.slice(-50),
        demoScenario: s.demoScenario,
        lifeContexts: s.lifeContexts,
        calendarEvents: s.calendarEvents,
        todayPlan: s.todayPlan,
        planAdaptations: s.planAdaptations,
        pendingAdaptation: s.pendingAdaptation,
        recovery: s.recovery,
        recommendations: s.recommendations,
        healthPatterns: s.healthPatterns,
        coachMode: s.coachMode,
        proactiveMessages: s.proactiveMessages,
        planHierarchy: s.planHierarchy,
        planHorizon: s.planHorizon,
        planningInsights: s.planningInsights,
        cascadeAdaptations: s.cascadeAdaptations,
      }),
    }
  )
);
