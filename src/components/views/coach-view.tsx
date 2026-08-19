"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ShieldAlert, ArrowRight, Calendar, Lightbulb } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CoachMessage } from "@/lib/types";

export function CoachView() {
  const profile = useAppStore((s) => s.profile);
  const conversation = useAppStore((s) => s.coachConversation);
  const send = useAppStore((s) => s.sendCoachMessage);
  const setView = useAppStore((s) => s.setView);
  const adjustHabit = useAppStore((s) => s.adjustHabit);
  const habits = useAppStore((s) => s.habits);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setTyping(true);
    // Simulate "thinking" delay for natural feel
    setTimeout(() => {
      send(text);
      setTyping(false);
      inputRef.current?.focus();
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!profile) return null;

  const quickPrompts = getQuickPrompts(profile);

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <header className="border-b border-border glass">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight">Your Coach</div>
            <div className="text-xs text-muted-foreground truncate">
              Personalized guidance · {profile.coachingStyle} tone
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
            <EmptyCoach name={profile.name.split(" ")[0]} quickPrompts={quickPrompts} onPick={(t) => setInput(t)} />
          )}

          <AnimatePresence initial={false}>
            {conversation.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <MessageBubble
                  msg={msg}
                  onSuggestion={(s) => {
                    if (s === "adjust_plan") {
                      const target = habits.find((h) => h.id === "walk-20");
                      if (target) {
                        adjustHabit(target.id, { targetPerWeek: Math.max(3, target.targetPerWeek - 1) });
                      }
                      setView("habits");
                    } else if (s === "schedule_habit") {
                      setView("habits");
                    } else if (s === "find_support") {
                      setView("safety");
                    } else if (s === "start_walk") {
                      setView("habits");
                    } else if (s === "tell_me_more") {
                      setInput("Tell me more about the box-breathing reset");
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
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
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
                  onClick={() => setInput(p)}
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
              onClick={handleSend}
              disabled={!input.trim() || typing}
              size="icon"
              className="h-11 w-11 rounded-full shrink-0"
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
    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function EmptyCoach({ name, quickPrompts, onPick }: { name: string; quickPrompts: string[]; onPick: (t: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
      <div className="grid sm:grid-cols-2 gap-2">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
          >
            {p}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg, onSuggestion }: { msg: CoachMessage; onSuggestion: (s: NonNullable<CoachMessage["meta"]>["suggestion"]) => void }) {
  const isUser = msg.role === "user";
  const hasSafety = msg.meta?.safety && msg.meta.safety !== "none";
  const suggestion = msg.meta?.suggestion;
  const insight = msg.meta?.insight;

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
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : hasSafety
              ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-tl-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          {msg.content}
        </div>

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

        {suggestion && !isUser && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestion === "adjust_plan" && (
              <SuggestionButton icon={ArrowRight} label="Adjust my plan" onClick={() => onSuggestion("adjust_plan")} />
            )}
            {suggestion === "keep_plan" && (
              <SuggestionButton icon={ArrowRight} label="Keep my plan" onClick={() => onSuggestion("keep_plan")} />
            )}
            {suggestion === "tell_me_more" && (
              <SuggestionButton icon={ArrowRight} label="Tell me more" onClick={() => onSuggestion("tell_me_more")} />
            )}
            {suggestion === "start_walk" && (
              <SuggestionButton icon={ArrowRight} label="Start walk" onClick={() => onSuggestion("start_walk")} />
            )}
            {suggestion === "schedule_habit" && (
              <SuggestionButton icon={Calendar} label="Reschedule habit" onClick={() => onSuggestion("schedule_habit")} />
            )}
            {suggestion === "find_support" && (
              <>
                <SuggestionButton icon={ShieldAlert} label="Find support" primary onClick={() => onSuggestion("find_support")} />
                <SuggestionButton icon={ArrowRight} label="Continue wellness coaching" onClick={() => onSuggestion("continue_wellness")} />
              </>
            )}
            {suggestion === "continue_wellness" && (
              <SuggestionButton icon={ArrowRight} label="Continue wellness coaching" onClick={() => onSuggestion("continue_wellness")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionButton({ icon: Icon, label, onClick, primary }: { icon: typeof Send; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <Button
      size="sm"
      variant={primary ? "default" : "outline"}
      onClick={onClick}
      className="text-xs"
    >
      <Icon className="h-3 w-3 mr-1.5" />
      {label}
    </Button>
  );
}

// ============================================================
// Helpers
// ============================================================

function getQuickPrompts(profile: { primaryGoal: string; typicalSleepHours: number }): string[] {
  const prompts = [
    "I didn't sleep well last night and I'm exhausted",
    "Should I work out today?",
    "I missed my morning workout again",
    "I'm feeling stressed about work",
  ];
  if (profile.primaryGoal === "stress") {
    prompts.unshift("Help me reset right now");
  }
  if (profile.primaryGoal === "sleep") {
    prompts.unshift("How can I sleep better tonight?");
  }
  return prompts.slice(0, 4);
}
