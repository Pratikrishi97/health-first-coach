"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Salad, Footprints, Moon, Brain, Calendar, BookOpen, Lightbulb, ChefHat } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/types";

const CATEGORIES = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "movement", label: "Movement", icon: Footprints },
  { id: "nutrition", label: "Nutrition", icon: Salad },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "stress", label: "Stress", icon: Brain },
  { id: "routines", label: "Routines", icon: Calendar },
] as const;

const TYPE_LABEL: Record<ContentItem["type"], string> = {
  article: "Article",
  guide: "Guide",
  tip: "Tip",
  recipe: "Recipe",
  micro: "Micro-learning",
};

const GOAL_TO_CONTENT: Record<string, string> = {
  routines: "routine-breaks",
  fitness: "walking-habit",
  weight: "protein-breakfast",
  nutrition: "protein-breakfast",
  sleep: "wind-down",
  stress: "stress-reset-10",
};

const GOAL_WORD: Record<string, string> = {
  routines: "building healthier routines",
  fitness: "improving fitness",
  weight: "managing weight",
  nutrition: "eating better",
  sleep: "sleeping better",
  stress: "reducing stress",
};

export function LearnView() {
  const content = useAppStore((s) => s.content);
  const profile = useAppStore((s) => s.profile);
  const track = useAppStore((s) => s.track);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["id"]>("all");

  const filtered = filter === "all" ? content : content.filter((c) => c.category === filter);
  const active = activeId ? content.find((c) => c.id === activeId) : null;

  // Personalized recommendation derived from the user's primary goal.
  const recommendedId = profile ? GOAL_TO_CONTENT[profile.primaryGoal] : undefined;
  const recommended =
    (recommendedId && content.find((c) => c.id === recommendedId)) || content[0] || null;

  if (active) {
    return <ContentReader item={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <header className="mb-6">
        <Badge variant="secondary" className="mb-2">Learn</Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Practical, behavior-first content</h1>
        <p className="mt-1 text-muted-foreground">
          Short reads you can act on today. No fluff, no medical claims.
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const selected = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Recommended for you */}
      {recommended && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended for you
            </h2>
          </div>
          <Card className="p-5 card-soft bg-gradient-to-br from-primary/10 to-background">
            <p className="text-xs text-muted-foreground mb-2">
              {profile
                ? `Because your primary goal is ${GOAL_WORD[profile.primaryGoal] ?? "building healthier habits"}:`
                : "Handpicked to help you start strong:"}
            </p>
            <h3 className="text-lg font-semibold leading-snug">{recommended.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              {recommended.excerpt}
            </p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                setActiveId(recommended.id);
                track("content_opened", { id: recommended.id });
              }}
            >
              Read now · {recommended.readMinutes} min
            </Button>
          </Card>
        </section>
      )}

      {/* All content */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {filter === "all" ? "All articles" : CATEGORIES.find((c) => c.id === filter)?.label}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              onClick={() => {
                setActiveId(item.id);
                track("content_opened", { id: item.id });
              }}
              className="text-left"
            >
              <Card className="p-4 h-full card-soft card-soft-hover">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {TYPE_LABEL[item.type]}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readMinutes} min
                  </span>
                </div>
                <h3 className="font-semibold text-base leading-snug text-pretty">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 text-pretty">{item.excerpt}</p>
              </Card>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContentReader({ item, onBack }: { item: ContentItem; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to library
      </Button>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-[10px] capitalize">
          {TYPE_LABEL[item.type]}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.readMinutes} min read
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-balance leading-tight">
        {item.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground text-pretty">{item.excerpt}</p>

      <div className="mt-6 prose prose-sm max-w-none">
        <ScrollArea className="max-h-[60vh] sm:max-h-none">
          <div className="space-y-4 text-base leading-relaxed text-foreground/90">
            {item.body?.split("\n\n").map((para, i) => (
              <p key={i} className="text-pretty">{para}</p>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ChefHat className="h-3.5 w-3.5" />
          <span>Wellness guidance only — not medical advice.</span>
        </div>
      </div>
    </div>
  );
}
