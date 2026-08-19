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
  // FEATURE 1 — Life-Aware Adaptive Plan
  lifeContexts: LifeContext[];
  calendarEvents: CalendarEvent[];
  todayPlan: PlanItem[];
  planAdaptations: PlanAdaptation[];
  pendingAdaptation: PlanAdaptation | null;
  // FEATURE 2 — Recovery Mode
  recovery: RecoveryState | null;
  // FEATURE 3 — Health Interpreter
  recommendations: Recommendation[];
  healthPatterns: HealthPattern[];
  // FEATURE 5 — Coach Silence + Trust Layer
  coachMode: CoachMode;
  proactiveMessages: ProactiveMessage[];
  // FEATURE 6 — Long-Term Adaptive Planning
  planHierarchy: PlanHierarchy | null;
  planHorizon: PlanHorizon;           // active tab: today/week/month/quarter
  planningInsights: PlanningInsight[];
  cascadeAdaptations: PlanAdaptationCascade[];
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
  | "plan_lab"
  | "today_plan"
  | "recovery"
  | "life_context"
  | "plan";

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean>;
}

export type DemoScenario =
  | "new"
  | "successful"
  | "struggling"
  | "poor_sleep"
  | "safety"
  | "busy_day"
  | "travel_day"
  | "recovery";

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

// ============================================================
// FEATURE 1 — Life-Aware Adaptive Plan
// ============================================================

export type LifeContextType =
  | "busy"
  | "travel"
  | "wfh"
  | "office"
  | "low_energy"
  | "high_stress"
  | "more_time"
  | "social"
  | "poor_sleep";

export interface LifeContext {
  id: string;
  type: LifeContextType;
  label: string;
  note?: string;          // natural-language input
  date: string;           // ISO date the context applies to
  addedAt: string;
}

export interface CalendarEvent {
  id: string;
  time: string;           // "08:30"
  endTime?: string;       // "10:00"
  title: string;
  category: "meeting" | "lunch" | "free" | "personal" | "travel" | "dinner" | "focus";
  durationMin: number;
  simulated?: boolean;    // mark mock calendar data
}

export interface PlanItem {
  id: string;
  time: string;           // "07:00"
  period: "morning" | "lunch" | "afternoon" | "evening";
  title: string;
  description?: string;
  category: "movement" | "sleep" | "nutrition" | "stress" | "routines";
  durationMin: number;
  completed: boolean;
  skipped: boolean;
  adapted: boolean;             // was this changed by the engine?
  originalTitle?: string;       // what it was before adaptation
  originalDurationMin?: number;
  adaptationReason?: string;
}

export interface PlanAdaptation {
  id: string;
  date: string;
  trigger: AdaptationTrigger;
  triggerLabel: string;        // human-readable
  changes: PlanAdaptationChange[];
  accepted?: boolean;          // user accepted/rejected
}

export type AdaptationTrigger =
  | "low_sleep"
  | "busy_day"
  | "travel"
  | "recovery"
  | "high_stress"
  | "high_completion"
  | "low_completion"
  | "calendar_block"
  | "user_context";

export interface PlanAdaptationChange {
  what: string;          // "Reduced workout from 30 min to 10 min walk"
  why: string;           // "Your sleep was below baseline"
  action: string;        // "10-minute walk"
}

// ============================================================
// FEATURE 2 — Recovery Mode / No-Guilt Engine
// ============================================================

export interface RecoveryState {
  active: boolean;
  trigger: "repeated_misses" | "low_sleep" | "high_stress" | "schedule_disruption" | "user_request";
  triggerLabel: string;
  startedAt: string;
  plan: RecoveryPlanItem[];
  recoveryConsistency: number;     // 0-1, alternative to streak
  daysActive: number;
}

export interface RecoveryPlanItem {
  day: string;             // "Today" | "Tomorrow" | "Thursday"
  date: string;
  title: string;
  durationMin: number;
  completed: boolean;
}

// ============================================================
// FEATURE 3 — "Why?" Health Interpreter
// ============================================================

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  action: RecommendationAction;
  why: string[];                    // bullet reasons
  dataUsed: string[];               // what data was considered
  confidence: "low" | "moderate" | "high";
  priority: "low" | "medium" | "high";
  alternative?: string;             // alternative action
  userControl?: string;             // e.g. "Use normal plan instead"
  category: "movement" | "sleep" | "nutrition" | "stress" | "routines";
}

export type RecommendationAction =
  | "start_walk"
  | "adjust_plan"
  | "schedule_habit"
  | "tell_me_more"
  | "rest_today"
  | "use_lighter_plan"
  | "use_normal_plan"
  | "find_support";

