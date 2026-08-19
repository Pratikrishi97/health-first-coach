"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Lightbulb,
  Footprints,
  Moon,
  Brain,
  Salad,
  Clock,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CoachMessage } from "@/lib/types";
import { TypingDots, StaggerGroup, StaggerItem, MOTION } from "@/lib/motion";

export function CoachView() {
  const profile = useAppStore((s) => s.profile);
  const conversation = useAppStore((s) => s.coachConversation);
  const send = useAppStore((s) => s.sendCoachMessage);
  const setView = useAppStore((s) => s.setView);
  const adjustHabit = useAppStore((s) => s.adjustHabit);
  const habits = useAppStore((s) => s.habits);
  const today = useAppStore((s) => s.metrics[s.metrics.length - 1]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation, typing]);

  const handleSend = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    setTyping(true);
    setTimeout(() => {
      send(value);
      setTyping(false);
      inputRef.current?.focus();
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!profile) return null;

  const quickPrompts = getQuickPrompts(profile);
  const contextChips = buildContextChips(today, habits);

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <header className="border-b border-border glass">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.spring }}
            className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-premium-sm relative"
          >
            <Sparkles className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background pulse-dot" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight">Your Coach</div>
            <div className="text-xs text-muted-foreground truncate">
              {profile.coachingStyle} tone · remembers your context
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView("safety")}
            className="hidden sm:inline-flex"
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            Safety boundaries
          </Button>
        </div>
      </header>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto slim-scroll px-4 sm:px-6 py-6"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {conversation.length === 0 && (
            <EmptyCoach
              name={profile.name.split(" ")[0]}
              contextChips={contextChips}
              quickPrompts={quickPrompts}
              onPick={(t) => handleSend(t)}
            />
          )}

          <AnimatePresence initial={false}>
            {conversation.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
              >
                <MessageBubble
                  msg={msg}
                  onSuggestion={(s) => {
                    if (s === "adjust_plan") {
                      const target = habits.find((h) => h.id === "walk-20");
                      if (target) adjustHabit(target.id, { targetPerWeek: Math.max(3, target.targetPerWeek - 1) });
                      setView("habits");
                    } else if (s === "schedule_habit") {
                      setView("habits");
                    } else if (s === "find_support") {
                      setView("safety");
                    } else if (s === "start_walk") {
                      setView("home");
                    } else if (s === "tell_me_more") {
                      handleSend("Tell me more about the box-breathing reset");
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 items-start"
            >
              <CoachAvatar />
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3.5">
                <TypingDots className="text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3 md:py-4">
        <div className="mx-auto max-w-3xl">
          {conversation.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.slice(0, 3).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-xs font-medium transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring overflow-hidden">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask your coach anything…"
                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm max-h-32"
                style={{ minHeight: "44px" }}
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || typing}
              size="icon"
              className="h-11 w-11 rounded-full shrink-0 shadow-premium-sm"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground text-center">
            Wellness guidance only — not medical advice.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function CoachAvatar() {
  return (
    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-premium-sm">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function EmptyCoach({
  name,
  contextChips,
  quickPrompts,
  onPick,
}: {
  name: string;
  contextChips: { label: string; icon: LucideIcon }[];
  quickPrompts: string[];
  onPick: (t: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.duration.standard }}
      className="space-y-4"
    >
      <div className="flex gap-2 items-start">
        <CoachAvatar />
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
          <p className="text-sm leading-relaxed">
            Hi {name}. I&apos;m your Health-First coach. I can see your goals, habits, sleep, and recent activity — and I&apos;ll adapt my suggestions based on what&apos;s happening in your day. What&apos;s on your mind?
          </p>
        </div>
      </div>

      {/* Context chips — show what the coach is "seeing" */}
      <div className="flex flex-wrap gap-1.5 pl-10">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground self-center mr-1">
          Coach sees:
        </span>
        {contextChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[11px] text-muted-foreground border border-border"
            >
              <Icon className="h-2.5 w-2.5" />
              {chip.label}
            </span>
          );
        })}
      </div>

      <StaggerGroup className="grid sm:grid-cols-2 gap-2">
        {quickPrompts.map((p) => (
          <StaggerItem key={p}>
            <button
              onClick={() => onPick(p)}
              className="w-full text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm flex items-center justify-between gap-2 group"
            >
              <span>{p}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </motion.div>
  );
}

function MessageBubble({
  msg,
  onSuggestion,
}: {
  msg: CoachMessage;
  onSuggestion: (s: NonNullable<CoachMessage["meta"]>["suggestion"]) => void;
}) {
  const isUser = msg.role === "user";
  const hasSafety = msg.meta?.safety && msg.meta.safety !== "none";
  const suggestion = msg.meta?.suggestion;
  const insight = msg.meta?.insight;

  // Render coach message as actionable card when it has a suggestion
  const isActionCard = !isUser && suggestion && !hasSafety;

  return (
    <div className={cn("flex gap-2 items-start", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="h-8 w-8 rounded-xl bg-muted text-foreground flex items-center justify-center text-xs font-semibold shrink-0">
          You
        </div>
      ) : (
        <CoachAvatar />
      )}
      <div className={cn("max-w-[85%] sm:max-w-[75%]", isUser && "items-end")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.standard, ease: MOTION.easing.out }}
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm shadow-premium-sm"
              : hasSafety
              ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-tl-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          {/* Streaming-style reveal of coach messages */}
          {!isUser && msg.content.split("\n").map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={i > 0 ? "mt-2" : ""}
            >
              {line}
            </motion.p>
          ))}
          {isUser && msg.content}
        </motion.div>

        {/* Insight card */}
        {insight && !isUser && (
          <Card className="mt-2 p-3 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Why this works:</span> {insight}
              </div>
            </div>
          </Card>
        )}

        {/* Action card for coach suggestions */}
        {isActionCard && (
          <ActionCard
            suggestion={suggestion!}
            onSuggestion={onSuggestion}
          />
        )}

        {/* Safety buttons */}
        {suggestion && !isUser && hasSafety && (
          <div className="mt-2 flex flex-wrap gap-2">
            <SuggestionButton icon={ShieldAlert} label="Find support" primary onClick={() => onSuggestion("find_support")} />
            <SuggestionButton icon={ArrowRight} label="Continue wellness coaching" onClick={() => onSuggestion("continue_wellness")} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  suggestion,
  onSuggestion,
}: {
  suggestion: NonNullable<CoachMessage["meta"]>["suggestion"];
  onSuggestion: (s: NonNullable<CoachMessage["meta"]>["suggestion"]) => void;
}) {
  // Map suggestion to actionable card content
  const cards: Record<string, { title: string; body: string; cta: string; icon: LucideIcon; action: NonNullable<CoachMessage["meta"]>["suggestion"] }> = {
    start_walk: {
      title: "Start a 15-minute walk",
      body: "Counts toward your movement goal today.",
      cta: "Start walk",
      icon: Footprints,
      action: "start_walk",
    },
    adjust_plan: {
      title: "Adjust your plan",
      body: "Make today lighter based on your sleep and stress.",
      cta: "Adjust plan",
      icon: Calendar,
      action: "adjust_plan",
    },
    schedule_habit: {
      title: "Move habit to evening",
      body: "Evening workouts are more consistent for you.",
      cta: "Reschedule",
      icon: Clock,
      action: "schedule_habit",
    },
    keep_plan: {
      title: "Keep today's plan",
      body: "You're on track — no changes needed.",
      cta: "Keep plan",
      icon: Activity,
      action: "keep_plan",
    },
    tell_me_more: {
      title: "Learn the 5-min reset",
      body: "Box breathing that lowers stress in 5 minutes.",
      cta: "Tell me more",
      icon: Brain,
      action: "tell_me_more",
    },
  };

  const card = cards[suggestion ?? "tell_me_more"];
  if (!card) return null;
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.duration.standard, delay: 0.3 }}
    >
      <Card className="mt-2 p-3 card-premium bg-gradient-to-br from-primary/8 to-background border-primary/20">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{card.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.body}</div>
          </div>
        </div>
        <Button size="sm" className="mt-3 w-full shadow-premium-sm" onClick={() => onSuggestion(card.action)}>
          {card.cta}
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </Card>
    </motion.div>
  );
}

function SuggestionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Send;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <Button size="sm" variant={primary ? "default" : "outline"} onClick={onClick} className="text-xs">
      <Icon className="h-3 w-3 mr-1.5" />
      {label}
    </Button>
  );
}

// ============================================================
// Helpers
// ============================================================

function buildContextChips(
  today: { sleepHours: number; steps: number; stressLevel: number } | undefined,
  habits: { history: boolean[] }[]
): { label: string; icon: LucideIcon }[] {
  if (!today) {
    return [{ label: "Today's plan", icon: Calendar }];
  }
  const chips: { label: string; icon: LucideIcon }[] = [];
  chips.push({
    label: `${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m sleep`,
    icon: Moon,
  });
  chips.push({
    label: `${today.steps.toLocaleString()} steps`,
    icon: Footprints,
  });
  if (today.stressLevel >= 65) {
    chips.push({ label: `Stress ${today.stressLevel}`, icon: Brain });
  } else {
    chips.push({ label: `Stress ${today.stressLevel}`, icon: Brain });
  }
  const activeHabits = habits.filter((h) => !h.paused);
  const doneToday = activeHabits.filter((h) => h.history[h.history.length - 1]).length;
  chips.push({ label: `${doneToday}/${activeHabits.length} habits`, icon: Activity });
  return chips;
}

function getQuickPrompts(profile: { primaryGoal: string; typicalSleepHours: number }): string[] {
  const prompts = [
    "I didn't sleep well last night and I'm exhausted",
    "Should I work out today?",
    "I missed my morning workout again",
    "I'm feeling stressed about work",
    "What can I do in 10 minutes?",
    "Why am I struggling with this habit?",
  ];
  if (profile.primaryGoal === "stress") {
    prompts.unshift("Help me reset right now");
  }
  if (profile.primaryGoal === "sleep") {
    prompts.unshift("How can I sleep better tonight?");
  }
  return prompts.slice(0, 4);
}
