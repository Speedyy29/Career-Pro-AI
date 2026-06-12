import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";

// ─── Provider Configuration ──────────────────────────────────────────────────

const PROVIDERS = {
  gemini: {
    name: "gemini",
    modelId: "gemini-2.5-flash",
    client: createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }),
  },
  openrouter: {
    name: "openrouter",
    modelId: "google/gemini-2.5-flash-lite",
    client: createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY ?? "sk-or-v1-placeholder",
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
        "X-Title": "CareerBoost AI",
      },
    }),
  },
} as const;

// ─── Error Classification ────────────────────────────────────────────────────

function isFallbackWorthyError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const responseBody =
    error instanceof Error && "responseBody" in error
      ? String((error as Record<string, unknown>).responseBody ?? "")
      : "";
  const combined = msg + " " + responseBody;

  return (
    combined.includes("quota") ||
    combined.includes("RESOURCE_EXHAUSTED") ||
    combined.includes("429") ||
    combined.includes("rate limit") ||
    combined.includes("timed out") ||
    combined.includes("timeout") ||
    combined.includes("ETIMEDOUT") ||
    combined.includes("ECONNRESET") ||
    combined.includes("ECONNREFUSED") ||
    combined.includes("500") ||
    combined.includes("502") ||
    combined.includes("503") ||
    combined.includes("504") ||
    combined.includes("INTERNAL") ||
    combined.includes("UNAVAILABLE")
  );
}

function classifyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) return "QUOTA_EXCEEDED";
  if (msg.includes("429") || msg.includes("rate limit")) return "RATE_LIMITED";
  if (msg.includes("timed out") || msg.includes("ETIMEDOUT")) return "TIMEOUT";
  if (msg.includes("500") || msg.includes("INTERNAL")) return "SERVER_ERROR";
  if (msg.includes("502") || msg.includes("503") || msg.includes("504") || msg.includes("UNAVAILABLE")) return "SERVICE_UNAVAILABLE";
  if (msg.includes("ECONNRESET") || msg.includes("ECONNREFUSED")) return "CONNECTION_ERROR";
  return "UNKNOWN";
}

// ─── Fallback Engine ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenerateObjectParams = Record<string, any>;

/**
 * Calls generateObject with automatic provider fallback.
 *
 * Order: Gemini → OpenRouter
 * If Gemini fails with a fallback-worthy error, OpenRouter is tried.
 * If FORCE_AI_FALLBACK=true is set, Gemini is skipped (for testing).
 */
export async function generateWithFallback<T>(
  params: GenerateObjectParams
): Promise<{ object: T; provider: string; model: string }> {
  const forceFallback = process.env.FORCE_AI_FALLBACK === "true";

  // ── Attempt 1: Gemini (primary) ──────────────────────────────────────────
  if (!forceFallback) {
    const startTime = Date.now();
    try {
      const geminiModel = PROVIDERS.gemini.client(PROVIDERS.gemini.modelId);
      const { object } = await generateObject({ ...params, model: geminiModel } as Parameters<typeof generateObject>[0]);
      const elapsed = Date.now() - startTime;

      console.log(
        `[AI] ✓ provider=gemini model=${PROVIDERS.gemini.modelId} time=${elapsed}ms status=success`
      );

      return { object: object as T, provider: "gemini", model: PROVIDERS.gemini.modelId };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const errorType = classifyError(error);
      const fallbackWorthy = isFallbackWorthyError(error);

      console.warn(
        `[AI] ✗ provider=gemini model=${PROVIDERS.gemini.modelId} time=${elapsed}ms ` +
          `error=${errorType} fallback_worthy=${fallbackWorthy}`
      );

      if (!fallbackWorthy) {
        // Non-fallback-worthy error (e.g., invalid input, schema mismatch) — throw immediately
        throw error;
      }
    }
  } else {
    console.log("[AI] FORCE_AI_FALLBACK=true — skipping Gemini, using OpenRouter directly");
  }

  // ── Attempt 2: OpenRouter (fallback) ─────────────────────────────────────
  if (!process.env.OPENROUTER_API_KEY) {
    const errMsg =
      "[AI] OpenRouter API key not configured. Cannot use fallback provider. " +
      "Set OPENROUTER_API_KEY in your .env file.";
    console.error(errMsg);
    throw new Error("AI provider unavailable. Please try again later.");
  }

  const startTime = Date.now();
  try {
    const orModel = PROVIDERS.openrouter.client.chat(PROVIDERS.openrouter.modelId);
    const { object } = await generateObject({ ...params, model: orModel, maxTokens: params.maxTokens ?? 8192 } as unknown as Parameters<typeof generateObject>[0]);
    const elapsed = Date.now() - startTime;

    console.log(
      `[AI] ✓ provider=openrouter model=${PROVIDERS.openrouter.modelId} time=${elapsed}ms status=success (FALLBACK)`
    );

    return { object: object as T, provider: "openrouter", model: PROVIDERS.openrouter.modelId };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorType = classifyError(error);

    console.error(
      `[AI] ✗ provider=openrouter model=${PROVIDERS.openrouter.modelId} time=${elapsed}ms ` +
        `error=${errorType} status=FATAL — all providers exhausted`
    );

    throw error;
  }
}
