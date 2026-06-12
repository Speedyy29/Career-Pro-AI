import { db } from "@/lib/db";

/** Per-tool usage limits: Free = daily, Pro = monthly */
export const TOOL_LIMITS = {
  FREE: {
    RESUME_ANALYSIS: 3,
    RESUME_BUILD: 1,
    INTERVIEW_PREP: 3,
    CAREER_ROADMAP: 3,
  },
  PRO: {
    RESUME_ANALYSIS: 50,
    RESUME_BUILD: 20,
    INTERVIEW_PREP: 50,
    CAREER_ROADMAP: 50,
  },
} as const;

export type ToolType = "RESUME_ANALYSIS" | "RESUME_BUILD" | "INTERVIEW_PREP" | "CAREER_ROADMAP";

function getWindowStart(plan: string): Date {
  const now = new Date();
  if (plan === "PRO") {
    // Monthly window: 1st of current month at midnight
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  // Daily window: today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getWindowLabel(plan: string): string {
  return plan === "PRO" ? "this month" : "today";
}

function getLimit(plan: string, toolType: ToolType): number {
  if (plan === "PRO") {
    return TOOL_LIMITS.PRO[toolType];
  }
  return TOOL_LIMITS.FREE[toolType];
}

export async function checkRateLimit(
  userId: string,
  userPlan: string,
  toolType: ToolType
): Promise<{ allowed: boolean; remaining: number; limit: number; windowLabel: string }> {
  const limit = getLimit(userPlan, toolType);
  const windowStart = getWindowStart(userPlan);
  const windowLabel = getWindowLabel(userPlan);

  const used = await db.toolUsage.count({
    where: {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toolType: toolType as any,
      createdAt: { gte: windowStart },
    },
  });

  const remaining = Math.max(0, limit - used);

  return {
    allowed: remaining > 0,
    remaining,
    limit,
    windowLabel,
  };
}

export async function recordUsage(userId: string, toolType: ToolType) {
  await db.toolUsage.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { userId, toolType: toolType as any },
  });
}

/** Get usage summary for all tools (for dashboard counters) */
export async function getUsageSummary(
  userId: string,
  userPlan: string
): Promise<Record<ToolType, { used: number; limit: number; remaining: number; windowLabel: string }>> {
  const windowStart = getWindowStart(userPlan);
  const windowLabel = getWindowLabel(userPlan);

  const toolTypes: ToolType[] = ["RESUME_ANALYSIS", "RESUME_BUILD", "INTERVIEW_PREP", "CAREER_ROADMAP"];

  const counts = await db.toolUsage.groupBy({
    by: ["toolType"],
    where: {
      userId,
      createdAt: { gte: windowStart },
    },
    _count: true,
  });

  const countMap: Record<string, number> = {};
  for (const c of counts) {
    countMap[c.toolType] = c._count;
  }

  const summary = {} as Record<ToolType, { used: number; limit: number; remaining: number; windowLabel: string }>;
  for (const tool of toolTypes) {
    const used = countMap[tool] ?? 0;
    const limit = getLimit(userPlan, tool);
    summary[tool] = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      windowLabel,
    };
  }

  return summary;
}
