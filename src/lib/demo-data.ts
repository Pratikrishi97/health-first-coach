import type {
  AppState,
  ContentItem,
  DailyMetric,
  Habit,
  InsightCard,
  NudgeItem,
  TimelineEvent,
  UserProfile,
  WeeklyReview,
  DemoScenario,
} from "./types";

// ============================================================
// Demo data for the primary persona — Raj Sharma
// Realistic variation across days, no medical claims.
// ============================================================

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export function buildDemoProfile(scenario: DemoScenario): UserProfile {
  const base: UserProfile = {
    name: "Raj Sharma",
    age: 35,
    heightCm: 178,
    weightKg: 79.8,
    primaryGoal: "routines",
    secondaryGoals: ["fitness", "sleep"],
    challenge: "consistency",
    workStyle: "desk",
    activityLevel: "light",
    eatingPattern: "late eater",
    exerciseFrequency: "1-2x/week",
    stressLevel: 58,
    typicalSleepHours: 6.5,
    coachingStyle: "encouraging",
    devices: [
      { provider: "apple_health", connected: true, lastSyncedAt: new Date().toISOString() },
      { provider: "fitbit", connected: true, lastSyncedAt: new Date().toISOString() },
      { provider: "garmin", connected: false, lastSyncedAt: null },
      { provider: "oura", connected: false, lastSyncedAt: null },
      { provider: "google_health", connected: false, lastSyncedAt: null },
    ],
    createdAt: new Date().toISOString(),
    onboardingComplete: true,
  };

  if (scenario === "struggling") {
    return {
      ...base,
      coachingStyle: "direct",
      stressLevel: 72,
      typicalSleepHours: 5.8,
    };
  }
  if (scenario === "poor_sleep") {
    return {
      ...base,
      primaryGoal: "sleep",
      secondaryGoals: ["stress", "routines"],
      typicalSleepHours: 5.2,
      stressLevel: 65,
    };
  }
  if (scenario === "successful") {
    return {
      ...base,
      coachingStyle: "data",
      activityLevel: "active",
      exerciseFrequency: "4-5x/week",
      stressLevel: 38,
      typicalSleepHours: 7.4,
    };
  }
  return base;
}

