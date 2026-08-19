"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AnalyticsEvent,
  AppView,
  AppState,
  CoachMessage,
  DemoScenario,
  Habit,
  TimelineEvent,
  UserProfile,
} from "./types";
import { buildDemoState } from "./demo-data";
import { getCoachReply } from "./coach-engine";

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
  // new
  startActivity: (habitId: string, title: string, durationMinutes: number) => void;
  tickActivity: () => void;
  completeActivity: () => void;
  cancelActivity: () => void;
  addTimelineEvent: (event: TimelineEvent) => void;
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
      }),
    }
  )
);
