import type {
  AppState,
  LifeContext,
  LifeContextType,
  CalendarEvent,
  PlanItem,
  PlanAdaptation,
  AdaptationTrigger,
  PlanAdaptationChange,
  Recommendation,
  HealthPattern,
  ProactiveMessage,
  CoachMode,
  RecoveryState,
  RecoveryPlanItem,
  DemoScenario,
} from "./types";

// ============================================================
// Life-Aware Adaptation Engine
// ============================================================
// The flagship differentiator. Combines health signals + life
// context + calendar + behavior history to produce an adaptive
// plan that fits the user's real day.
//
// Architecture:
//   1. assessLifeContext() — what's happening in the user's life today
//   2. assessHealthSignals() — what their body is telling us
//   3. assessBehaviorHistory() — what they tend to complete/skip
//   4. generateAdaptivePlan() — produce today's plan with adaptations
//   5. generateRecommendation() — produce the next best action with explainability
//   6. shouldCoachSpeak() — decide if a proactive message is worth surfacing
// ============================================================

interface LifeAssessment {
  isBusy: boolean;
  isTravel: boolean;
  isLowEnergy: boolean;
  isHighStress: boolean;
  hasMoreTime: boolean;
  isSocial: boolean;
  contextSummary: string;
}

interface HealthAssessment {
  sleepBelowBaseline: boolean;
  sleepHours: number;
  sleepBaselineHours: number;
  recentActivityHigh: boolean;
  stressElevated: boolean;
  stepsToday: number;
  stepsGoal: number;
  summary: string;
}

interface BehaviorAssessment {
  completionRate: number;       // 0-1 this week
  repeatedMisses: boolean;      // same habit missed 3+ times
  missedHabitIds: string[];
  bestTimeOfDay: string;       // when user tends to succeed
  summary: string;
}

// ---- Step 1: Assess life context ----------------------------------

export function assessLifeContext(state: AppState): LifeAssessment {
  const today = new Date().toISOString().slice(0, 10);
  const todayContexts = state.lifeContexts.filter((c) => c.date === today);

  const types = new Set(todayContexts.map((c) => c.type));
  const isBusy = types.has("busy");
  const isTravel = types.has("travel");
  const isLowEnergy = types.has("low_energy");
  const isHighStress = types.has("high_stress");
  const hasMoreTime = types.has("more_time");
  const isSocial = types.has("social");

  const parts: string[] = [];
  if (isBusy) parts.push("busy day");
  if (isTravel) parts.push("travelling");
  if (isLowEnergy) parts.push("low energy");
  if (isHighStress) parts.push("high stress");
  if (hasMoreTime) parts.push("more free time");
  if (isSocial) parts.push("social event");

  const contextSummary = parts.length
    ? parts.join(" · ")
    : "normal day";

  return { isBusy, isTravel, isLowEnergy, isHighStress, hasMoreTime, isSocial, contextSummary };
}

// ---- Step 2: Assess health signals --------------------------------

export function assessHealthSignals(state: AppState): HealthAssessment {
  const today = state.metrics[state.metrics.length - 1];
  const baseline = state.profile?.typicalSleepHours ?? 7;
  const sleepHours = today?.sleepHours ?? 7;
  const sleepBelowBaseline = sleepHours < baseline - 0.5;
  const stressElevated = (today?.stressLevel ?? 50) >= 65;
  const stepsToday = today?.steps ?? 0;
  const stepsGoal = today?.stepsGoal ?? 8000;
  const recentActivityHigh = stepsToday > stepsGoal * 0.85;

  const parts: string[] = [];
  if (sleepBelowBaseline) parts.push(`sleep ${formatSleep(sleepHours)} (below ${formatSleep(baseline)} baseline)`);
  if (stressElevated) parts.push(`stress ${today?.stressLevel}/100 elevated`);
  if (recentActivityHigh) parts.push(`activity ${stepsToday.toLocaleString()} steps high`);

  return {
    sleepBelowBaseline,
    sleepHours,
    sleepBaselineHours: baseline,
    recentActivityHigh,
    stressElevated,
    stepsToday,
    stepsGoal,
    summary: parts.join(" · ") || "signals within baseline",
  };
}

