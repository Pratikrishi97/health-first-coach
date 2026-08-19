"use client";

import {
  ShieldAlert,
  AlertOctagon,
  Heart,
  Phone,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SafetyView() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("profile")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Profile
        </Button>
        <Badge variant="secondary" className="mb-2">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Safety boundaries
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
          Your coach is a wellness guide, not a doctor.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          The AI is built with hard safety boundaries. Here&apos;s what it can and can&apos;t do —
          and where to go when you need more.
        </p>
      </header>

      {/* What the coach can do */}
      <Section title="What your coach can do" tone="ok">
        <Card className="p-5 card-soft">
          <ul className="space-y-3 text-sm">
            <AllowedItem text="Suggest small habit changes based on your goals and behavior" />
            <AllowedItem text="Adapt your plan when life gets in the way" />
            <AllowedItem text="Help you think through trade-offs using motivational interviewing" />
            <AllowedItem text="Surface trends from your wearable data" />
            <AllowedItem text="Offer general wellness guidance — sleep routines, movement, stress resets, nutrition patterns" />
            <AllowedItem text="Remember your context across sessions" />
          </ul>
        </Card>
      </Section>

      {/* What the coach can't do */}
      <Section title="What your coach won&apos;t do" tone="warn">
        <Card className="p-5 card-soft border-amber-200 dark:border-amber-800">
          <ul className="space-y-3 text-sm">
            <ForbiddenItem text="Diagnose diseases or medical conditions" />
            <ForbiddenItem text="Prescribe medication or recommend changing your dosage" />
            <ForbiddenItem text="Claim certainty about a medical condition" />
            <ForbiddenItem text="Pretend to be a doctor or mental health professional" />
            <ForbiddenItem text="Give emergency medical treatment instructions" />
            <ForbiddenItem text="Replace care from a qualified healthcare professional" />
          </ul>
        </Card>
      </Section>

      {/* How escalation works */}
      <Section title="How escalation works" tone="info">
        <Card className="p-5 card-soft">
          <p className="text-sm text-muted-foreground mb-4 text-pretty">
            If you ask the coach something it can&apos;t safely answer, it will:
          </p>
          <div className="space-y-3">
            <Step n={1} text="Acknowledge your question without pretending to answer it." />
            <Step n={2} text="Explain that this is outside what it can safely advise on." />
            <Step n={3} text="Offer to help you find a qualified healthcare professional." />
            <Step n={4} text="Let you continue with general wellness coaching if you prefer." />
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setView("coach");
              useAppStore.getState().track("escalation_demo_started", {});
            }}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Try it: ask the coach about medication
          </Button>
        </Card>
      </Section>

      {/* Emergency resources */}
      <Section title="If you need immediate help" tone="emergency">
        <Card className="p-5 card-soft border-destructive/30 bg-destructive/5">
          <div className="space-y-3">
            <ResourceRow
              icon={Phone}
              label="Emergency services (US)"
              value="911"
              note="For immediate danger to life or health."
            />
            <ResourceRow
              icon={Heart}
              label="988 Suicide & Crisis Lifeline (US)"
              value="988"
              note="24/7 free and confidential support."
            />
            <ResourceRow
              icon={Phone}
              label="Emergency services (EU)"
              value="112"
              note="Common emergency number across EU member states."
            />
            <ResourceRow
              icon={Phone}
              label="Emergency services (India)"
              value="112"
              note="Single emergency number across India."
            />
          </div>
        </Card>
      </Section>

      {/* Connect with a coach */}
      <Section title="Connect with a human coach" tone="info">
        <Card className="p-5 card-soft">
          <p className="text-sm text-muted-foreground mb-3 text-pretty">
            The AI is designed to complement, not replace, human support. For prototype purposes,
            scheduling a human coach session is a placeholder.
          </p>
          <Button variant="outline" disabled>
            <Heart className="h-3.5 w-3.5 mr-1.5" />
            Connect with a coach (coming soon)
          </Button>
        </Card>
      </Section>

      <Card className="p-5 card-soft bg-gradient-to-br from-primary/10 to-background">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Our commitment</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              Health-First Coach is built to be honest about what it is — a wellness guide that helps
              you build better daily routines. It will never pretend to be something it isn&apos;t.
              When something is outside its scope, it will tell you.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "ok" | "warn" | "info" | "emergency";
  children: React.ReactNode;
}) {
  const iconMap = {
    ok: CheckCircle2,
    warn: AlertOctagon,
    info: Sparkles,
    emergency: Phone,
  };
  const Icon = iconMap[tone];
  const colorMap = {
    ok: "text-primary",
    warn: "text-amber-600 dark:text-amber-400",
    info: "text-primary",
    emergency: "text-destructive",
  };
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-3.5 w-3.5 ${colorMap[tone]}`} />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AllowedItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

function ForbiddenItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
        {n}
      </div>
      <span className="text-sm pt-0.5">{text}</span>
    </div>
  );
}

function ResourceRow({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{note}</div>
      </div>
    </div>
  );
}
