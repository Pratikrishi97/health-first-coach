"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Footprints,
  Moon,
  Droplets,
  Brain,
  Salad,
  Calendar,
  Pause,
  Play,
  Pencil,
  TrendingUp,
  Target,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";

const CATEGORY_ICONS = {
  movement: Footprints,
  sleep: Moon,
  nutrition: Salad,
  stress: Brain,
  routines: Calendar,
};

export function HabitsView() {
  const habits = useAppStore((s) => s.habits);
  const toggleHabit = useAppStore((s) => s.toggleHabitToday);
  const adjustHabit = useAppStore((s) => s.adjustHabit);
  const pauseHabit = useAppStore((s) => s.pauseHabit);
  const replaceHabit = useAppStore((s) => s.replaceHabit);
  const track = useAppStore((s) => s.track);
  const setView = useAppStore((s) => s.setView);

  const [editing, setEditing] = useState<Habit | null>(null);

  const activeHabits = habits.filter((h) => !h.paused);
  const pausedHabits = habits.filter((h) => h.paused);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Your habits</h1>
        <p className="mt-1 text-muted-foreground">
          Small actions, repeated. Adjust, pause, or replace any habit as your life changes.
        </p>
      </header>

      {/* Summary card */}
      <Card className="p-5 mb-6 card-soft">
        <div className="grid grid-cols-3 gap-4">
          <SummaryStat label="Active" value={String(activeHabits.length)} icon={Target} />
          <SummaryStat
            label="Weekly avg"
            value={`${Math.round(computeWeeklyAvg(activeHabits) * 100)}%`}
            icon={TrendingUp}
          />
          <SummaryStat
            label="Best streak"
            value={`${Math.max(0, ...habits.map((h) => h.bestStreak))}d`}
            icon={Calendar}
          />
        </div>
      </Card>

      {/* Active habit cards */}
      <section className="space-y-3">
        {activeHabits.map((h) => {
          const Icon = CATEGORY_ICONS[h.category] ?? Footprints;
          const completed = h.history[h.history.length - 1];
          const pct = Math.round((h.completedThisWeek / h.targetPerWeek) * 100);

          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 card-soft card-soft-hover">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleHabit(h.id)}
                    aria-label={completed ? "Mark as not done" : "Mark as done"}
                    className={cn(
                      "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      completed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{h.title}</h3>
                      {h.difficulty !== "easy" && (
                        <Badge variant="outline" className="text-[10px]">
                          {h.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{h.description}</p>

                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <Stat label="This week" value={`${h.completedThisWeek}/${h.targetPerWeek} · ${pct}%`} />
                      <Stat label="Streak" value={`${h.currentStreak} days`} />
                      <Stat label="Best" value={`${h.bestStreak} days`} />
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{pct}%</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      {h.history.map((done, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1.5 rounded-full",
                            done ? "bg-primary" : "bg-muted"
                          )}
                          title={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {formatTime(h.scheduledTime)}
                    </Badge>
                    <button
                      onClick={() => setEditing(h)}
                      className="text-xs text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-colors"
                      aria-label="Adjust habit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {activeHabits.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-2">🌱</div>
            <h3 className="font-semibold mb-1">You don&apos;t have a habit yet.</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start with one small change. You can always add more.
            </p>
            <Button onClick={() => setView("coach")}>
              Ask your coach to suggest one
            </Button>
          </Card>
        )}
      </section>

      {/* Paused */}
      {pausedHabits.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Paused
          </h2>
          <div className="space-y-2">
            {pausedHabits.map((h) => (
              <Card key={h.id} className="p-4 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{h.title}</div>
                    <div className="text-xs text-muted-foreground">Paused · pick up where you left off</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => pauseHabit(h.id, false)}>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Resume
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Adjust dialog */}
      {editing && (
        <AdjustHabitDialog
          habit={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            adjustHabit(editing.id, patch);
            track("habit_adjusted", { habitId: editing.id });
            setEditing(null);
          }}
          onPause={() => {
            pauseHabit(editing.id, true);
            track("habit_paused", { habitId: editing.id, paused: true });
            setEditing(null);
          }}
          onReplace={(newHabit) => {
            replaceHabit(editing.id, newHabit);
            track("habit_replaced", { habitId: editing.id });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Adjust habit dialog — adjust target/timing/difficulty, pause, or replace
// ============================================================

function AdjustHabitDialog({
  habit,
  onClose,
  onSave,
  onPause,
  onReplace,
}: {
  habit: Habit;
  onClose: () => void;
  onSave: (patch: Partial<Habit>) => void;
  onPause: () => void;
  onReplace: (h: Habit) => void;
}) {
  const [targetPerWeek, setTargetPerWeek] = useState(habit.targetPerWeek);
  const [scheduledTime, setScheduledTime] = useState(habit.scheduledTime);
  const [difficulty, setDifficulty] = useState(habit.difficulty);
  const [replaceMode, setReplaceMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleReplace = () => {
    if (!newTitle.trim()) return;
    onReplace({
      ...habit,
      title: newTitle.trim(),
      description: newDescription.trim() || habit.description,
      targetPerWeek,
      scheduledTime,
      difficulty,
      completedThisWeek: 0,
      currentStreak: 0,
      history: Array(7).fill(false),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            {replaceMode ? "Replace habit" : "Adjust habit"}
          </DialogTitle>
          <DialogDescription>
            {replaceMode
              ? "Swap this for something that fits your life better. Streak resets, but momentum carries over."
              : "Adapt the target, timing, or difficulty. Your coach will use the new settings from today."}
          </DialogDescription>
        </DialogHeader>

        {!replaceMode ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Habit</Label>
              <div className="text-sm font-medium mt-1">{habit.title}</div>
            </div>

            <div>
              <Label className="text-xs">Weekly target</Label>
              <div className="flex items-center gap-2 mt-1.5">
                {[3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTargetPerWeek(n)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                      targetPerWeek === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {n}/wk
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Scheduled time</Label>
              <Select value={scheduledTime} onValueChange={setScheduledTime}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["06:00", "07:00", "08:00", "12:30", "15:00", "18:00", "20:00", "22:00"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatTime(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Difficulty</Label>
              <div className="flex items-center gap-2 mt-1.5">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-colors",
                      difficulty === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-title" className="text-xs">New habit title</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 10-minute morning stretch"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="new-desc" className="text-xs">Description (optional)</Label>
              <Input
                id="new-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. After coffee, before email"
                className="mt-1.5"
              />
            </div>
            <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
              Replacing keeps the same category, time slot, and weekly target. You can adjust those next.
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPause}
            className="text-muted-foreground"
          >
            <Pause className="h-3.5 w-3.5 mr-1.5" />
            Pause habit
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setReplaceMode((v) => !v)}>
            {replaceMode ? "Back" : "Replace"}
          </Button>
          <Button
            size="sm"
            onClick={() => (replaceMode ? handleReplace() : onSave({ targetPerWeek, scheduledTime, difficulty }))}
            disabled={replaceMode && !newTitle.trim()}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function SummaryStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Target }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

function computeWeeklyAvg(habits: Habit[]): number {
  if (!habits.length) return 0;
  const total = habits.reduce((s, h) => s + h.targetPerWeek, 0);
  const done = habits.reduce((s, h) => s + h.completedThisWeek, 0);
  return total ? done / total : 0;
}