export function buildDemoHabits(scenario: DemoScenario): Habit[] {
  const baseHabits: Habit[] = [
    {
      id: "walk-20",
      title: "Walk 20 minutes",
      description: "A brisk walk — anytime that fits your day.",
      category: "movement",
      targetPerWeek: 5,
      completedThisWeek: 4,
      currentStreak: 5,
      bestStreak: 9,
      difficulty: "easy",
      scheduledTime: "18:00",
      paused: false,
      history: [true, true, false, true, true, true, true],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "sleep-1130",
      title: "Sleep by 11:30 PM",
      description: "Wind down by 11 PM to be asleep by 11:30.",
      category: "sleep",
      targetPerWeek: 5,
      completedThisWeek: 3,
      currentStreak: 2,
      bestStreak: 6,
      difficulty: "medium",
      scheduledTime: "23:00",
      paused: false,
      history: [true, false, true, true, false, true, false],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "stress-reset",
      title: "5-minute stress reset",
      description: "Box breathing or a short walk to decompress.",
      category: "stress",
      targetPerWeek: 5,
      completedThisWeek: 5,
      currentStreak: 7,
      bestStreak: 7,
      difficulty: "easy",
      scheduledTime: "15:00",
      paused: false,
      history: [true, true, true, true, true, true, true],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "protein-breakfast",
      title: "Protein-rich breakfast",
      description: "Eggs, Greek yogurt, or a protein-rich option before 9 AM.",
      category: "nutrition",
      targetPerWeek: 5,
      completedThisWeek: 2,
      currentStreak: 1,
      bestStreak: 4,
      difficulty: "medium",
      scheduledTime: "08:00",
      paused: false,
      history: [false, false, true, false, false, true, false],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "water-8",
      title: "8 glasses of water",
      description: "Stay hydrated across the day.",
      category: "nutrition",
      targetPerWeek: 7,
      completedThisWeek: 5,
      currentStreak: 3,
      bestStreak: 12,
      difficulty: "easy",
      scheduledTime: "10:00",
      paused: false,
      history: [true, true, true, false, true, true, false],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ];

  if (scenario === "struggling") {
    return baseHabits.map((h) => ({
      ...h,
      completedThisWeek: Math.max(0, Math.floor(h.targetPerWeek * 0.3)),
      currentStreak: 0,
      history: [false, false, true, false, false, false, false],
    }));
  }
  if (scenario === "poor_sleep") {
    return baseHabits.map((h) =>
      h.category === "sleep"
        ? { ...h, completedThisWeek: 1, currentStreak: 0, history: [false, false, false, true, false, false, false] }
        : h
    );
  }
  if (scenario === "successful") {
    return baseHabits.map((h) => ({
      ...h,
      completedThisWeek: h.targetPerWeek,
      currentStreak: h.bestStreak,
      history: [true, true, true, true, true, true, true],
    }));
  }
  return baseHabits;
}

export function buildDemoMetrics(scenario: DemoScenario): DailyMetric[] {
  // Build last 21 days of metrics
  const metrics: DailyMetric[] = [];
  for (let i = 20; i >= 0; i--) {
    const date = daysAgoISO(i);
    const isWeekend = [0, 6].includes(new Date(date).getDay());
    const baseSteps = isWeekend ? 7200 : 5800;
    const variation = Math.floor(Math.sin(i * 0.7) * 1200 + Math.cos(i * 1.2) * 800);
    const trend = scenario === "successful" ? 1500 : scenario === "struggling" ? -1500 : 600;
    const steps = Math.max(2200, Math.round(baseSteps + variation + trend * (1 - i / 21)));

    let sleepHours = 6.5 + Math.sin(i * 0.4) * 0.8 + (isWeekend ? 0.6 : 0);
    if (scenario === "poor_sleep") sleepHours = 5.0 + Math.sin(i * 0.4) * 0.5;
    if (scenario === "successful") sleepHours = 7.3 + Math.sin(i * 0.4) * 0.4;

    metrics.push({
      date,
      steps,
      stepsGoal: 8000,
      sleepHours: Math.round(sleepHours * 10) / 10,
      sleepGoalHours: 7.5,
      hydrationGlasses: Math.round(5 + Math.random() * 3),
      hydrationGoal: 8,
      stressLevel:
        scenario === "struggling"
          ? Math.round(65 + Math.sin(i * 0.5) * 12)
          : scenario === "poor_sleep"
          ? Math.round(60 + Math.sin(i * 0.5) * 10)
          : Math.round(45 + Math.sin(i * 0.5) * 12),
      stressResetsCompleted: Math.random() > 0.4 ? 1 : 0,
      activeMinutes: Math.round(steps / 130 + (isWeekend ? 12 : 0)),
      restingHeartRate: 62 - Math.floor(i / 7),
      weightKg: 79.8 - (21 - i) * 0.05,
    });
  }
  return metrics;
}

export function buildDemoInsights(scenario: DemoScenario): InsightCard[] {
  const insights: InsightCard[] = [
    {
      id: "best-days",
      title: "Your best days are Tuesdays and Thursdays",
      detail:
        "You complete 38% more habits on Tuesdays and Thursdays compared to other weekdays.",
      rationale:
        "Calculated from your habit completion history across the last 21 days, grouped by weekday.",
      category: "pattern",
    },
    {
      id: "short-workouts",
      title: "Shorter workouts work better for you",
      detail:
        "You're 2.1× more likely to complete a habit when it's under 20 minutes.",
      rationale:
        "Based on your completion rate segmented by scheduled duration over the last 30 days.",
      category: "pattern",
    },
    {
      id: "caffeine-sleep",
      title: "Your sleep improves when you stop caffeine earlier",
      detail:
        "On days you logged caffeine before 2 PM, you averaged 42 minutes more sleep.",
      rationale:
        "Correlation between self-reported caffeine timing and wearable sleep duration over 14 days.",
      category: "pattern",
    },
    {
      id: "evening-streak",
      title: "Your evening walk streak is your strongest habit",
      detail:
        "You've completed your evening walk 4 days in a row — your longest current streak.",
      rationale:
        "Derived from your habit logs for the 'Walk 20 minutes' habit in the last 7 days.",
      category: "success",
    },
  ];
  if (scenario === "struggling") {
    insights.push({
      id: "morning-barrier",
      title: "Morning habits are your biggest barrier right now",
      detail:
        "Habits scheduled before 8 AM have a 23% completion rate this week.",
      rationale:
        "Calculated from your habit logs filtered to scheduled times before 08:00.",
      category: "barrier",
    });
  }
  return insights;
}

export function buildDemoNudges(scenario: DemoScenario): NudgeItem[] {
  const base: NudgeItem[] = [
    {
      id: "nudge-walk",
      title: "Time for your evening walk?",
      body: "You normally walk around this time. Want to keep the streak going?",
      time: "18:00",
      context: "Scheduled habit time + 5-day streak",
    },
    {
      id: "nudge-lighter",
      title: "Today's plan can be lighter",
      body: "Your sleep was shorter than usual. Let's reduce today's workout intensity.",
      time: "08:30",
      context: "Sleep < 6h detected from last night's wearable data",
    },
    {
      id: "nudge-water",
      title: "Hydration check-in",
      body: "You're 3 glasses behind your usual pace. A glass now is an easy win.",
      time: "15:00",
      context: "Hydration tracking vs. typical afternoon pattern",
    },
  ];
  if (scenario === "poor_sleep") {
    base.unshift({
      id: "nudge-poor-sleep",
      title: "Let's make today gentler",
      body: "You slept 5h 12m last night. I've switched your movement goal to a 15-minute walk.",
      time: "08:00",
      context: "Wearable sleep data < 6h",
    });
  }
  if (scenario === "struggling") {
    base.unshift({
      id: "nudge-recovery",
      title: "One missed day doesn't reset you",
      body: "Let's move your morning habit to lunchtime when your schedule is more predictable.",
      time: "09:00",
      context: "3+ missed morning habits in the last week",
    });
  }
  return base;
}

export function buildDemoContent(): ContentItem[] {
  return [
    {
      id: "walking-habit",
      title: "How to build a sustainable walking habit",
      excerpt: "Walking is the highest-leverage movement most people can do. Here's how to make it stick.",
      category: "movement",
      readMinutes: 5,
      type: "article",
      body: "Most people overestimate what they can do in a day and underestimate what they can do in a month. Walking 20 minutes a day is 122 hours of movement a year — about 5 full days of low-impact activity. The trick is to attach it to something you already do.\n\nStart with a tiny version: walk for 5 minutes after lunch. That's it. Don't worry about pace or distance. After a week, expand to 10 minutes. After two weeks, you'll find yourself looking forward to it.\n\nThe most consistent walkers we see anchor their walk to a transition point: after lunch, after work, or after dinner. Pick one anchor and protect it. If you miss a day, simply resume the next day — never try to 'catch up' with a double walk.",
    },
    {
      id: "routine-breaks",
      title: "What to do when your routine breaks",
      excerpt: "Travel, illness, family. Life will interrupt your routine. Here's how to bounce back fast.",
      category: "routines",
      readMinutes: 4,
      type: "guide",
      body: "When your routine breaks, the temptation is to abandon it entirely. Resist that.\n\nThe 'two-day rule' is simple: never miss two days in a row. If you miss one day, that's information. If you miss two, you've started a new (worse) habit.\n\nWhen you come back, halve your goal for the first session. A 10-minute walk instead of 20. A 3-minute meditation instead of 10. The goal isn't to win back lost progress — it's to remind your brain that this is who you are now.",
    },
    {
      id: "stress-reset-10",
      title: "A 10-minute stress reset",
      excerpt: "Box breathing + a short walk. Resets your nervous system in 10 minutes.",
      category: "stress",
      readMinutes: 3,
      type: "micro",
      body: "When stress spikes, your sympathetic nervous system is in overdrive. The fastest way to bring it back online is slow nasal breathing.\n\nTry this: inhale through your nose for 4 counts. Hold for 4. Exhale through your mouth for 4. Hold for 4. Repeat for 8 rounds.\n\nThen stand up and walk for 5 minutes — even just around your home. The combination of regulated breathing and movement is one of the most effective non-pharmacological stress resets we know of.",
    },
    {
      id: "protein-breakfast",
      title: "Protein-rich breakfast ideas",
      excerpt: "Five quick breakfasts that pack 25+ grams of protein and take under 7 minutes.",
      category: "nutrition",
      readMinutes: 5,
      type: "recipe",
      body: "1. Greek yogurt with berries and seeds — 22g protein, 2 min.\n2. Two eggs on whole-grain toast — 18g protein, 6 min.\n3. Cottage cheese with cherry tomatoes — 24g protein, 2 min.\n4. Protein smoothie (banana, milk, scoop protein) — 30g protein, 3 min.\n5. Overnight oats with milk and nut butter — 20g protein, prep the night before.\n\nPick one and rotate. Don't try to be creative with breakfast — be consistent.",
    },
    {
      id: "wind-down",
      title: "The 30-minute wind-down",
      excerpt: "A simple evening routine that makes falling asleep easier.",
      category: "sleep",
      readMinutes: 4,
      type: "guide",
      body: "Your brain needs a transition between stimulation and sleep. If you're working or scrolling until your head hits the pillow, your sleep will be worse.\n\n30 minutes before bed: dim the lights, switch off overhead lighting.\n20 minutes before bed: stop screens, or switch to night mode + low brightness.\n10 minutes before bed: do something boring. Read a physical book, stretch gently, or write tomorrow's top 3 priorities.\n\nThis isn't about 'sleep hygiene' as a buzzword. It's about giving your nervous system permission to slow down.",
    },
    {
      id: "habit-stacking",
      title: "Habit stacking — the easiest way to start",
      excerpt: "Don't try to find time. Attach new habits to existing ones.",
      category: "routines",
      readMinutes: 3,
      type: "tip",
      body: "After I [existing habit], I will [new habit] for [duration].\n\nExamples:\nAfter I pour my morning coffee, I will drink one glass of water.\nAfter I close my laptop at the end of the workday, I will walk for 10 minutes.\nAfter I brush my teeth, I will do 30 seconds of deep breathing.\n\nThe anchor habit must be something you already do reliably. The new habit must be small enough to feel almost too easy. Don't stack three habits on day one — pick one and let it set.",
    },
    {
      id: "caffeine-timing",
      title: "When you drink caffeine matters more than how much",
      excerpt: "Caffeine has a 5-6 hour half-life. A 3 PM coffee still affects you at 9 PM.",
      category: "sleep",
      readMinutes: 4,
      type: "article",
      body: "Most people think about caffeine as 'how much' — but timing matters more.\n\nCaffeine works by blocking adenosine, the chemical that makes you feel sleepy. Your body processes caffeine slowly: a 3 PM coffee still has half its effect at 9 PM and a quarter of its effect at 3 AM.\n\nIf you struggle to fall asleep, set a hard cutoff for caffeine 9 hours before your bedtime. If you sleep at 11 PM, your last coffee should be at 2 PM.\n\nThis single change improves sleep onset for most people more than any supplement.",
    },
    {
      id: "movement-snacks",
      title: "Movement snacks — fitness in 2-minute bursts",
      excerpt: "Three 2-minute movement breaks = a meaningful chunk of daily activity.",
      category: "movement",
      readMinutes: 3,
      type: "tip",
      body: "If you can't find a 30-minute block for exercise, use 'movement snacks': short 2-minute bursts spread across the day.\n\nTry:\n- 10 squats after a meeting\n- A 1-minute wall sit before lunch\n- 30 seconds of jumping jacks when you make tea\n\nThree of these add up to meaningful activity without needing to change clothes or block time.",
    },
    {
      id: "evening-stress",
      title: "Why your stress spikes at 9 PM",
      excerpt: "Late-evening stress is often a sign of unfinished cognitive work.",
      category: "stress",
      readMinutes: 4,
      type: "article",
      body: "Many people report a stress spike between 9 PM and 11 PM. There's a reason: your brain is trying to offload unfinished cognitive work.\n\nThe fix is a 'closing ritual' — a 5-minute review of the day where you write down anything unresolved and pick the top 3 priorities for tomorrow.\n\nThis signals to your brain that nothing will be lost, which lowers the urge to keep ruminating. Combined with the 30-minute wind-down, this is one of the most effective evening stress interventions.",
    },
  ];
}

export function buildDemoTimeline(scenario: DemoScenario): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "t1",
      date: daysAgoISO(21),
      type: "habit_started",
      title: "Started walking habit",
      description: "Set a 20-minute walk goal, 5 days/week.",
      icon: "walk",
    },
    {
      id: "t2",
      date: daysAgoISO(19),
      type: "streak",
      title: "3-day streak",
      description: "Your first consistent stretch with the evening walk.",
      icon: "walk",
    },
    {
      id: "t3",
      date: daysAgoISO(16),
      type: "device_connected",
      title: "Connected Apple Health",
      description: "Steps and sleep now sync automatically.",
      icon: "device",
    },
    {
      id: "t4",
      date: daysAgoISO(14),
      type: "improvement",
      title: "Sleep routine improved",
      description: "Sleep averaged 7.2h, up from 6.4h the prior week.",
      icon: "sleep",
    },
    {
      id: "t5",
      date: daysAgoISO(10),
      type: "milestone",
      title: "Reached 70% habit consistency",
      description: "Crossed the threshold where habits start to feel automatic.",
      icon: "trophy",
    },
    {
      id: "t6",
      date: daysAgoISO(7),
      type: "plan_adapted",
      title: "Coach moved morning workout to 6:30 PM",
      description: "After 3 missed mornings, the coach suggested evenings when your schedule is more predictable.",
      icon: "plan",
    },
    {
      id: "t7",
      date: daysAgoISO(4),
      type: "streak",
      title: "7-day stress reset streak",
      description: "Completed the 5-minute reset every day for a week.",
      icon: "stress",
    },
    {
      id: "t8",
      date: daysAgoISO(1),
      type: "goal_completed",
      title: "Hit 8,000 steps for the first time",
      description: "Reached your movement goal 5/7 days this week.",
      icon: "walk",
    },
  ];

  if (scenario === "struggling") {
    events.push({
      id: "t9-struggle",
      date: daysAgoISO(2),
      type: "plan_adapted",
      title: "Coach reduced weekly target",
      description: "Lowered your habit target from 5 to 3 days/week to rebuild momentum.",
      icon: "plan",
    });
  }

  if (scenario === "successful") {
    events.push({
      id: "t9-success",
      date: daysAgoISO(2),
      type: "milestone",
      title: "9-day streak — your longest yet",
      description: "Coach suggested adding a morning movement session next week.",
      icon: "trophy",
    });
  }

  return events;
}

