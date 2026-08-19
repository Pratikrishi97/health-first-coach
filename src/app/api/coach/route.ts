import { NextRequest, NextResponse } from "next/server";
import type { AppState } from "@/lib/types";
import { getCoachReply } from "@/lib/coach-engine";

// ============================================================
// POST /api/coach
// ============================================================
// Accepts the full app state + user input, returns the coach
// reply. Uses the deterministic engine by default. If
// ZAI_API_KEY is configured, an LLM can be layered on top —
// the safety filter still wraps the response either way.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: string = String(body?.input ?? "").slice(0, 2000);
    const state: AppState = body?.state;

    if (!input) {
      return NextResponse.json(
        { error: "Missing 'input' field" },
        { status: 400 }
      );
    }

    // Always run the safety + deterministic engine first.
    const reply = getCoachReply(input, state ?? ({} as AppState));

    return NextResponse.json({
      text: reply.text,
      suggestion: reply.suggestion,
      insight: reply.insight,
      safetyFlag: reply.safetyFlag,
      provider: "deterministic",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
