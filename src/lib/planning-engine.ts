import type {
  AppState,
  DemoScenario,
  MonthlyMilestone,
  PlanAdaptationCascade,
  PlanHierarchy,
  PlanStatus,
  PlanningInsight,
  QuarterlyGoal,
  WeeklyPlan,
  WeeklyDayPlan,
} from "./types";

// ============================================================
// PlanningEngine — Long-Term Adaptive Planning
// ============================================================
// Connects Quarter → Month → Week → Today.
//
// Principles:
//   - Long-term goals provide direction
//   - Short-term plans provide action
//   - Daily plans adapt to reality
//   - A change at any level cascades appropriately
//   - Never make the user feel like they failed
//
// This is a rules-based engine. The architecture is clean
// enough that an ML/optimization layer could replace the
// initial rules later.
// ============================================================

// ---- Generate the planning hierarchy for a scenario ---------------

export function buildPlanHierarchy(scenario: DemoScenario): PlanHierarchy {
  const quarter = buildQuarterlyGoal(scenario);
  const currentMonth = quarter.milestones.find((m) => m.current) ?? quarter.milestones[0];
  const currentWeek = buildWeeklyPlan(scenario, currentMonth);
  return { quarter, currentMonth, currentWeek };
}

// ---- Quarterly goal -----------------------------------------------

function buildQuarterlyGoal(scenario: DemoScenario): QuarterlyGoal {
  const today = new Date();
  const qStart = new Date(today);
  qStart.setDate(today.getDate() - 30); // 1 month into Q3
  const qEnd = new Date(qStart);
  qEnd.setDate(qStart.getDate() + 90);

  // Adjust outcomes based on scenario
  const movementCurrent = scenario === "successful" ? 71 : scenario === "struggling" || scenario === "recovery" ? 48 : scenario === "poor_sleep" ? 52 : 63;
  const sleepCurrent = scenario === "poor_sleep" ? 55 : scenario === "successful" ? 78 : 68;
  const stressCurrent = scenario === "struggling" || scenario === "recovery" ? 62 : scenario === "poor_sleep" ? 65 : 45;

  const outcomes = [
    {
      id: "qo-movement",
      label: "Movement consistency",
      baseline: 42,
      target: 70,
      current: movementCurrent,
      unit: "%",
      trend: "up" as const,
      confidence: "high" as const,
      status: deriveStatus(movementCurrent, 42, 70),
      rationale: "Based on habit completion over the last 30 days.",
    },
    {
      id: "qo-sleep",
      label: "Sleep routine",
      baseline: 58,
      target: 80,
      current: sleepCurrent,
      unit: "%",
      trend: scenario === "poor_sleep" ? "down" as const : "up" as const,
      confidence: "moderate" as const,
      status: deriveStatus(sleepCurrent, 58, 80),
    },
    {
      id: "qo-stress",
      label: "Stress management",
      baseline: 35,
      target: 65,
      current: stressCurrent,
      unit: "%",
      trend: scenario === "struggling" ? "down" as const : "up" as const,
      confidence: "moderate" as const,
      status: deriveStatus(stressCurrent, 35, 65),
    },
    {
      id: "qo-habits",
      label: "Sustainable habits",
      baseline: 30,
      target: 75,
      current: scenario === "successful" ? 72 : scenario === "struggling" ? 38 : 58,
      unit: "%",
      trend: "up" as const,
      confidence: "high" as const,
      status: deriveStatus(scenario === "successful" ? 72 : scenario === "struggling" ? 38 : 58, 30, 75),
    },
  ];

  const milestones = buildMonthlyMilestones(scenario);

  return {
    id: "q3-2024",
    quarterLabel: "Q3 2024",
    primaryObjective: "Build a sustainable fitness and recovery routine",
    outcomes,
    milestones,
    startDate: qStart.toISOString().slice(0, 10),
    endDate: qEnd.toISOString().slice(0, 10),
    status: deriveQuarterStatus(outcomes),
  };
}

