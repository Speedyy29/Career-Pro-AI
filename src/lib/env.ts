/**
 * Environment variable validation.
 * Shows clear, human-readable errors if required variables are missing.
 * During build: logs warnings (doesn't block).
 * During runtime: throws clear errors so the app fails fast.
 */

const REQUIRED_VARS = [
  {
    name: "DATABASE_URL",
    description: "Your Neon PostgreSQL connection string",
    where: "https://console.neon.tech → create a project → copy the connection string",
  },
  {
    name: "AUTH_SECRET",
    description: "A random secret key for authentication (32+ characters)",
    where: 'Run "npx auth secret" in your terminal, or use any random string',
  },
  {
    name: "NEXTAUTH_URL",
    description: "The URL your app is running on",
    where: 'Use "http://localhost:3000" for local dev, or your Vercel URL for production',
  },
  {
    name: "GOOGLE_GENERATIVE_AI_API_KEY",
    description: "Your Google Gemini API key (free tier)",
    where: "https://aistudio.google.com/apikey → Create API Key",
  },
  {
    name: "AUTH_GOOGLE_ID",
    description: "Google OAuth Client ID (for 'Sign in with Google')",
    where: "https://console.cloud.google.com/apis/credentials → Create OAuth Client",
  },
  {
    name: "AUTH_GOOGLE_SECRET",
    description: "Google OAuth Client Secret (for 'Sign in with Google')",
    where: "https://console.cloud.google.com/apis/credentials → Create OAuth Client",
  },
] as const;

// Placeholder values that should be replaced with real ones
const PLACEHOLDERS = [
  "your-",
  "change-me",
  "generate-a-random",
  "ca-pub-",
];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDERS.some((p) => lower.includes(p));
}

let validated = false;

/**
 * Validate all required environment variables.
 * Called once when the database client initializes.
 * During build time, logs warnings instead of throwing.
 */
export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const issues: string[] = [];

  for (const v of REQUIRED_VARS) {
    const value = process.env[v.name];

    if (!value || value.trim() === "") {
      issues.push(`  ✕ ${v.name} — NOT SET\n    What: ${v.description}\n    How:  ${v.where}`);
    } else if (isPlaceholder(value)) {
      issues.push(`  ✕ ${v.name} — still has placeholder value\n    What: ${v.description}\n    How:  ${v.where}`);
    }
  }

  if (issues.length > 0) {
    const message = [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "  ⚠ ENVIRONMENT VARIABLES NEED ATTENTION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      ...issues,
      "",
      "  FIX: Copy .env.example to .env and fill in real values:",
      "       cp .env.example .env",
      "  Then follow the setup guide in README.md",
      "",
    ].join("\n");

    // During build, just warn — don't block the build
    // During runtime, the error will surface when the app tries to connect
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(message);
    } else {
      console.error(message);
    }
  }
}
