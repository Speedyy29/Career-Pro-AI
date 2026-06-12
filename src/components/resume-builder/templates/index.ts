import type { ResumeData } from "../types";

import { ModernATS } from "./ModernATS";
import { Minimal } from "./Minimal";
import { Executive } from "./Executive";
import { Consulting } from "./Consulting";
import { Big4Professional } from "./Big4Professional";

export type ResumeTemplateKey =
  | "ModernATS"
  | "Minimal"
  | "Executive"
  | "Consulting"
  | "Big4Professional";

export function getTemplateComponent(template: string) {
  switch (template) {
    case "Executive":
      return Executive;
    case "Consulting":
      return Consulting;
    case "Big4Professional":
      return Big4Professional;
    case "Minimal":
      return Minimal;
    case "ModernATS":
    default:
      return ModernATS;
  }
}

// Kept for potential future use (tree-shaking friendly)
export const resumeTemplateComponents: Record<
  ResumeTemplateKey,
  (props: { data: ResumeData }) => ReturnType<typeof ModernATS>
> = {
  ModernATS,
  Minimal,
  Executive,
  Consulting,
  Big4Professional,
};