function deriveQuarterStatus(outcomes: QuarterlyGoal["outcomes"]): PlanStatus {
  const statuses = outcomes.map((o) => o.status);
  if (statuses.every((s) => s === "on_track" || s === "completed")) return "on_track";
  if (statuses.some((s) => s === "at_risk")) return "at_risk";
  if (statuses.some((s) => s === "needs_attention")) return "needs_attention";
  if (statuses.some((s) => s === "adapted")) return "adapted";
  return "on_track";
}

function deriveStatus(current: number, baseline: number, target: number): PlanStatus {
  const pct = (current - baseline) / (target - baseline);
  if (pct >= 1) return "completed";
  if (pct >= 0.7) return "on_track";
  if (pct >= 0.4) return "adapted";
  if (pct >= 0.2) return "needs_attention";
  return "at_risk";
}

// ---- Monthly milestones -------------------------------------------

function buildMonthlyMilestones(scenario: DemoScenario): MonthlyMilestone[] {
  const today = new Date();

  const month1Start = new Date(today);
  month1Start.setDate(today.getDate() - 30);
  const month1End = new Date(month1Start);
  month1End.setDate(month1Start.getDate() + 30);

  const month2Start = new Date(month1End);
  month2Start.setDate(month1End.getDate() + 1);
  const month2End = new Date(month2Start);
  month2End.setDate(month2Start.getDate() + 30);

  const month3Start = new Date(month2End);
  month3Start.setDate(month2End.getDate() + 1);
  const month3End = new Date(month3Start);
  month3End.setDate(month3Start.getDate() + 30);

  // Month 2 is the "current" month (we're 1 month into Q3)
  const currentMonth = 2;

  const month1Goals = [
    { id: "m1g1", label: "Movement sessions", target: 12, current: 11, projected: 12, unit: "sessions", status: "completed" as PlanStatus },
    { id: "m1g2", label: "Sleep targets", target: 20, current: 18, projected: 20, unit: "nights", status: "completed" as PlanStatus },
    { id: "m1g3", label: "Stress resets", target: 12, current: 12, projected: 12, unit: "sessions", status: "completed" as PlanStatus },
  ];

  // Month 2 (current) — varies by scenario
  const m2MovementCurrent = scenario === "successful" ? 11 : scenario === "struggling" || scenario === "recovery" ? 5 : 9;
  const m2MovementProjected = scenario === "successful" ? 16 : scenario === "struggling" || scenario === "recovery" ? 11 : 14;
  const m2MovementStatus = deriveStatus(m2MovementCurrent, 0, 16);
  const m2MovementAdjustment = scenario === "struggling" || scenario === "recovery"
    ? { newTarget: 12, reason: "You're slightly behind the original plan. Based on your recent consistency, I recommend adjusting the target to 12 rather than increasing pressure.", difficulty: "easier" as const }
    : scenario === "poor_sleep"
    ? { newTarget: 14, reason: "Your sleep has been lower this month. Adjusting to 14 keeps you on track without overloading recovery.", difficulty: "easier" as const }
    : undefined;

  const month2Goals = [
    {
      id: "m2g1",
      label: "Movement sessions",
      target: 16,
      current: m2MovementCurrent,
      projected: m2MovementProjected,
      unit: "sessions",
      status: m2MovementStatus,
      adjustmentRecommended: m2MovementAdjustment,
    },
    { id: "m2g2", label: "Sleep targets", target: 20, current: 13, projected: 18, unit: "nights", status: "on_track" as PlanStatus },
    { id: "m2g3", label: "Stress resets", target: 12, current: 8, projected: 12, unit: "sessions", status: "on_track" as PlanStatus },
  ];

  const month3Goals = [
    { id: "m3g1", label: "Movement sessions", target: 18, current: 0, projected: 16, unit: "sessions", status: "needs_attention" as PlanStatus },
    { id: "m3g2", label: "Sleep targets", target: 22, current: 0, projected: 20, unit: "nights", status: "needs_attention" as PlanStatus },
    { id: "m3g3", label: "Stress resets", target: 14, current: 0, projected: 12, unit: "sessions", status: "needs_attention" as PlanStatus },
  ];

  return [
    {
      id: "m1",
      monthLabel: "Month 1 — Establish",
      monthNumber: 1,
      focus: "Build consistent movement and sleep habits",
      startDate: month1Start.toISOString().slice(0, 10),
      endDate: month1End.toISOString().slice(0, 10),
      goals: month1Goals,
      status: "completed" as PlanStatus,
      current: false,
    },
    {
      id: "m2",
      monthLabel: "Month 2 — Strengthen",
      monthNumber: 2,
      focus: "Increase consistency and gradually increase activity",
      startDate: month2Start.toISOString().slice(0, 10),
      endDate: month2End.toISOString().slice(0, 10),
      goals: month2Goals,
      status: scenario === "struggling" || scenario === "recovery" || scenario === "poor_sleep" ? "needs_attention" as PlanStatus : "on_track" as PlanStatus,
      current: true,
    },
    {
      id: "m3",
      monthLabel: "Month 3 — Sustain",
      monthNumber: 3,
      focus: "Maintain habits with fewer reminders",
      startDate: month3Start.toISOString().slice(0, 10),
      endDate: month3End.toISOString().slice(0, 10),
      goals: month3Goals,
      status: "needs_attention" as PlanStatus,
      current: false,
    },
  ];
}

