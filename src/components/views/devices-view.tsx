"use client";

import { useState } from "react";
import {
  Watch,
  RefreshCw,
  ChevronRight,
  Activity,
  Moon,
  HeartPulse,
  Droplets,
  Footprints,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DeviceProvider } from "@/lib/types";

const DEVICE_INFO: Record<DeviceProvider, { label: string; description: string }> = {
  apple_health: { label: "Apple Health", description: "iPhone & Apple Watch" },
  google_health: { label: "Google Health Connect", description: "Android devices" },
  fitbit: { label: "Fitbit", description: "Trackers & smartwatches" },
  garmin: { label: "Garmin", description: "Wearables & fitness watches" },
  oura: { label: "Oura", description: "Sleep & recovery ring" },
};

export function DevicesView() {
  const profile = useAppStore((s) => s.profile);
  const toggleDevice = useAppStore((s) => s.toggleDevice);
  const setView = useAppStore((s) => s.setView);
  const track = useAppStore((s) => s.track);
  const today = useAppStore((s) => s.metrics[s.metrics.length - 1]);
  const [syncing, setSyncing] = useState<DeviceProvider | null>(null);

  if (!profile) return null;

  const handleSync = (provider: DeviceProvider) => {
    setSyncing(provider);
    setTimeout(() => {
      setSyncing(null);
      toast.success(`${DEVICE_INFO[provider].label} synced successfully.`);
      track("device_synced", { provider });
    }, 1400);
  };

  const connected = profile.devices.filter((d) => d.connected);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => setView("profile")} className="-ml-2 mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Profile
        </Button>
        <Badge variant="secondary" className="mb-2">
          <Watch className="h-3 w-3 mr-1" />
          Connected devices
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your wearable data, on your terms.
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Connect a device to make coaching more personalized. These are demo connections —
          no real data leaves your browser.
        </p>
      </header>

      {/* Connection list */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Available integrations
        </h2>
        <div className="space-y-3">
          {profile.devices.map((d) => {
            const info = DEVICE_INFO[d.provider];
            return (
              <Card key={d.provider} className={cn("p-4 card-soft card-soft-hover", d.connected && "border-primary/30")}>
                <div className="flex items-center gap-3">
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", d.connected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Watch className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      {info.label}
                      <span className="text-[10px] uppercase font-semibold tracking-wide text-amber-700 dark:text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        Demo
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {info.description}
                      {d.connected && d.lastSyncedAt && (
                        <span> · synced {new Date(d.lastSyncedAt).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.connected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(d.provider)}
                        disabled={syncing === d.provider}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", syncing === d.provider && "animate-spin")} />
                        {syncing === d.provider ? "Syncing…" : "Sync"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={d.connected ? "ghost" : "default"}
                      onClick={() => toggleDevice(d.provider)}
                    >
                      {d.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* What we read */}
      {connected.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            What we read from your devices
          </h2>
          <Card className="p-5 card-soft">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <DataReadItem icon={Footprints} label="Steps" />
              <DataReadItem icon={Moon} label="Sleep duration" />
              <DataReadItem icon={HeartPulse} label="Resting heart rate" />
              <DataReadItem icon={Activity} label="Active minutes" />
              <DataReadItem icon={Droplets} label="Hydration" />
              <DataReadItem icon={Activity} label="Stress estimate" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-pretty">
              We do <strong>not</strong> read: location, contacts, photos, messages, or any data not
              listed above. You can revoke access anytime.
            </p>
          </Card>
        </section>
      )}

      {/* Data preview — derived from the user's latest synced metrics */}
      {connected.length > 0 && today && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Latest sync preview
          </h2>
          <Card className="p-5 card-soft">
            <div className="space-y-3 text-sm">
              <SyncRow
                label="Steps today"
                value={`${today.steps.toLocaleString()} / ${today.stepsGoal.toLocaleString()}`}
                status={today.steps >= today.stepsGoal * 0.7 ? "ok" : "warn"}
              />
              <SyncRow
                label="Sleep last night"
                value={`${Math.floor(today.sleepHours)}h ${Math.round((today.sleepHours % 1) * 60)}m / ${today.sleepGoalHours}h`}
                status={today.sleepHours >= today.sleepGoalHours * 0.85 ? "ok" : "warn"}
              />
              {today.restingHeartRate != null && (
                <SyncRow label="Resting heart rate" value={`${today.restingHeartRate} bpm`} status="ok" />
              )}
              <SyncRow
                label="Active minutes"
                value={`${today.activeMinutes} / 30`}
                status={today.activeMinutes >= 30 ? "ok" : "warn"}
              />
              {today.weightKg != null && (
                <SyncRow label="Weight" value={`${today.weightKg.toFixed(1)} kg`} status="ok" />
              )}
              <SyncRow
                label="Hydration"
                value={`${today.hydrationGlasses} / ${today.hydrationGoal} glasses`}
                status={today.hydrationGlasses >= today.hydrationGoal * 0.75 ? "ok" : "warn"}
              />
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              Real-time device sync is simulated for the prototype.
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function DataReadItem({ icon: Icon, label }: { icon: typeof Watch; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function SyncRow({ label, value, status }: { label: string; value: string; status: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium tabular-nums">{value}</span>
        {status === "ok" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        )}
      </div>
    </div>
  );
}