export function buildDemoWeeklyReview(scenario: DemoScenario): WeeklyReview {
  if (scenario === "struggling") {
    return {
      weekStartDate: daysAgoISO(7),
      daysShownUp: 3,
      strongestHabitId: "stress-reset",
      biggestImprovement: "stress",
      coachNote: "Shorter workouts are leading to better consistency. Let's keep your goal at 15 minutes and increase frequency slightly.",
      nextWeekPlan: "4 × 15-minute sessions, down from 5 × 30-minute.",
      currentGoal: "5 workouts",
      actualCompletion: 0.6,
    };
  }
  if (scenario === "successful") {
    return {
      weekStartDate: daysAgoISO(7),
      daysShownUp: 6,
      strongestHabitId: "walk-20",
      biggestImprovement: "movement",
      coachNote: "Your evening walks have become automatic. Let's add one short morning movement session next week.",
      nextWeekPlan: "Add a 10-minute morning stretch, 3 days/week.",
      currentGoal: "5 workouts",
      actualCompletion: 0.85,
    };
  }
  return {
    weekStartDate: daysAgoISO(7),
    daysShownUp: 5,
    strongestHabitId: "walk-20",
    biggestImprovement: "sleep",
    coachNote: "You're most consistent on days when you plan your workout before lunch. Let's anchor that pattern next week.",
    nextWeekPlan: "Schedule movement before lunch, 4 days/week.",
    currentGoal: "5 workouts",
    actualCompletion: 0.7,
  };
}

export function buildDemoState(scenario: DemoScenario): AppState {
  return {
    view: "home",
    onboardingStep: 0,
    profile: buildDemoProfile(scenario),
    habits: buildDemoHabits(scenario),
    metrics: buildDemoMetrics(scenario),
    coachConversation: [],
    insights: buildDemoInsights(scenario),
    nudges: buildDemoNudges(scenario),
    content: buildDemoContent(),
    timeline: buildDemoTimeline(scenario),
    weeklyReview: buildDemoWeeklyReview(scenario),
    nudgeFrequency: "balanced",
    preferredCoachingTime: "morning",
    weeklySummaryEnabled: true,
    progressUpdatesEnabled: true,
    largeTextMode: false,
    activeActivity: null,
    analyticsEvents: [
      { type: "demo_loaded", timestamp: new Date().toISOString(), properties: { scenario } },
    ],
    demoScenario: scenario,
  };
}
