"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Database,
  Gauge,
  ArrowRight,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

// ============================================================
// WhySheet — reusable "Why this recommendation?" bottom sheet
// ============================================================
// FEATURE 3: "Why?" Health Interpreter
//
// Every meaningful recommendation exposes:
// - Recommendation (what)
// - Why (bullet reasons)
// - Data used (transparency)
// - Confidence (never false certainty)
// - User control (alternative / override)
// ============================================================

interface WhySheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recommendation: Recommendation | null;
  onAccept?: () => void;
  onReject?: () => void;
  onAlternative?: () => void;
}

export function WhySheet({
  open,
  onOpenChange,
  recommendation,
  onAccept,
  onReject,
  onAlternative,
}: WhySheetProps) {
  if (!recommendation) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            Why this recommendation?
          </SheetTitle>
          <SheetDescription className="text-left text-pretty">
            Every recommendation comes with the reasoning, data, and confidence behind it. Never accept blindly.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-4">
          {/* Recommendation */}
          <Card className="p-4 bg-gradient-to-br from-primary/8 to-background">
            <div className="text-xs uppercase tracking-wide font-semibold text-primary mb-1">
              Recommendation
            </div>
            <div className="font-semibold text-base text-pretty">{recommendation.title}</div>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">{recommendation.body}</p>
          </Card>

          {/* Why */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Why</h3>
            </div>
            <ul className="space-y-2">
              {recommendation.why.map((reason, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-pretty">{reason}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Data used */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Data used</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.dataUsed.map((d) => (
                <Badge key={d} variant="outline" className="text-xs">
                  {d}
                </Badge>
              ))}
            </div>
          </div>

          {/* Confidence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Confidence</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct(recommendation.confidence)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    recommendation.confidence === "high"
                      ? "bg-primary"
                      : recommendation.confidence === "moderate"
                      ? "bg-primary/70"
                      : "bg-amber-500"
                  )}
                />
              </div>
              <span className="text-sm font-medium capitalize">{recommendation.confidence}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              Confidence reflects how strongly the data supports this recommendation. Never treated as medical certainty.
            </p>
          </div>

          {/* User control */}
          {recommendation.userControl && (
            <Card className="p-3 bg-muted/40">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">
                    Your control
                  </div>
                  <div className="text-sm text-pretty">{recommendation.userControl}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {onAccept && (
              <Button className="w-full shadow-premium-sm" onClick={onAccept}>
                Accept recommendation
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
            {recommendation.alternative && onAlternative && (
              <Button variant="outline" className="w-full" onClick={onAlternative}>
                {recommendation.alternative}
              </Button>
            )}
            {onReject && (
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={onReject}>
                Not now
              </Button>
            )}
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Wellness guidance only — not medical advice.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function confidencePct(level: "low" | "moderate" | "high"): number {
  return level === "high" ? 90 : level === "moderate" ? 60 : 30;
}

// ============================================================
// TrustPanel — inline version of WhySheet (for cards)
// ============================================================

export function TrustPanel({ recommendation, compact }: { recommendation: Recommendation; compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 leading-snug">
        <span className="font-medium text-foreground">Why:</span> {recommendation.why[0]}
        <span className="ml-2 text-muted-foreground/60">· Confidence: {recommendation.confidence}</span>
      </div>
    );
  }

  return (
    <Card className="p-3 bg-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs uppercase tracking-wide font-semibold text-primary">
          Why this?
        </span>
        <Badge variant="outline" className="text-[10px] ml-auto capitalize">
          {recommendation.confidence} confidence
        </Badge>
      </div>
      <ul className="space-y-1">
        {recommendation.why.map((reason, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="text-primary mt-0.5">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      {recommendation.dataUsed.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/60">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
            Data used
          </div>
          <div className="flex flex-wrap gap-1">
            {recommendation.dataUsed.map((d) => (
              <Badge key={d} variant="outline" className="text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
