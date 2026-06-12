/**
 * Input validation and security utilities.
 * Centralizes sanitization, size limits, and security checks.
 */

/** Maximum input sizes to prevent DoS / memory exhaustion */
export const LIMITS = {
  RESUME_TEXT_MAX: 15_000,       // ~15K chars max for resume text
  RESUME_TEXT_MIN: 50,
  ROLE_MAX: 100,
  SKILL_MAX: 50,
  SKILLS_MAX_COUNT: 20,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  EXPERIENCE_MAX: 50,
  BIO_MAX: 500,
  PDF_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  RESUME_BUILDER_SUMMARY_MAX: 1000,
  RESUME_BUILDER_EXPERIENCE_MAX: 5000,
  RESUME_BUILDER_EDUCATION_MAX: 2000,
  RESUME_BUILDER_PROJECTS_MAX: 3000,
  RESUME_BUILDER_CERTIFICATIONS_MAX: 1000,
} as const;

/** Strip HTML tags and control characters from user input */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")  // Strip control chars
    .trim();
}

/** Truncate string to max length */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}

/**
 * Password strength checker.
 * Returns score 0-4 and feedback messages.
 */
export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Add special characters");

  // Cap at 4
  score = Math.min(score, 4);

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];

  return {
    score,
    label: labels[score],
    color: colors[score],
    feedback,
  };
}

/** Validate password meets minimum requirements */
export function validatePassword(password: string): string | null {
  if (password.length < LIMITS.PASSWORD_MIN) return `Password must be at least ${LIMITS.PASSWORD_MIN} characters`;
  if (password.length > LIMITS.PASSWORD_MAX) return `Password must be at most ${LIMITS.PASSWORD_MAX} characters`;
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= LIMITS.EMAIL_MAX;
}

/** Check if string contains only safe characters for role/skill names */
export function isSafeString(input: string): boolean {
  // Allow letters, numbers, spaces, hyphens, underscores, periods, commas, slashes, +, #
  return /^[a-zA-Z0-9\s\-_.,/+#'&()]*$/.test(input);
}
