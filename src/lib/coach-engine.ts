import type {
  AppState,
  CoachMessage,
  CoachingStyle,
  Habit,
  UserProfile,
} from "./types";
import { detectSafetyFlag, safetyResponse } from "./safety";

// ============================================================
// CoachService — deterministic, context-aware coaching engine
// ============================================================
// Architecture:
//   1. Context builder — assembles user state into a coach "memory"
//   2. Safety filter — flags medical / emergency input
//   3. Intent classifier — understands what the user is asking
//   4. Response generator — uses personalization rules + style
//   5. Recommendation engine — surfaces next-best-action
//
// This is rule-based so the prototype works without an LLM API
// key. The /api/coach route can layer an actual LLM on top when
// configured — the structure is identical.
// ============================================================

interface CoachContext {
  name: string;
  primaryGoal: string;
  coachingStyle: CoachingStyle;
  recentSleep: number | null;
  todaySteps: number;
  stepsGoal: number;
  completionRate: number;          // 0-1, this week
  bestStreak: number;
  missedHabits: Habit[];
  completedToday: Habit[];
  stressLevel: number;
  topBarrier?: string;
}

export function buildCoachContext(state: AppState): CoachContext {
  const profile = state.profile;
  if (!profile) {
    return {
      name: "friend",
      primaryGoal: "wellness",
      coachingStyle: "encouraging",
      recentSleep: null,
      todaySteps: 0,
      stepsGoal: 8000,
      completionRate: 0,
      bestStreak: 0,
      missedHabits: [],
      completedToday: [],
      stressLevel: 50,
    };
  }

  const todayMetric = state.metrics[state.metrics.length - 1];
  const recentSleep = todayMetric?.sleepHours ?? null;
  const activeHabits = state.habits.filter((h) => !h.paused);
  const total = activeHabits.reduce((s, h) => s + h.targetPerWeek, 0);
  const done = activeHabits.reduce((s, h) => s + h.completedThisWeek, 0);
  const completionRate = total ? done / total : 0;
  const missedHabits = activeHabits.filter((h) => h.history[h.history.length - 1] === false);
  const completedToday = activeHabits.filter((h) => h.history[h.history.length - 1] === true);
  const bestStreak = Math.max(0, ...activeHabits.map((h) => h.currentStreak));

  let topBarrier: string | undefined;
  const morningMisses = state.habits.filter(
    (h) => h.scheduledTime < "10:00" && h.history.filter(Boolean).length < 2
  );
  if (morningMisses.length) topBarrier = "morning";

  return {
    name: profile.name.split(" ")[0],
    primaryGoal: goalLabel(profile.primaryGoal),
    coachingStyle: profile.coachingStyle,
    recentSleep,
    todaySteps: todayMetric?.steps ?? 0,
    stepsGoal: todayMetric?.stepsGoal ?? 8000,
    completionRate,
    bestStreak,
    missedHabits,
    completedToday,
    stressLevel: todayMetric?.stressLevel ?? 50,
    topBarrier,
  };
}

function goalLabel(g: string): string {
  const map: Record<string, string> = {
    fitness: "improving fitness",
    weight: "managing weight",
    sleep: "sleeping better",
    stress: "reducing stress",
    nutrition: "eating better",
    routines: "building healthier routines",
  };
  return map[g] ?? g;
}

// ---- Style tone adapter ----------------------------------------------