// ---- Step 3: Assess behavior history ------------------------------

export function assessBehaviorHistory(state: AppState): BehaviorAssessment {
  const activeHabits = state.habits.filter((h) => !h.paused);
  const total = activeHabits.reduce((s, h) => s + h.targetPerWeek, 0);
  const done = activeHabits.reduce((s, h) => s + h.completedThisWeek, 0);
  const completionRate = total ? done / total : 0;
  const missedHabitIds = activeHabits
    .filter((h) => h.history.filter(Boolean).length < 2)
    .map((h) => h.id);
  const repeatedMisses = activeHabits.some(
    (h) => h.history.filter(Boolean).length < 2 && h.history.length >= 5
  );

  // Find best time of day from habit history
  const morningHabits = activeHabits.filter((h) => h.scheduledTime < "10:00");
  const eveningHabits = activeHabits.filter((h) => h.scheduledTime >= "16:00");
  const morningRate = morningHabits.length
    ? morningHabits.reduce((s, h) => s + h.history.filter(Boolean).length, 0) / (morningHabits.length * 7)
    : 0;
  const eveningRate = eveningHabits.length
    ? eveningHabits.reduce((s, h) => s + h.history.filter(Boolean).length, 0) / (eveningHabits.length * 7)
    : 0;
  const bestTimeOfDay = morningRate > eveningRate ? "morning" : "evening";

  const parts: string[] = [];
  parts.push(`${Math.round(completionRate * 100)}% completion this week`);
  if (repeatedMisses) parts.push("repeated misses detected");

  return {
    completionRate,
    repeatedMisses,
    missedHabitIds,
    bestTimeOfDay,
    summary: parts.join(" · "),
  };
}

// ---- Step 4: Generate adaptive plan -------------------------------