// ---- Weekly plan --------------------------------------------------

function buildWeeklyPlan(scenario: DemoScenario, month: MonthlyMilestone): WeeklyPlan {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const baseDays: WeeklyDayPlan[] = [
    { id: "wd-mon", day: "Monday", date: addDays(weekStart, 0), title: "15-min walk", category: "movement", durationMin: 15, completed: false, skipped: false, adapted: false },
    { id: "wd-tue", day: "Tuesday", date: addDays(weekStart, 1), title: "Strength", category: "movement", durationMin: 30, completed: false, skipped: false, adapted: false },
    { id: "wd-wed", day: "Wednesday", date: addDays(weekStart, 2), title: "Recovery", category: "recovery", durationMin: 10, completed: false, skipped: false, adapted: false },
    { id: "wd-thu", day: "Thursday", date: addDays(weekStart, 3), title: "20-min walk", category: "movement", durationMin: 20, completed: false, skipped: false, adapted: false },
    { id: "wd-fri", day: "Friday", date: addDays(weekStart, 4), title: "Flexible", category: "flexible", durationMin: 15, completed: false, skipped: false, adapted: false },
    { id: "wd-sat", day: "Saturday", date: addDays(weekStart, 5), title: "Outdoor activity", category: "outdoor", durationMin: 45, completed: false, skipped: false, adapted: false },
    { id: "wd-sun", day: "Sunday", date: addDays(weekStart, 6), title: "Recovery", category: "recovery", durationMin: 10, completed: false, skipped: false, adapted: false },
  ];

  // Adjust based on scenario
  let days = baseDays;
  let adaptedSessions = 0;
  let recoverySessions = 0;
  let completedSessions = 0;

  if (scenario === "successful") {
    days = baseDays.map((d, i) => i < 4 ? { ...d, completed: true } : d);
    completedSessions = 4;
  } else if (scenario === "busy_day") {
    // Tuesday's strength session moved to Saturday
    days[1] = { ...days[1], title: "Moved to Saturday", skipped: true, adapted: true, movedTo: addDays(weekStart, 5), adaptationReason: "Calendar conflict — moved to Saturday" };
    days[5] = { ...days[5], title: "Strength + Outdoor", durationMin: 45, adapted: true, movedFrom: addDays(weekStart, 1), originalTitle: "Outdoor activity", adaptationReason: "Tuesday session moved here" };
    adaptedSessions = 1;
    completedSessions = 2;
    days[0].completed = true;
    days[3].completed = true;
  } else if (scenario === "travel_day") {
    days[1] = { ...days[1], title: "Bodyweight (portable)", durationMin: 10, adapted: true, originalTitle: "Strength", adaptationReason: "Travel day — equipment-free" };
    days[3] = { ...days[3], title: "10-min walk", durationMin: 10, adapted: true, originalTitle: "20-min walk", adaptationReason: "Shorter for travel" };
    adaptedSessions = 2;
  } else if (scenario === "poor_sleep") {
    days[1] = { ...days[1], title: "15-min walk", durationMin: 15, adapted: true, originalTitle: "Strength", adaptationReason: "Sleep below baseline — lower intensity" };
    days[5] = { ...days[5], title: "20-min activity", durationMin: 20, adapted: true, originalTitle: "Outdoor activity", adaptationReason: "Reduced intensity" };
    adaptedSessions = 2;
  } else if (scenario === "struggling" || scenario === "recovery") {
    // Monday and Tuesday missed — recovery plan triggered
    days[0] = { ...days[0], skipped: true, adapted: true, adaptationReason: "Missed — recovery mode" };
    days[1] = { ...days[1], skipped: true, adapted: true, adaptationReason: "Missed — recovery mode" };
    days[2] = { ...days[2], title: "10-min walk", durationMin: 10, adapted: true, originalTitle: "Recovery", adaptationReason: "Recovery plan — lighter session" };
    days[3] = { ...days[3], title: "15-min session", durationMin: 15, adapted: true, originalTitle: "20-min walk", adaptationReason: "Recovery plan — gradual return" };
    days[5] = { ...days[5], title: "20-min session", durationMin: 20, adapted: true, originalTitle: "Outdoor activity", adaptationReason: "Recovery plan — final session" };
    adaptedSessions = 3;
    recoverySessions = 1;
  }

  const targetSessions = 4;
  const status = scenario === "struggling" || scenario === "recovery" ? "at_risk" : scenario === "successful" ? "on_track" : adaptedSessions > 0 ? "adapted" : "on_track";

  return {
    id: "week-current",
    weekLabel: `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    weekNumber: 6,
    objective: scenario === "struggling" || scenario === "recovery"
      ? "Recover momentum with lighter sessions — weekly target preserved."
      : scenario === "busy_day"
      ? "Complete 4 movement sessions around a busy meeting schedule."
      : "Complete 4 movement sessions without compromising recovery.",
    startDate: weekStart.toISOString().slice(0, 10),
    endDate: weekEnd.toISOString().slice(0, 10),
    days,
    status,
    completedSessions,
    targetSessions,
    adaptedSessions,
    recoverySessions,
    current: true,
  };
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---- Planning insights --------------------------------------------

export function buildPlanningInsights(scenario: DemoScenario): PlanningInsight[] {
  const insights: PlanningInsight[] = [
    {
      id: "pi-achievable",
      title: "Your monthly target is achievable based on your current pace",
      body: "At your current rate of 2-3 sessions/week, you'll reach 14 of 16 movement sessions. Close, but achievable.",
      category: "observation",
      confidence: "moderate",
      scope: "month",
    },
    {
      id: "pi-tuesday-pattern",
      title: "You tend to miss Tuesday workouts",
      body: "Moving Tuesday sessions to Wednesday may improve consistency — Wednesdays have a 38% higher completion rate for you.",
      category: "recommendation",
      confidence: "moderate",
      scope: "week",
      action: "Move Tuesday to Wednesday",
    },
    {
      id: "pi-quarter-progress",
      title: "Your quarterly goal is progressing well",
      body: "Movement consistency is at 63% (target: 70%). No need to increase difficulty yet — sustain the current pace.",
      category: "observation",
      confidence: "high",
      scope: "quarter",
    },
  ];

  if (scenario === "struggling" || scenario === "recovery") {
    insights.push({
      id: "pi-recovery",
      title: "Weekly plan is at risk — recovery recommended",
      body: "Two sessions missed this week. Recovery Mode can preserve your monthly target by redistributing sessions.",
      category: "recommendation",
      confidence: "high",
      scope: "week",
      action: "Activate Recovery Mode",
    });
  }

  if (scenario === "busy_day") {
    insights.push({
      id: "pi-reschedule",
      title: "Tuesday's session was moved to Saturday",
      body: "Your calendar showed a late meeting Tuesday. Saturday has more flexibility and matches your consistency pattern.",
      category: "observation",
      confidence: "high",
      scope: "week",
    });
  }

  return insights;
}

// ---- Plan adaptation cascade -------------------------------------
// When user says "I only have 10 minutes" or "Busy today", the
// engine determines the cascade effect across all horizons.

export function createCascadeAdaptation(
  trigger: string,
  todayChange: string,
  weekChange: string,
  monthChange: string,
  quarterChange: string,
  message: string
): PlanAdaptationCascade {
  return {
    id: `cascade-${Date.now()}`,
    trigger,
    todayChange,
    weekChange,
    monthChange,
    quarterChange,
    message,
    timestamp: new Date().toISOString(),
  };
}

// ---- Reschedule action (move a session to another day) -----------

export function rescheduleAction(
  week: WeeklyPlan,
  fromDayId: string,
  toDayId: string
): WeeklyPlan {
  const fromDay = week.days.find((d) => d.id === fromDayId);
  const toDay = week.days.find((d) => d.id === toDayId);
  if (!fromDay || !toDay) return week;

  const newDays = week.days.map((d) => {
    if (d.id === fromDayId) {
      return {
        ...d,
        skipped: true,
        adapted: true,
        movedTo: toDay.date,
        adaptationReason: `Moved to ${toDay.day}`,
      };
    }
    if (d.id === toDayId) {
      return {
        ...d,
        title: fromDay.title,
        durationMin: fromDay.durationMin,
        category: fromDay.category,
        adapted: true,
        movedFrom: fromDay.date,
        originalTitle: d.title,
        originalDurationMin: d.durationMin,
        adaptationReason: `${fromDay.day}'s session moved here`,
      };
    }
    return d;
  });

  return {
    ...week,
    days: newDays,
    adaptedSessions: week.adaptedSessions + 1,
    status: "adapted",
  };
}

