"use client";

import {
  Sparkles,
  ArrowRight,
  HeartPulse,
  Moon,
  Brain,
  Activity,
  ShieldCheck,
  Watch,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LandingView() {
  const setView = useAppStore((s) => s.setView);
  const track = useAppStore((s) => s.track);

  const startOnboarding = () => {
    track("onboarding_started", {});
    setView("onboarding");
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight">Health-First</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden sm:inline-flex"
            >
              See how it works
            </Button>
            <Button size="sm" onClick={startOnboarding}>
              Get started
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-primary/10 text-primary border-0 hover:bg-primary/15"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Personalized digital health coaching
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
              Build healthier habits that actually fit your life.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground text-pretty leading-relaxed max-w-xl">
              Your personalized digital health coach helps you turn small daily
              actions into lasting routines — without making health another job.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={startOnboarding} className="text-base">
                Start your health journey
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-base"
              >
                See how it works
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Prototype demo · 5–10 minutes · No sign-up required
            </p>
          </motion.div>

          {/* Hero illustration card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-12 sm:mt-16 grid sm:grid-cols-3 gap-4"
          >
            <Card className="p-5 card-soft">
              <div className="flex items-center gap-2 text-primary mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Today</span>
              </div>
              <div className="text-3xl font-semibold tracking-tight">78</div>
              <div className="text-sm text-muted-foreground mt-1">Daily Balance · You're on track</div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
              </div>
            </Card>

            <Card className="p-5 card-soft">
              <div className="flex items-center gap-2 text-primary mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Next best step</span>
              </div>
              <div className="text-base font-medium leading-snug">
                A 15-minute walk after lunch will bring you within 500 steps of your goal.
              </div>
              <Button size="sm" className="mt-3" variant="secondary">
                Start walk
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Card>

            <Card className="p-5 card-soft">
              <div className="flex items-center gap-2 text-primary mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Momentum</span>
              </div>
              <div className="text-3xl font-semibold tracking-tight">5 days</div>
              <div className="text-sm text-muted-foreground mt-1">Consistency streak</div>
              <div className="mt-3 flex gap-1">
                {[true, true, true, true, true, false, false].map((done, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Differentiators */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <Badge variant="secondary" className="mb-3">Why Health-First</Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              A coach, not another tracker.
            </h2>
            <p className="mt-3 text-muted-foreground text-lg text-pretty">
              Most health apps give you a spreadsheet. Health-First gives you a coach
              that remembers what matters to you, learns from your behavior, and adapts
              the plan when life gets in the way.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="p-6 h-full card-soft card-soft-hover">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg tracking-tight">{d.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
                      {d.body}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy quote */}
      <section className="py-16 sm:py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-primary mb-5" />
          <p className="text-2xl sm:text-3xl font-medium tracking-tight text-balance leading-snug">
            &ldquo;Help me become healthier without making health another job.&rdquo;
          </p>
          <p className="mt-4 text-muted-foreground text-sm">
            The voice of our primary persona, Raj. Everything we build answers to it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Try the prototype now.
          </h2>
          <p className="mt-3 text-muted-foreground text-lg text-pretty">
            Walk through onboarding, meet your coach, complete a habit, and explore
            the privacy controls. No account required.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={startOnboarding} className="text-base">
              Start your health journey
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <span>Health-First Inc. · Prototype</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("privacy")}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => setView("safety")}
              className="hover:text-foreground transition-colors"
            >
              Safety
            </button>
            <span>Not a medical device</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    icon: Brain,
    title: "Adaptive coaching",
    body:
      "The plan changes based on behavior. If you miss morning workouts three times, the coach suggests a better time — not 'try harder.'",
  },
  {
    icon: Sparkles,
    title: "One next best action",
    body:
      "Instead of dumping every metric on you, the home screen surfaces one specific small action you can take in the next hour.",
  },
  {
    icon: Watch,
    title: "Connected health data",
    body:
      "Sync Apple Health, Fitbit, Garmin, or Oura. Your coach reads sleep, steps, and stress to make better recommendations.",
  },
  {
    icon: BarChart3,
    title: "Behavior-first analytics",
    body:
      "We measure consistency, not vanity metrics. Trends are presented as a story — 'You're becoming more consistent' — not a wall of charts.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first AI",
    body:
      "The coach never diagnoses or prescribes. Medical questions trigger an explicit escalation pathway to a qualified professional.",
  },
  {
    icon: Moon,
    title: "Context-aware nudging",
    body:
      "Right message, right moment, right intensity. Nudges adapt to your sleep, schedule, and what you've already done today.",
  },
  {
    icon: HeartPulse,
    title: "Hybrid escalation",
    body:
      "AI first, human support when appropriate. Connect with a coach for moments that need a human in the loop.",
  },
  {
    icon: Activity,
    title: "Unified health context",
    body:
      "Goals, habits, wearable data, and conversations all live in one place. The coach sees the whole picture.",
  },
  {
    icon: CheckCircle2,
    title: "Respects recovery",
    body:
      "Missed a day? The coach lowers the bar — it never shames. Consistency and recovery beat perfection.",
  },
];