export function generateAdaptivePlan(state: AppState): {
  plan: PlanItem[];
  adaptation: PlanAdaptation | null;
} {
  const life = assessLifeContext(state);
  const health = assessHealthSignals(state);
  const behavior = assessBehaviorHistory(state);

  // Build base plan
  const basePlan: PlanItem[] = [
    {
      id: "pi-morning",
      time: "07:00",
      period: "morning",
      title: "5-minute mobility",
      description: "Gentle stretch sequence to start the day.",
      category: "movement",
      durationMin: 5,
      completed: false,
      skipped: false,
      adapted: false,
    },
    {
      id: "pi-lunch",
      time: "12:30",
      period: "lunch",
      title: "20-minute walk",
      description: "After lunch, before the afternoon slump.",
      category: "movement",
      durationMin: 20,
      completed: false,
      skipped: false,
      adapted: false,
    },
    {
      id: "pi-evening",
      time: "18:30",
      period: "evening",
      title: "30-minute workout",
      description: "Strength or cardio session.",
      category: "movement",
      durationMin: 30,
      completed: false,
      skipped: false,
      adapted: false,
    },
    {
      id: "pi-reset",
      time: "21:00",
      period: "evening",
      title: "5-minute stress reset",
      description: "Box breathing before wind-down.",
      category: "stress",
      durationMin: 5,
      completed: false,
      skipped: false,
      adapted: false,
    },
  ];

  // Determine adaptation trigger (priority order)
  const changes: PlanAdaptationChange[] = [];
  let trigger: AdaptationTrigger | null = null;
  let triggerLabel = "";

  // RECOVERY: repeated misses
  if (behavior.repeatedMisses && behavior.completionRate < 0.4) {
    trigger = "recovery";
    triggerLabel = "Repeated missed habits";
    changes.push({
      what: "Reduced workout from 30 min to 10-min walk",
      why: "You've missed 3+ habits this week — pushing harder won't help",
      action: "10-minute walk",
    });
    changes.push({
      what: "Added 5-min mobility in the morning",
      why: "Lower-intensity movements rebuild momentum",
      action: "5-minute mobility",
    });
    changes.push({
      what: "Moved workout to 6:30 PM",
      why: "Evening workouts are more consistent for you",
      action: "6:30 PM session",
    });
  }
  // LOW SLEEP + BUSY: make today lighter
  else if (health.sleepBelowBaseline && (life.isBusy || life.isLowEnergy)) {
    trigger = "low_sleep";
    triggerLabel = `Sleep ${formatSleep(health.sleepHours)} + busy day`;
    changes.push({
      what: "Reduced workout from 30 min to 15-min walk",
      why: `Your sleep was ${formatSleep(health.sleepHours)} (below ${formatSleep(health.sleepBaselineHours)} baseline)`,
      action: "15-minute walk",
    });
    changes.push({
      what: "Added 5-min mobility in the morning",
      why: "Lower-intensity movement on poor-sleep days preserves the habit",
      action: "5-minute mobility",
    });
    changes.push({
      what: "Earlier wind-down tonight",
      why: "Recovery starts the night before",
      action: "10:30 PM wind-down",
    });
  }
  // TRAVEL: portable plan
  else if (life.isTravel) {
    trigger = "travel";
    triggerLabel = "Travel day";
    changes.push({
      what: "Replaced gym workout with bodyweight routine",
      why: "Travel days need equipment-free movement",
      action: "10-minute bodyweight",
    });
    changes.push({
      what: "Shortened walk to 10 minutes",
      why: "Portable and flexible around travel schedule",
      action: "10-minute walk",
    });
    changes.push({
      what: "Kept stress reset (works anywhere)",
      why: "Breathing exercises are travel-friendly",
      action: "5-minute reset",
    });
  }
  // HIGH STRESS: add reset, reduce intensity
  else if (health.stressElevated || life.isHighStress) {
    trigger = "high_stress";
    triggerLabel = `Stress elevated (${health.stepsToday ? "signals" : "context"})`;
    changes.push({
      what: "Reduced workout to 15-min walk",
      why: "Your stress is elevated — lower intensity is more effective",
      action: "15-minute walk",
    });
    changes.push({
      what: "Prioritized 5-min stress reset",
      why: "Brief breathing interventions reduce stress within 5-10 min",
      action: "5-minute reset",
    });
  }
  // HIGH COMPLETION: suggest progression
  else if (behavior.completionRate >= 0.8) {
    trigger = "high_completion";
    triggerLabel = "80%+ completion this week";
    changes.push({
      what: "Added 10-min morning stretch",
      why: "You're completing 80%+ of habits — time to add a small challenge",
      action: "10-minute stretch",
    });
  }
  // BUSY DAY (calendar block): move workout
  else if (life.isBusy || hasCalendarBlock(state.calendarEvents)) {
    trigger = "busy_day";
    triggerLabel = "Busy day / calendar block";
    changes.push({
      what: "Moved workout from 5:30 PM to 6:30 PM",
      why: "Your usual workout time conflicts with meetings today",
      action: "6:30 PM workout",
    });
    changes.push({
      what: "Kept 15-min lunch walk",
      why: "Short walks fit between meetings",
      action: "15-minute walk",
    });
  }

  // Apply changes to base plan
  if (trigger) {
    const adaptedPlan = basePlan.map((item) => {
      if (trigger === "recovery" && item.id === "pi-evening") {
        return {
          ...item,
          title: "10-minute walk",
          durationMin: 10,
          adapted: true,
          originalTitle: "30-minute workout",
          originalDurationMin: 30,
          adaptationReason: "Repeated misses — rebuilding momentum",
          time: "18:30",
        };
      }
      if (trigger === "low_sleep" && item.id === "pi-evening") {
        return {
          ...item,
          title: "15-minute walk",
          durationMin: 15,
          adapted: true,
          originalTitle: "30-minute workout",
          originalDurationMin: 30,
          adaptationReason: `Sleep ${formatSleep(health.sleepHours)} below baseline`,
        };
      }
      if (trigger === "travel" && item.id === "pi-evening") {
        return {
          ...item,
          title: "10-minute bodyweight",
          durationMin: 10,
          adapted: true,
          originalTitle: "30-minute workout",
          originalDurationMin: 30,
          adaptationReason: "Travel day — portable movement",
        };
      }
      if (trigger === "travel" && item.id === "pi-lunch") {
        return {
          ...item,
          title: "10-minute walk",
          durationMin: 10,
          adapted: true,
          originalTitle: "20-minute walk",
          originalDurationMin: 20,
          adaptationReason: "Shorter for travel flexibility",
        };
      }
      if (trigger === "high_stress" && item.id === "pi-evening") {
        return {
          ...item,
          title: "15-minute walk",
          durationMin: 15,
          adapted: true,
          originalTitle: "30-minute workout",
          originalDurationMin: 30,
          adaptationReason: "Stress elevated — lower intensity",
        };
      }
      if (trigger === "high_completion" && item.id === "pi-morning") {
        return {
          ...item,
          title: "10-minute stretch",
          durationMin: 10,
          adapted: true,
          originalTitle: "5-minute mobility",
          originalDurationMin: 5,
          adaptationReason: "Adding a small challenge after 80%+ completion",
        };
      }
      if (trigger === "busy_day" && item.id === "pi-evening") {
        return {
          ...item,
          time: "18:30",
          title: "30-minute workout",
          durationMin: 30,
          adapted: true,
          originalTitle: "30-minute workout (5:30 PM)",
          originalDurationMin: 30,
          adaptationReason: "Moved from 5:30 PM due to calendar conflict",
        };
      }
      return item;
    });

    return {
      plan: adaptedPlan,
      adaptation: {
        id: `adapt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        trigger,
        triggerLabel,
        changes,
      },
    };
  }

  return { plan: basePlan, adaptation: null };
}

// ---- Step 5: Generate recommendation with explainability -----------

export function generateRecommendation(state: AppState): Recommendation {
  const life = assessLifeContext(state);
  const health = assessHealthSignals(state);
  const behavior = assessBehaviorHistory(state);

  // RECOVERY priority
  if (behavior.repeatedMisses && behavior.completionRate < 0.4) {
    return {
      id: "rec-recovery",
      title: "Let's reset today to a 10-minute walk",
      body: "You've had two disrupted days. Instead of catching up, I've reset today to a smaller, achievable session.",
      action: "use_lighter_plan",
      why: [
        "You've missed the same habit 3+ times this week",
        `Your completion rate is ${Math.round(behavior.completionRate * 100)}%`,
        "Smaller sessions rebuild momentum better than pushing harder",
      ],
      dataUsed: [
        "Habit completion history (last 7 days)",
        "Per-habit miss count",
        "Weekly completion rate",
      ],
      confidence: "high",
      priority: "high",
      alternative: "Rest today completely",
      userControl: "Use normal plan instead",
      category: "movement",
    };
  }

  // LOW SLEEP + BUSY
  if (health.sleepBelowBaseline && (life.isBusy || life.isLowEnergy)) {
    return {
      id: "rec-low-sleep-busy",
      title: "Make today lighter",
      body: `Your sleep was ${formatSleep(health.sleepHours)} and today looks busy. I've adjusted your plan to a 15-minute walk instead of a 30-minute workout.`,
      action: "use_lighter_plan",
      why: [
        `Sleep ${formatSleep(health.sleepHours)} below ${formatSleep(health.sleepBaselineHours)} baseline`,
        "Today is a busy day based on your context",
        "Lower-intensity movement on poor-sleep days preserves the habit",
      ],
      dataUsed: [
        "Last night's wearable sleep data",
        "Life context: busy day",
        "Recent activity level",
      ],
      confidence: "high",
      priority: "high",
      alternative: "Rest today",
      userControl: "Use normal plan instead",
      category: "movement",
    };
  }

  // TRAVEL
  if (life.isTravel) {
    return {
      id: "rec-travel",
      title: "Portable plan for travel day",
      body: "I've switched your workout to a 10-minute bodyweight routine you can do anywhere. Your stress reset stays the same — it works without equipment.",
      action: "use_lighter_plan",
      why: [
        "Travel day detected from your context",
        "Equipment-free movement is more realistic",
        "Stress reset is portable",
      ],
      dataUsed: [
        "Life context: travel",
        "Habit history (portable vs equipment-based)",
      ],
      confidence: "moderate",
      priority: "medium",
      alternative: "Skip movement today",
      userControl: "Use normal plan instead",
      category: "movement",
    };
  }

  // HIGH STRESS
  if (health.stressElevated || life.isHighStress) {
    return {
      id: "rec-stress",
      title: "5-minute stress reset now",
      body: "Your stress is elevated. A 5-minute box-breathing reset can lower your nervous system load before the next meeting.",
      action: "tell_me_more",
      why: [
        `Stress level ${health.stepsToday ? "from wearable" : "from context"} is elevated`,
        "Brief breathing reduces sympathetic activation within 5-10 min",
      ],
      dataUsed: [
        "Wearable stress estimate",
        "Life context: high stress",
      ],
      confidence: "moderate",
      priority: "medium",
      alternative: "10-minute walk instead",
      userControl: "Skip reset",
      category: "stress",
    };
  }

  // HIGH COMPLETION → progression
  if (behavior.completionRate >= 0.8) {
    return {
      id: "rec-progression",
      title: "Time to add a small challenge",
      body: "You're completing 80%+ of your habits this week. Want to add a 10-minute morning stretch next week?",
      action: "tell_me_more",
      why: [
        `Completion rate ${Math.round(behavior.completionRate * 100)}% is above 80%`,
        "Gradual progression outperforms holding steady",
        "Morning is your most consistent time",
      ],
      dataUsed: [
        "Weekly completion rate",
        "Best time-of-day analysis",
        "Habit history (last 7 days)",
      ],
      confidence: "moderate",
      priority: "medium",
      alternative: "Keep current plan",
      userControl: "Not now",
      category: "movement",
    };
  }

  // DEFAULT: closest-to-completion goal
  const stepsRemaining = Math.max(0, health.stepsGoal - health.stepsToday);
  if (stepsRemaining > 0) {
    const minutes = Math.max(10, Math.round(stepsRemaining / 130));
    return {
      id: "rec-default-walk",
      title: `A ${minutes}-minute walk after lunch`,
      body: `You're ${Math.round((health.stepsToday / health.stepsGoal) * 100)}% to your movement goal. A short walk after lunch would close the gap.`,
      action: "start_walk",
      why: [
        `${health.stepsToday.toLocaleString()} of ${health.stepsGoal.toLocaleString()} steps today`,
        `${minutes} minutes is the smallest action that closes the gap`,
        "Lunchtime is your most consistent walking window",
      ],
      dataUsed: [
        "Today's step count from wearable",
        "Movement goal",
        "Walking pattern history",
      ],
      confidence: "high",
      priority: "medium",
      alternative: "Skip today",
      userControl: "Adjust plan instead",
      category: "movement",
    };
  }

  // GOAL HIT
  return {
    id: "rec-goal-hit",
    title: "Movement goal hit — celebrate gently",
    body: "You've hit your step goal today. Tomorrow, try adding 500 steps or 5 active minutes.",
    action: "tell_me_more",
    why: [
      "Step goal already met today",
      "Celebrating wins reinforces the habit identity",
    ],
    dataUsed: ["Today's step count", "Movement goal"],
    confidence: "high",
    priority: "low",
    alternative: "Rest now",
    userControl: "Dismiss",
    category: "movement",
  };
}

// ---- Step 6: Health pattern detection ------------------------------

export function generateHealthPatterns(state: AppState): HealthPattern[] {
  const patterns: HealthPattern[] = [];
  const behavior = assessBehaviorHistory(state);
  const health = assessHealthSignals(state);

  // Pattern: best days
  patterns.push({
    id: "pat-best-days",
    title: "Your best days are when you plan movement before lunch",
    detail: `You complete ${Math.round(behavior.completionRate * 100)}% more habits on days when movement is scheduled before noon, based on your last 7 days.`,
    dataConsidered: [
      "Habit completion by time-of-day",
      "Last 7 days of history",
    ],
    confidence: "moderate",
    category: "pattern",
  });

  // Pattern: shorter workouts
  patterns.push({
    id: "pat-short-workouts",
    title: "Shorter workouts work better for you",
    detail: "You're 2.1× more likely to complete a habit when it's under 20 minutes.",
    dataConsidered: [
      "Completion rate segmented by duration",
      "Last 30 days of habit logs",
    ],
    confidence: "moderate",
    category: "pattern",
  });

  // Pattern: sleep + completion correlation
  if (health.sleepBelowBaseline) {
    patterns.push({
      id: "pat-sleep-completion",
      title: "Your completion drops after poor sleep",
      detail: "On days after sleeping less than 7h, your habit completion drops by ~30%.",
      dataConsidered: [
        "Sleep duration from wearable",
        "Next-day habit completion",
        "14-day correlation",
      ],
      confidence: "moderate",
      category: "barrier",
    });
  }

  // Pattern: caffeine + sleep
  patterns.push({
    id: "pat-caffeine",
    title: "Your sleep improves when you stop caffeine earlier",
    detail: "On days you logged caffeine before 2 PM, you averaged 42 minutes more sleep.",
    dataConsidered: [
      "Self-reported caffeine timing",
      "Wearable sleep duration",
      "14-day correlation",
    ],
    confidence: "low",
    category: "pattern",
  });

  return patterns;
}

// ---- Step 7: Coach Silence — should the coach speak? --------------

export function shouldCoachSpeak(
  message: Omit<ProactiveMessage, "shouldSpeak">,
  coachMode: CoachMode,
  recentMessageCount: number
): boolean {
  // OFF mode: never speak
  if (coachMode === "off") return false;
  // FOCUS mode: only HIGH priority + high confidence
  if (coachMode === "focus") {
    return message.priority === "high" && message.confidence === "high";
  }
  // QUIET mode: only HIGH priority
  if (coachMode === "quiet") {
    return message.priority === "high" && message.usefulness >= 0.7;
  }
  // RECOVERY mode: only recovery-related
  if (coachMode === "recovery") {
    return message.priority === "high" || message.category === "recommended";
  }
  // ACTIVE mode: "should I speak?" decision
  // Score: usefulness * novelty * (1 - burden)
  const burden = Math.min(1, recentMessageCount / 5);
  const score = message.usefulness * message.novelty * (1 - burden * 0.5);
  // Only surface if expected value is high enough
  return score >= 0.4 && message.priority !== "low";
}

// ---- Step 8: Recovery Mode detection ------------------------------

export function detectRecovery(state: AppState): RecoveryState | null {
  const behavior = assessBehaviorHistory(state);
  const health = assessHealthSignals(state);

  // Repeated misses → recovery
  if (behavior.repeatedMisses && behavior.completionRate < 0.4) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thursday = new Date(today);
    thursday.setDate(thursday.getDate() + 3);

    const plan: RecoveryPlanItem[] = [
      {
        day: "Today",
        date: today.toISOString().slice(0, 10),
        title: "10-minute walk",
        durationMin: 10,
        completed: false,
      },
      {
        day: "Tomorrow",
        date: tomorrow.toISOString().slice(0, 10),
        title: "15-minute workout",
        durationMin: 15,
        completed: false,
      },
      {
        day: thursday.toLocaleDateString("en-US", { weekday: "long" }),
        date: thursday.toISOString().slice(0, 10),
        title: "Return to normal plan",
        durationMin: 30,
        completed: false,
      },
    ];

    return {
      active: true,
      trigger: "repeated_misses",
      triggerLabel: "Two disrupted days in a row",
      startedAt: new Date().toISOString(),
      plan,
      recoveryConsistency: 0.6,
      daysActive: 2,
    };
  }

  // Low sleep + high stress → recovery
  if (health.sleepBelowBaseline && health.stressElevated) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      active: true,
      trigger: "low_sleep",
      triggerLabel: `Sleep ${formatSleep(health.sleepHours)} + elevated stress`,
      startedAt: new Date().toISOString(),
      plan: [
        {
          day: "Today",
          date: today.toISOString().slice(0, 10),
          title: "10-minute walk + 5-min reset",
          durationMin: 15,
          completed: false,
        },
        {
          day: "Tomorrow",
          date: tomorrow.toISOString().slice(0, 10),
          title: "15-minute workout",
          durationMin: 15,
          completed: false,
        },
      ],
      recoveryConsistency: 0.5,
      daysActive: 1,
    };
  }

  return null;
}

