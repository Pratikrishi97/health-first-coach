// ============================================================
// Health-First Coach — Core Domain Types
// ============================================================

export type Goal =
  | "fitness"
  | "weight"
  | "sleep"
  | "stress"
  | "nutrition"
  | "routines";

export type CoachingStyle = "gentle" | "encouraging" | "direct" | "data";

export type Challenge =
  | "motivation"
  | "time"
  | "consistency"
  | "food"
  | "exercise"
  | "sleep"
  | "stress"
  | "knowledge";

export type WorkStyle = "desk" | "on_feet" | "remote" | "mixed" | "shift";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type EatingPattern = "regular" | "skip_breakfast" | "late eater" | "grazer";

export type DeviceProvider =
  | "apple_health"
  | "google_health"
  | "fitbit"
  | "garmin"
  | "oura";

export interface DeviceConnection {
  provider: DeviceProvider;
  connected: boolean;
  lastSyncedAt: string | null;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: "movement" | "sleep" | "nutrition" | "stress" | "routines";
  targetPerWeek: number;
  completedThisWeek: number;
  currentStreak: number;
  bestStreak: number;
  difficulty: "easy" | "medium" | "hard";
  scheduledTime: string;        // e.g. "07:00"
  paused: boolean;
  history: boolean[];           // last 7 days, oldest first
  createdAt: string;
}

export interface DailyMetric {
  date: string;                  // ISO date
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepGoalHours: number;
  hydrationGlasses: number;
  hydrationGoal: number;
  stressLevel: number;           // 0-100
  stressResetsCompleted: number;
  activeMinutes: number;
  restingHeartRate: number | null;
  weightKg: number | null;
}

export interface CoachMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  createdAt: string;
  meta?: {
    suggestion?: CoachSuggestion;
    safety?: SafetyFlag;
    insight?: string;
  };
}

export type CoachSuggestion =
  | "adjust_plan"
  | "keep_plan"
  | "tell_me_more"
  | "find_support"
  | "continue_wellness"
  | "start_walk"
  | "schedule_habit";

export type SafetyFlag =
  | "none"
  | "medical_question"
  | "emergency"
  | "mental_health";

export interface InsightCard {
  id: string;
  title: string;
  detail: string;
  rationale: string;             // "How was this calculated?"
  category: "pattern" | "success" | "barrier";
}

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  category: "nutrition" | "movement" | "sleep" | "stress" | "routines";
  readMinutes: number;
  type: "article" | "guide" | "tip" | "recipe" | "micro";
  body?: string;
}

export interface NudgeItem {
  id: string;
  title: string;
  body: string;
  time: string;
  context: string;               // why this nudge was generated
  dismissed?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  primaryGoal: Goal;
  secondaryGoals: Goal[];
  challenge: Challenge;
  workStyle: WorkStyle;
  activityLevel: ActivityLevel;
  eatingPattern: EatingPattern;
  exerciseFrequency: string;     // "0-1x/week" etc
  stressLevel: number;            // 0-100
  typicalSleepHours: number;
  coachingStyle: CoachingStyle;
  devices: DeviceConnection[];
  createdAt: string;
  onboardingComplete: boolean;
}

export interface AppState {
  // app lifecycle
  view: AppView;
  onboardingStep: number;
  // user
  profile: UserProfile | null;
  // data
  habits: Habit[];
  metrics: DailyMetric[];
  coachConversation: CoachMessage[];
  insights: InsightCard[];
  nudges: NudgeItem[];
  content: ContentItem[];
  timeline: TimelineEvent[];
  weeklyReview: WeeklyReview | null;
  // prefs
  nudgeFrequency: "minimal" | "balanced" | "frequent";
  preferredCoachingTime: "morning" | "midday" | "evening";
  weeklySummaryEnabled: boolean;
  progressUpdatesEnabled: boolean;
  largeTextMode: boolean;
  // activity (Next Best Action in-progress state)
  activeActivity: ActiveActivity | null;
  // analytics
  analyticsEvents: AnalyticsEvent[];
  // demo
  demoScenario: DemoScenario;
}

export interface TimelineEvent {
  id: string;
  date: string;                // ISO date
  type: "habit_started" | "streak" | "milestone" | "improvement" | "device_connected" | "plan_adapted" | "goal_completed";
  title: string;
  description?: string;
  icon?: "walk" | "sleep" | "stress" | "eat" | "trophy" | "device" | "plan" | "check";
}

export interface WeeklyReview {
  weekStartDate: string;
  daysShownUp: number;            // 0-7
  strongestHabitId: string;
  biggestImprovement: "sleep" | "movement" | "nutrition" | "stress";
  coachNote: string;
  nextWeekPlan: string;
  currentGoal: string;
  actualCompletion: number;       // 0-1
}

export interface ActiveActivity {
  habitId: string;
  title: string;
  durationMinutes: number;
  startedAt: string;
  progressMinutes: number;
  completed: boolean;
}

export type AppView =
  | "landing"
  | "onboarding"
  | "home"
  | "coach"
  | "habits"
  | "progress"
  | "learn"
  | "learn_item"
  | "profile"
  | "privacy"
  | "devices"
  | "safety"
  | "nudges"
  | "timeline"
  | "weekly_review"
  | "plan_lab";

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
}

export type DemoScenario = "new" | "successful" | "struggling" | "poor_sleep" | "safety";

// ============================================================
// Plan output from onboarding
// ============================================================

export interface PlanFocus {
  label: string;
  description: string;
  icon: "move" | "sleep" | "eat" | "stress";
}

export interface PersonalizedPlan {
  durationDays: number;
  focuses: PlanFocus[];
  firstWin: string;
}
