"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  Trash2,
  Download,
  Bell,
  AlertTriangle,
  ChevronRight,
  Info,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PrivacyView() {
  const setView = useAppStore((s) => s.setView);
  const profile = useAppStore((s) => s.profile);

  const [consentHabitLogs, setConsentHabitLogs] = useState(true);
  const [consentWearable, setConsentWearable] = useState(true);
  const [consentCoachMemory, setConsentCoachMemory] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("profile")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Profile
        </Button>
        <Badge variant="secondary" className="mb-2">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Prototype privacy controls
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your health information belongs to you.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Health data is sensitive. Here&apos;s what we collect, why, and how to control it.
        </p>
      </header>

      {/* Notice: this is a prototype */}
      <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-100 text-pretty">
            <strong>Prototype privacy controls.</strong> This is a working prototype. Real-world
            deployment would require formal compliance review (e.g., HIPAA, GDPR). We do not claim
            any certification that has not been implemented. Your data stays in your browser&apos;s
            localStorage for this demo.
          </div>
        </div>
      </Card>

      {/* What we collect */}
      <Section title="What we collect" subtitle="And why we collect it">
        <Card className="p-5 card-soft">
          <div className="space-y-4">
            <DataItem
              icon={CheckCircle2}
              label="Goals, habits, and routine info"
              why="To personalize your coaching plan."
              toggled={consentHabitLogs}
              onToggle={setConsentHabitLogs}
            />
            <DataItem
              icon={CheckCircle2}
              label="Wearable data (steps, sleep, heart rate)"
              why="To adapt recommendations to your recovery and activity."
              toggled={consentWearable}
              onToggle={setConsentWearable}
            />
            <DataItem
              icon={Sparkles}
              label="Coach conversation history"
              why="So your coach remembers what matters to you across sessions."
              toggled={consentCoachMemory}
              onToggle={setConsentCoachMemory}
            />
            <DataItem
              icon={Eye}
              label="Anonymized product analytics"
              why="To improve the product. Opt-in only — never tied to your identity."
              toggled={consentAnalytics}
              onToggle={setConsentAnalytics}
              optional
            />
          </div>
        </Card>
      </Section>

      {/* What we share */}
      <Section title="What we share" subtitle="(Spoiler: nothing without your action)">
        <Card className="p-5 card-soft">
          <ul className="space-y-3 text-sm">
            <ShareItem label="With employers / insurers" value="Nothing — unless you explicitly export and share it." />
            <ShareItem label="With healthcare providers" value="Nothing — unless you choose to share your coach conversation." />
            <ShareItem label="With advertising networks" value="Never." />
            <ShareItem label="For AI model training" value="Your conversations are not used to train external models in this prototype." />
          </ul>
        </Card>
      </Section>

      {/* Connected integrations */}
      <Section title="Connected integrations" subtitle="See and revoke device access">
        <Card className="p-5 card-soft divide-y divide-border">
          {profile?.devices.map((d) => (
            <div key={d.provider} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <div className="text-sm font-medium capitalize">
                  {d.provider.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.connected
                    ? `Connected · last sync ${d.lastSyncedAt ? new Date(d.lastSyncedAt).toLocaleTimeString() : "—"}`
                    : "Not connected"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => useAppStore.getState().toggleDevice(d.provider)}
              >
                {d.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </Card>
      </Section>

      {/* Your rights */}
      <Section title="Your rights" subtitle="What you can do with your data">
        <div className="grid sm:grid-cols-2 gap-3">
          <Card className="p-4 card-soft card-soft-hover cursor-pointer" onClick={() => setView("profile")}>
            <Download className="h-5 w-5 text-primary mb-2" />
            <div className="font-medium text-sm">Download your data</div>
            <div className="text-xs text-muted-foreground mt-1">
              Export everything as JSON. Yours to keep.
            </div>
          </Card>
          <Card className="p-4 card-soft card-soft-hover cursor-pointer" onClick={() => setView("profile")}>
            <Trash2 className="h-5 w-5 text-destructive mb-2" />
            <div className="font-medium text-sm">Delete your account</div>
            <div className="text-xs text-muted-foreground mt-1">
              Permanently erase all data from this device.
            </div>
          </Card>
        </div>
      </Section>

      {/* Privacy promise */}
      <Card className="p-6 card-soft bg-gradient-to-br from-primary/10 to-background">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Our privacy promise</h3>
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
              We will never sell your health data. We will never use guilt or shame as engagement
              mechanics. We will always explain why a recommendation was made. And we will always
              let you leave with your data intact.
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

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function DataItem({
  icon: Icon,
  label,
  why,
  toggled,
  onToggle,
  optional,
}: {
  icon: typeof Lock;
  label: string;
  why: string;
  toggled: boolean;
  onToggle: (v: boolean) => void;
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", toggled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          {optional && (
            <Badge variant="outline" className="text-[10px]">
              Optional
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{why}</p>
      </div>
      <Switch checked={toggled} onCheckedChange={onToggle} />
    </div>
  );
}

function ShareItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">·</span>
      <div>
        <span className="font-medium">{label}:</span>{" "}
        <span className="text-muted-foreground">{value}</span>
      </div>
    </li>
  );
}
