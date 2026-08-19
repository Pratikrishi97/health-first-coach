"use client";

import { motion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Shield,
  Sparkles,
  ChevronRight,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeIn, StaggerGroup, StaggerItem, AnimatedNumber, MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function RecoveryView() {
  const recovery = useAppStore((s) => s.recovery);
  const acceptRecoveryPlan = useAppStore((s) => s.acceptRecoveryPlan);
  const skipRecoveryToday = useAppStore((s) => s.skipRecoveryToday);
  const dismissRecovery = useAppStore((s) => s.dismissRecovery);
  const setView = useAppStore((s) => s.setView);

  if (!recovery) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 text-center">
        <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h2 className="font-semibold mb-1">No recovery needed right now</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You&apos;re on track. The recovery mode activates when life disrupts your routine.
        </p>
        <Button onClick={() => setView("home")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Home
        </Button>
        <Badge variant="secondary" className="mb-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">
          <Shield className="h-3 w-3 mr-1" />
          Recovery Mode · No-guilt engine
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          Today got disrupted. Let&apos;s adjust.
        </h1>
        <p className="mt-1 text-muted-foreground text-pretty">
          {recovery.triggerLabel}. Instead of catching up, I&apos;ve reset today to something achievable.
        </p>
      </header>

      {/* Hero: your progress is not reset */}
      <FadeIn>
        <Card className="p-6 mb-6 card-premium bg-gradient-to-br from-primary/10 to-background text-center border-beam">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: MOTION.easing.spring }}
            className="h-14 w-14 mx-auto rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-premium-md mb-3"
          >
            <Heart className="h-7 w-7" />
          </motion.div>
          <h2 className="text-xl font-semibold tracking-tight">Your progress is not reset.</h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty max-w-md mx-auto">
            You don&apos;t need to make up for yesterday. Recovery is part of the process — not a failure.
          </p>

          {/* Recovery consistency metric */}
          <div className="mt-5 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Recovery consistency</span>
              <span className="font-semibold text-foreground tabular-nums">
                <AnimatedNumber value={Math.round(recovery.recoveryConsistency * 100)} />%
              </span>
            </div>
            <Progress value={recovery.recoveryConsistency * 100} className="h-2" />
            <div className="text-[11px] text-muted-foreground mt-1.5">
              A gentler measure than streaks. Stays stable when you recover intentionally.
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Recovery plan */}
      <FadeIn delay={0.1}>
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recovery plan
            </h2>
          </div>
          <StaggerGroup className="space-y-3" stagger={MOTION.stagger.standard}>
            {recovery.plan.map((item, i) => (
              <StaggerItem key={i}>
                <Card className={cn(
                  "p-4 card-premium",
                  i === 0 ? "border-primary/30 bg-primary/5" : ""
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {i === 0 ? <Heart className="h-5 w-5" /> : i === recovery.plan.length - 1 ? <TrendingUp className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.day}
                        </span>
                        {i === 0 && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                            Today
                          </Badge>
                        )}
                        {i === recovery.plan.length - 1 && (
                          <Badge variant="outline" className="text-[10px]">
                            Back to normal
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium text-sm mt-0.5">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.durationMin} minutes</div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </FadeIn>

      {/* Compassionate copy */}
      <FadeIn delay={0.15}>
        <Card className="p-5 mb-6 card-premium">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Your routine took a pause.</h3>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                That&apos;s not failure — that&apos;s information. Tomorrow we restart with something realistic. You don&apos;t need to make up for yesterday.
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Actions */}
      <FadeIn delay={0.2}>
        <Card className="p-5 card-premium bg-gradient-to-br from-primary/8 to-background">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="flex-1 shadow-premium-sm" onClick={acceptRecoveryPlan}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Accept recovery plan
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button variant="outline" className="flex-1" onClick={skipRecoveryToday}>
              Skip today
            </Button>
            <Button variant="ghost" onClick={() => setView("plan_lab")}>
              Customize
            </Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Accepting switches the coach to Recovery mode — only recovery-related suggestions.
          </p>
        </Card>
      </FadeIn>

      {/* Dismiss */}
      <div className="text-center mt-4">
        <button
          onClick={dismissRecovery}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          I don&apos;t need recovery mode right now
        </button>
      </div>
    </div>
  );
}
