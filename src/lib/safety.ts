import type { SafetyFlag } from "./types";

// ============================================================
// AI Safety — health coach boundary filter
// ============================================================
// The coach must NOT diagnose, prescribe, recommend medication
// changes, or give emergency treatment instructions. This module
// flags high-risk user inputs and returns the escalation UX.
// ============================================================

interface SafetyMatch {
  flag: SafetyFlag;
  matched: string[];
}

// Patterns that indicate a likely medical / emergency question
const MEDICAL_PATTERNS = [
  /\b(diagnos|diagnosis|diagnosed)\b/i,
  /\b(prescri|prescription)\b/i,
  /\b(medication|medicine|meds)\b/i,
  /\b(dosage|dose)\b/i,
  /\b(specialist|doctor|physician|clinician|nurse)\b/i,
  /\b(symptoms?)\b/i,
  /\b(treat(ment|ed|ing)?|cures?|healed|healing)\b/i,
  /\b(disease|disorder|syndrome|condition|infection|illness)\b/i,
  /\bpain\b/i,
  /\b(fever|nausea|dizziness|chest pain|shortness of breath|fainting)\b/i,
];

const EMERGENCY_PATTERNS = [
  /\b(emergency|urgent|911|ambulance|unconscious|not breathing|bleeding heavily|suicide|kill myself|end my life|hurt myself)\b/i,
  /\b(severe (chest|abdominal|head) pain|stroke|heart attack)\b/i,
];

const MENTAL_HEALTH_PATTERNS = [
  /\b(depression|depressed|anxiety|anxious|panic attack|hopeless|worthless)\b/i,
  /\b(self[- ]?harm|suicidal| suicidal thoughts)\b/i,
];

export function detectSafetyFlag(input: string): SafetyMatch {
  const emergency = EMERGENCY_PATTERNS.filter((p) => p.test(input));
  if (emergency.length) return { flag: "emergency", matched: emergency.map(String) };

  const mental = MENTAL_HEALTH_PATTERNS.filter((p) => p.test(input));
  if (mental.length) return { flag: "mental_health", matched: mental.map(String) };

  const medical = MEDICAL_PATTERNS.filter((p) => p.test(input));
  if (medical.length) return { flag: "medical_question", matched: medical.map(String) };

  return { flag: "none", matched: [] };
}

export function safetyResponse(flag: SafetyFlag, style: string): {
  text: string;
  suggestion: "find_support" | "continue_wellness";
} {
  if (flag === "emergency") {
    return {
      text:
        "This sounds like it could be an emergency. If you're in immediate danger, please contact your local emergency services right away — in the US that's 911, in the EU it's 112, in India it's 112. I can't provide emergency medical guidance, but I can help you find a healthcare professional once you're safe. Would you like me to show you support options?",
      suggestion: "find_support",
    };
  }
  if (flag === "mental_health") {
    return {
      text:
        "What you're describing is something I want to take seriously. I'm a wellness coach, not a mental health professional — I can help with habits and routines, but I'm not qualified to advise on mental health concerns. If you're struggling, please consider reaching out to a qualified mental health professional or a crisis line (in the US: 988 Suicide & Crisis Lifeline). Would you like me to help you find support, or would you prefer to continue with general wellness coaching?",
      suggestion: "find_support",
    };
  }
  if (flag === "medical_question") {
    return {
      text:
        "This is outside what I can safely advise on. I can help with general wellness guidance — habits, movement, sleep, stress routines — but I can't diagnose or treat a medical condition. For symptoms like these, please contact a qualified healthcare professional. Would you like me to help you find support, or continue with wellness coaching?",
      suggestion: "find_support",
    };
  }
  return {
    text: "",
    suggestion: "continue_wellness",
  };
}