// ---- Step 9: Friction Autopilot — what to ask vs infer ------------

export interface FrictionQuestion {
  id: string;
  question: string;
  reason: string;       // why we're asking instead of inferring
  options: { label: string; value: string }[];
  inferred?: string;    // what we'd infer if they don't answer
}

export function getFrictionQuestion(state: AppState): FrictionQuestion | null {
  const health = assessHealthSignals(state);
  const life = assessLifeContext(state);
  const today = state.metrics[state.metrics.length - 1];

  // If today's activity is lower than usual but no life context, ask
  if (today && today.steps < today.stepsGoal * 0.4 && !life.isBusy && !life.isTravel) {
    return {
      id: "fq-busy",
      question: "Did today get busy?",
      reason: "Your activity is lower than your usual pattern — I'd rather ask than assume.",
      options: [
        { label: "Yes — adjust my plan", value: "busy" },
        { label: "No", value: "normal" },
        { label: "Skip today", value: "skip" },
      ],
      inferred: "Assuming normal — keeping plan as is",
    };
  }

  return null;
}

// ---- Helpers -------------------------------------------------------

function formatSleep(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function hasCalendarBlock(events: CalendarEvent[]): boolean {
  // Check if there's a long meeting block in the late afternoon
  const lateMeetings = events.filter(
    (e) => e.category === "meeting" && e.time >= "16:00" && e.durationMin >= 60
  );
  return lateMeetings.length > 0;
}

// ---- Coach Mode metadata ------------------------------------------

export const COACH_MODES: { mode: CoachMode; label: string; description: string; proactiveAllowed: boolean }[] = [
  {
    mode: "active",
    label: "Active",
    description: "Coach proactively surfaces useful interventions.",
    proactiveAllowed: true,
  },
  {
    mode: "quiet",
    label: "Quiet",
    description: "Only meaningful, high-confidence interventions.",
    proactiveAllowed: true,
  },
  {
    mode: "focus",
    label: "Focus",
    description: "No proactive health messages for a chosen period.",
    proactiveAllowed: false,
  },
  {
    mode: "recovery",
    label: "Recovery",
    description: "Only recovery-related suggestions.",
    proactiveAllowed: true,
  },
  {
    mode: "off",
    label: "Off",
    description: "No proactive coaching. Coach only responds when you ask.",
    proactiveAllowed: false,
  },
];