// ---- Status labels (calm language) --------------------------------

export const PLAN_STATUS_LABELS: Record<PlanStatus, { label: string; description: string; color: string }> = {
  on_track: {
    label: "On track",
    description: "Progressing as planned.",
    color: "primary",
  },
  adapted: {
    label: "Adapted",
    description: "Adjusted to fit your real day. Still on track.",
    color: "primary",
  },
  needs_attention: {
    label: "Needs adjustment",
    description: "Still on track, but this may be ambitious.",
    color: "amber",
  },
  at_risk: {
    label: "At risk",
    description: "Recovery recommended to preserve the larger goal.",
    color: "amber",
  },
  completed: {
    label: "Completed",
    description: "Goal achieved.",
    color: "primary",
  },
};

// ---- Plan health summary ------------------------------------------

export function getPlanHealth(hierarchy: PlanHierarchy): {
  overall: PlanStatus;
  summary: string;
} {
  const { quarter, currentMonth, currentWeek } = hierarchy;
  const weekStatus = currentWeek.status;
  const monthStatus = currentMonth.status;
  const quarterStatus = quarter.status;

  if (weekStatus === "at_risk" || monthStatus === "at_risk") {
    return {
      overall: "at_risk",
      summary: "This week needs recovery — your monthly target is still achievable.",
    };
  }
  if (weekStatus === "adapted" || monthStatus === "adapted") {
    return {
      overall: "adapted",
      summary: "Plan adapted to fit your real day. Still on track.",
    };
  }
  if (weekStatus === "needs_attention" || monthStatus === "needs_attention") {
    return {
      overall: "needs_attention",
      summary: "Still on track, but this week's original plan may be ambitious.",
    };
  }
  return {
    overall: "on_track",
    summary: "Everything is progressing as planned.",
  };
}