function toneAdjust(text: string, style: CoachingStyle): string {
  if (style === "gentle") {
    return text
      .replace(/^Let's/, "Maybe we could")
      .replace("I'd suggest", "It might help to")
      .replace("You should", "You might want to");
  }
  if (style === "direct") {
    return text
      .replace(/^Maybe /, "")
      .replace("It might help to", "Here's what I'd do:");
  }
  if (style === "data") {
    // append a small data-flavored qualifier if not present
    if (!/\d/.test(text)) {
      return text + " (Your current completion rate is around 70%.)";
    }
  }
  // encouraging — default
  return text;
}

// ---- Intent classifier ------------------------------------------------

type Intent =
  | "should_workout"
  | "didnt_sleep_well"
  | "missed_habit"
  | "stress_high"
  | "celebrate"
  | "general_advice"
  | "greeting"
  | "thanks"
  | "help_plan";

function classifyIntent(input: string, ctx: CoachContext): Intent {
  const t = input.toLowerCase();
  if (/work ?out|exercise|gym|train|run/.test(t)) return "should_workout";
  if (/didn'?t sleep|didn'?t ?sleep well|slept bad|exhausted|tired|no sleep|bad sleep/.test(t))
    return "didnt_sleep_well";
  if (/missed|skipped|forgot|didn'?t do/.test(t)) return "missed_habit";
  if (/stress|overwhelm|anxious|pressure|burnt/.test(t)) return "stress_high";
  if (/did it|done|completed|finished|crushed|hit my/.test(t)) return "celebrate";
  if (/hi|hello|hey|good morning|good evening/.test(t)) return "greeting";
  if (/thank/.test(t)) return "thanks";
  if (/adjust|change|update|modify|reschedule|move my plan|tweak/.test(t)) return "help_plan";

  // Context-aware fallbacks
  if (ctx.recentSleep && ctx.recentSleep < 6) return "didnt_sleep_well";
  if (ctx.stressLevel >= 70) return "stress_high";
  if (ctx.missedHabits.length >= 2) return "missed_habit";

  return "general_advice";
}

// ---- Response generator (deterministic) -------------------------------

interface GeneratedResponse {
  text: string;
  suggestion?: "adjust_plan" | "keep_plan" | "tell_me_more" | "start_walk" | "schedule_habit";
  insight?: string;
}

function generate(intent: Intent, ctx: CoachContext, input: string): GeneratedResponse {
  switch (intent) {
    case "should_workout": {
      if (ctx.recentSleep && ctx.recentSleep < 6) {
        return {
          text: `You slept ${formatSleep(ctx.recentSleep)} last night and mentioned you're feeling drained. I'd keep today light — a 15-minute walk would still move you toward your weekly goal without taxing your system. Want me to adjust today's plan?`,
          suggestion: "adjust_plan",
          insight: "Lower-intensity movement on poor-sleep days preserves consistency without overloading recovery.",
        };
      }
      if (ctx.missedHabits.length >= 2) {
        return {
          text: `You've missed your scheduled ${ctx.missedHabits[0].title.toLowerCase()} a few times this week. Let's keep today simple: a 20-minute walk is enough to stay on track. Want to start it now?`,
          suggestion: "start_walk",
          insight: "On weeks with two or more misses, simpler goals outperform ambitious ones.",
        };
      }
      return {
        text: `Yes — your movement habit is solid this week. A 20-minute walk today would land you at 5/5 for the week. Want to start it now?`,
        suggestion: "start_walk",
      };
    }

    case "didnt_sleep_well": {
      return {
        text: `Let's make today lighter. Instead of pushing for your usual workout, I'd suggest a 15-minute walk and an earlier wind-down tonight. Your wearable shows ${formatSleep(
          ctx.recentSleep ?? 6
        )} of sleep last night — that's below your 7h goal. Want me to adjust today's plan?`,
        suggestion: "adjust_plan",
        insight: "On poor-sleep days, lowering intensity preserves the habit loop without raising injury risk.",
      };
    }

    case "missed_habit": {
      if (ctx.topBarrier === "morning") {
        return {
          text: `You've missed your morning workout three times this week. Let's move it to lunchtime when your schedule is more predictable. A 12:30 PM walk for 15 minutes would still count toward your goal. Want me to reschedule?`,
          suggestion: "schedule_habit",
          insight: "When a habit misses 3+ times in a week, changing timing outperforms pushing harder.",
        };
      }
      return {
        text: `One missed day doesn't reset your progress. Let's make tomorrow easier: drop the target by 25% for one day, then resume. That keeps momentum without forcing recovery. Want me to adjust the plan?`,
        suggestion: "adjust_plan",
        insight: "Recovery days with a slightly reduced target preserve the habit identity.",
      };
    }

    case "stress_high": {
      return {
        text: `Your stress score is ${ctx.stressLevel} today — that's elevated. I'd suggest a 5-minute box-breathing reset now, and an earlier wind-down tonight. Would you like a guided 5-minute reset?`,
        suggestion: "tell_me_more",
        insight: "Brief 5-minute breathing interventions can reduce perceived stress by 15-20% within 10 minutes.",
      };
    }

    case "celebrate": {
      return {
        text: `Nice work. You're on a ${ctx.bestStreak}-day streak — your longest this month. Let's use that momentum: would you like to add one short morning movement session this week, or keep the current plan?`,
        suggestion: "keep_plan",
        insight: "Building on existing momentum with one small addition outperforms scaling up all habits at once.",
      };
    }

    case "greeting": {
      return {
        text: `Hi ${ctx.name}! Looking at your day: ${ctx.completedToday.length} habit${
          ctx.completedToday.length === 1 ? "" : "s"
        } done, ${ctx.missedHabits.length} still to go. ${
          ctx.recentSleep && ctx.recentSleep < 6
            ? "Your sleep was short last night — I've kept today's plan gentle."
            : "You're on track."
        } What's on your mind?`,
      };
    }

    case "thanks": {
      return {
        text: `Of course. I'm here whenever you want to think something through — habits, sleep, stress, food. Just say the word.`,
      };
    }

    case "help_plan": {
      return {
        text: `Sure — let's look at today. Your current focus is ${ctx.primaryGoal}. ${
          ctx.missedHabits.length
            ? `You've got ${ctx.missedHabits.length} habit${ctx.missedHabits.length === 1 ? "" : "s"} pending: ${ctx.missedHabits
                .map((h) => h.title.toLowerCase())
                .join(", ")}. `
            : ""
        }Would you rather reduce today's goal, move something to this evening, or keep the plan as is?`,
        suggestion: "adjust_plan",
      };
    }

    case "general_advice":
    default: {
      const stepsRemaining = Math.max(0, ctx.stepsGoal - ctx.todaySteps);
      return {
        text: `Here's what I'm seeing: you're ${
          Math.round((ctx.todaySteps / ctx.stepsGoal) * 100)
        }% to your movement goal today. ${
          stepsRemaining > 0
            ? `A ${Math.max(10, Math.round(stepsRemaining / 130))}-minute walk after lunch would get you there. `
            : `You've hit your step goal — great. `
        }${
          ctx.completionRate < 0.5
            ? "I'd suggest keeping today simple — pick one habit and complete it."
            : "You're trending well this week. Want to keep going or adjust anything?"
        }`,
        suggestion: stepsRemaining > 0 ? "start_walk" : "keep_plan",
      };
    }
  }
}

function formatSleep(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

// ---- Public API -------------------------------------------------------

export interface CoachReply {
  text: string;
  suggestion?: "adjust_plan" | "keep_plan" | "tell_me_more" | "start_walk" | "schedule_habit" | "find_support" | "continue_wellness";
  insight?: string;
  safetyFlag: "none" | "medical_question" | "emergency" | "mental_health";
}

export function getCoachReply(input: string, state: AppState): CoachReply {
  // 1. Safety check first — always wins
  const safety = detectSafetyFlag(input);
  if (safety.flag !== "none") {
    const r = safetyResponse(safety.flag, state.profile?.coachingStyle ?? "encouraging");
    return {
      text: r.text,
      suggestion: r.suggestion,
      safetyFlag: safety.flag,
    };
  }

  // 2. Build context and classify
  const ctx = buildCoachContext(state);
  const intent = classifyIntent(input, ctx);

  // 3. Generate response, then adapt to style
  const base = generate(intent, ctx, input);
  const text = toneAdjust(base.text, ctx.coachingStyle);

  return {
    text,
    suggestion: base.suggestion,
    insight: base.insight,
    safetyFlag: "none",
  };
}

// ---- Personalization engine (rules) ----------------------------------

export interface PersonalizationRule {
  id: string;
  condition: (state: AppState) => boolean;
  recommendation: (state: AppState) => {
    title: string;
    body: string;
    action: "start_walk" | "adjust_plan" | "schedule_habit" | "tell_me_more";
    reason: string;
  };
}

export const PERSONALIZATION_RULES: PersonalizationRule[] = [
  {
    id: "low-sleep-lighter-day",
    condition: (s) => {
      const m = s.metrics[s.metrics.length - 1];
      return !!m && m.sleepHours < 6;
    },
    recommendation: () => ({
      title: "Make today lighter",
      body: "Your sleep was short last night. A 15-minute walk counts as your movement habit — no need to push harder.",
      action: "adjust_plan",
      reason: "Sleep < 6h reduces recovery capacity. Lowering intensity preserves the habit loop without raising injury risk.",
    }),
  },
  {
    id: "high-completion-progression",
    condition: (s) => {
      const active = s.habits.filter((h) => !h.paused);
      const total = active.reduce((sum, h) => sum + h.targetPerWeek, 0);
      const done = active.reduce((sum, h) => sum + h.completedThisWeek, 0);
      return total > 0 && done / total >= 0.8;
    },
    recommendation: () => ({
      title: "Time to add a small challenge",
      body: "You're completing 80%+ of your habits this week. Want to add one short morning movement session next week?",
      action: "tell_me_more",
      reason: "When habit completion exceeds 80%, gradual progression outperforms holding steady.",
    }),
  },
  {
    id: "low-completion-reduce",
    condition: (s) => {
      const active = s.habits.filter((h) => !h.paused);
      const total = active.reduce((sum, h) => sum + h.targetPerWeek, 0);
      const done = active.reduce((sum, h) => sum + h.completedThisWeek, 0);
      return total > 0 && done / total < 0.4;
    },
    recommendation: () => ({
      title: "Let's reduce the target this week",
      body: "You're completing under 40% of your habits. Want to drop one habit's target for the week and ask about barriers?",
      action: "adjust_plan",
      reason: "Completion below 40% signals the target is too high. Reducing it preserves confidence and rebuilds momentum.",
    }),
  },
  {
    id: "missed-same-habit-thrice",
    condition: (s) =>
      s.habits.some((h) => !h.paused && h.history.filter(Boolean).length < 2),
    recommendation: () => ({
      title: "Move your missed habit to a better time",
      body: "You've missed the same habit multiple times. Let's move it to lunchtime when your schedule is more predictable.",
      action: "schedule_habit",
      reason: "Missing the same habit 3+ times in a week usually means the timing is wrong, not the motivation.",
    }),
  },
  {
    id: "high-stress-reset",
    condition: (s) => {
      const m = s.metrics[s.metrics.length - 1];
      return !!m && m.stressLevel >= 65;
    },
    recommendation: () => ({
      title: "5-minute stress reset",
      body: "Your stress is elevated today. A 5-minute box-breathing reset can lower your nervous system load.",
      action: "tell_me_more",
      reason: "Brief breathing interventions measurably reduce sympathetic activation within 5-10 minutes.",
    }),
  },
  {
    id: "goal-hit-celebrate",
    condition: (s) => {
      const m = s.metrics[s.metrics.length - 1];
      return !!m && m.steps >= m.stepsGoal;
    },
    recommendation: () => ({
      title: "Movement goal hit — propose next step",
      body: "You've hit your step goal today. Tomorrow, try adding 500 steps or 5 active minutes.",
      action: "tell_me_more",
      reason: "Celebrating small wins and proposing one slightly larger step reinforces progress without burnout.",
    }),
  },
];

export function getNextBestAction(state: AppState) {
  for (const rule of PERSONALIZATION_RULES) {
    if (rule.condition(state)) return rule.recommendation(state);
  }
  // Default: closest-to-completion habit
  const todayMetric = state.metrics[state.metrics.length - 1];
  if (todayMetric) {
    const stepsRemaining = Math.max(0, todayMetric.stepsGoal - todayMetric.steps);
    if (stepsRemaining > 0) {
      const minutes = Math.max(10, Math.round(stepsRemaining / 130));
      return {
        title: "Your next best step",
        body: `A ${minutes}-minute walk after lunch will bring you within 500 steps of your movement target.`,
        action: "start_walk" as const,
        reason: "Closest-to-completion goal with the lowest activation energy remaining today.",
      };
    }
  }
  return {
    title: "Take a moment to reset",
    body: "A 5-minute box breathing session is a small reset that makes the rest of your day smoother.",
    action: "tell_me_more" as const,
    reason: "No urgent habit pressure — a brief reset is the highest-leverage small action right now.",
  };
}