export interface HealthPattern {
  id: string;
  title: string;
  detail: string;
  dataConsidered: string[];
  confidence: "low" | "moderate" | "high";
  category: "pattern" | "success" | "barrier";
}

// ============================================================
// FEATURE 5 — Coach Silence + Trust Layer
// ============================================================

export type CoachMode = "active" | "quiet" | "focus" | "recovery" | "off";

export interface CoachModeInfo {
  mode: CoachMode;
  label: string;
  description: string;
  proactiveAllowed: boolean;
}

export interface ProactiveMessage {
  id: string;
  title: string;
  body: string;
  reason: string;
  action: string;
  priority: "low" | "medium" | "high";
  confidence: "low" | "moderate" | "high";
  category: "recommended" | "scheduled" | "quiet";
  dismissed?: boolean;
  snoozedUntil?: string;
  // "should I speak?" decision inputs
  usefulness: number;        // 0-1
  novelty: number;            // 0-1 (low if repeated)
  notificationBurden: number; // 0-1 (high if many recent)
  shouldSpeak: boolean;       // computed
}

// ============================================================
// FEATURE 6 — Long-Term Adaptive Planning (Quarter → Month → Week → Today)
// ============================================================

export type PlanStatus = "on_track" | "adapted" | "needs_attention" | "at_risk" | "completed";

export type PlanHorizon = "today" | "week" | "month" | "quarter";

export interface QuarterlyGoal {
  id: string;
  quarterLabel: string;            // "Q3 2024"
  primaryObjective: string;        // "Build a sustainable fitness and recovery routine"
  outcomes: QuarterlyOutcome[];
  milestones: MonthlyMilestone[];   // 3 monthly milestones
  startDate: string;
  endDate: string;
  status: PlanStatus;
}

export interface QuarterlyOutcome {
  id: string;
  label: string;                    // "Movement consistency"
  baseline: number;                 // 42
  target: number;                   // 70
  current: number;                  // 63
  unit: string;                     // "%" or "sessions"
  trend: "up" | "down" | "flat";
  confidence: "low" | "moderate" | "high";
  status: PlanStatus;
  rationale?: string;
}

export interface MonthlyMilestone {
  id: string;
  monthLabel: string;              // "Month 1 — Establish"
  monthNumber: 1 | 2 | 3;
  focus: string;                   // "Build consistent movement and sleep habits"
  startDate: string;
  endDate: string;
  goals: MonthlyGoal[];
  status: PlanStatus;
  current: boolean;                // is this the active month
}

export interface MonthlyGoal {
  id: string;
  label: string;                   // "Movement sessions"
  target: number;                  // 16
  current: number;                 // 9
  projected: number;               // 14 (based on current pace)
  unit: string;                    // "sessions"
  status: PlanStatus;
  adjustmentRecommended?: {
    newTarget: number;
    reason: string;
    difficulty: "easier" | "balanced" | "more_demanding";
  };
}

export interface WeeklyPlan {
  id: string;
  weekLabel: string;               // "Week of Sept 7"
  weekNumber: number;              // 1-13 within quarter
  objective: string;               // "Complete 4 movement sessions without compromising recovery"
  startDate: string;
  endDate: string;
  days: WeeklyDayPlan[];
  status: PlanStatus;
  completedSessions: number;
  targetSessions: number;
  adaptedSessions: number;
  recoverySessions: number;
  current: boolean;                // is this the active week
}

export interface WeeklyDayPlan {
  id: string;
  day: string;                     // "Monday"
  date: string;                    // ISO date
  title: string;                   // "15-min walk" or "Recovery" or "Flexible"
  category: "movement" | "recovery" | "flexible" | "rest" | "outdoor";
  durationMin: number;
  completed: boolean;
  skipped: boolean;
  movedTo?: string;                // ISO date if moved
  movedFrom?: string;             // ISO date if moved from elsewhere
  adapted: boolean;
  adaptationReason?: string;
  originalTitle?: string;
  originalDurationMin?: number;
}

export interface PlanHierarchy {
  quarter: QuarterlyGoal;
  currentMonth: MonthlyMilestone;
  currentWeek: WeeklyPlan;
  // today's plan is already in AppState.todayPlan
}

export interface PlanningInsight {
  id: string;
  title: string;
  body: string;
  category: "observation" | "recommendation";
  confidence: "low" | "moderate" | "high";
  scope: "quarter" | "month" | "week" | "today";
  action?: string;
}

export interface PlanAdaptationCascade {
  id: string;
  trigger: string;                 // "I only have 10 minutes"
  todayChange: string;             // "30-min workout → 10-min workout"
  weekChange: string;              // "Still 4 sessions"
  monthChange: string;             // "Still achievable"
  quarterChange: string;           // "No change"
  message: string;
  timestamp: string;
}

