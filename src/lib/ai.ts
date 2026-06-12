import { generateWithFallback } from "./ai-providers";
import { z } from "zod/v4";

export const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  rewrittenSections: z.object({
    summary: z.string().optional(),
    bulletPoints: z.array(z.object({
      original: z.string(),
      rewritten: z.string(),
    })).optional(),
    skills: z.string().optional(),
  }),
});

export async function analyzeResume(resumeText: string) {
  const { object, provider } = await generateWithFallback<z.infer<typeof resumeAnalysisSchema>>({
    schema: resumeAnalysisSchema,
    schemaName: "ResumeAnalysis",
    prompt: `You are an expert ATS (Applicant Tracking System) analyzer and career coach. Analyze the following resume and provide detailed feedback.

RESUME:
${resumeText}

Provide:
1. An ATS compatibility score (0-100) based on formatting, keywords, structure, and content quality
2. Key strengths of the resume (at least 3)
3. Specific weaknesses that hurt ATS compatibility or appeal (at least 3)
4. Actionable suggestions for improvement (at least 4)
5. Rewritten sections:
   - A stronger professional summary
   - Rewritten bullet points for work experience (make them more impactful with metrics and action verbs)
   - Better skills section formatting

Be specific, actionable, and constructive in your feedback.`,
  });

  console.log(`[AI] analyzeResume completed via provider=${provider}`);
  return object;
}

export const interviewQuestionsSchema = z.object({
  hrQuestions: z.array(z.object({
    question: z.string(),
    idealAnswer: z.string(),
    followUp: z.string().optional(),
  })),
  technicalQuestions: z.array(z.object({
    question: z.string(),
    idealAnswer: z.string(),
    followUp: z.string().optional(),
  })),
  scenarioQuestions: z.array(z.object({
    question: z.string(),
    idealAnswer: z.string(),
    followUp: z.string().optional(),
  })),
});

export async function generateInterviewQuestions(role: string, experience: number, skills: string[]) {
  const { object, provider } = await generateWithFallback<z.infer<typeof interviewQuestionsSchema>>({
    schema: interviewQuestionsSchema,
    schemaName: "InterviewQuestions",
    prompt: `You are an expert interview coach. Generate interview preparation questions for the following candidate profile:

ROLE: ${role}
EXPERIENCE: ${experience} years
KEY SKILLS: ${skills.join(", ")}

Generate:
1. 5 HR/Behavioral questions with ideal answers and follow-up questions
2. 5 Technical questions specific to this role with ideal answers and follow-ups
3. 5 Scenario-based questions with ideal answers and follow-ups

Each answer should be structured, include the STAR method where applicable, and be tailored to the experience level. Make the answers realistic and actionable.`,
  });

  console.log(`[AI] generateInterviewQuestions completed via provider=${provider}`);
  return object;
}

export const roadmapSchema = z.object({
  thirtyDayPlan: z.object({
    focus: z.string(),
    goals: z.array(z.string()),
    tasks: z.array(z.string()),
    resources: z.array(z.string()),
  }),
  sixtyDayPlan: z.object({
    focus: z.string(),
    goals: z.array(z.string()),
    tasks: z.array(z.string()),
    resources: z.array(z.string()),
  }),
  ninetyDayPlan: z.object({
    focus: z.string(),
    goals: z.array(z.string()),
    tasks: z.array(z.string()),
    resources: z.array(z.string()),
  }),
  certifications: z.array(z.object({
    name: z.string(),
    provider: z.string(),
    relevance: z.string(),
  })),
  projectIdeas: z.array(z.object({
    title: z.string(),
    description: z.string(),
    skills: z.array(z.string()),
  })),
  dailySchedule: z.object({
    weekday: z.array(z.object({ time: z.string(), activity: z.string() })),
    weekend: z.array(z.object({ time: z.string(), activity: z.string() })),
  }),
});

export async function generateCareerRoadmap(currentRole: string, targetRole: string, experience: number, currentSkills: string[]) {
  const { object, provider } = await generateWithFallback<z.infer<typeof roadmapSchema>>({
    schema: roadmapSchema,
    schemaName: "CareerRoadmap",
    prompt: `You are an expert career coach. Create a detailed career transition roadmap for the following professional:

CURRENT ROLE: ${currentRole}
TARGET ROLE: ${targetRole}
YEARS OF EXPERIENCE: ${experience}
CURRENT SKILLS: ${currentSkills.join(", ")}

Create a comprehensive 30-60-90 day plan that includes:
- Specific focus areas for each phase
- Measurable goals
- Actionable tasks
- Recommended learning resources (courses, books, articles)
- Relevant certifications with providers
- Portfolio project ideas to demonstrate new skills
- A realistic daily study schedule (weekday vs weekend)

Make the plan specific to transitioning from ${currentRole} to ${targetRole}, building on existing skills where possible.`,
  });

  console.log(`[AI] generateCareerRoadmap completed via provider=${provider}`);
  return object;
}

// ─── Resume Builder ─────────────────────────────────────────────────────────

export const resumeBuilderSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    bulletPoints: z.array(z.string()),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    gpa: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    link: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
  })).optional(),
});

export async function generateResumeContent(input: {
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  projects?: string;
  certifications?: string;
}) {
  const { object, provider } = await generateWithFallback<z.infer<typeof resumeBuilderSchema>>({
    schema: resumeBuilderSchema,
    schemaName: "ResumeBuilder",
    prompt: `You are an expert resume writer specializing in ATS-optimized resumes. Generate a professional resume based on the following information.

CANDIDATE INFORMATION:
- Full Name: ${input.fullName}
- Email: ${input.email}
${input.phone ? `- Phone: ${input.phone}` : ""}
${input.linkedin ? `- LinkedIn: ${input.linkedin}` : ""}
${input.location ? `- Location: ${input.location}` : ""}

SUMMARY/DRAFT:
${input.summary || "Generate a compelling professional summary based on the candidate's experience and skills."}

SKILLS:
${input.skills?.join(", ") || "Infer relevant skills from experience."}

WORK EXPERIENCE:
${input.experience || "No experience provided."}

EDUCATION:
${input.education || "No education provided."}

PROJECTS:
${input.projects || "No projects provided."}

CERTIFICATIONS:
${input.certifications || "No certifications provided."}

INSTRUCTIONS:
1. Write a compelling professional summary (3-4 sentences)
2. Organize and format skills into a clean list
3. Rewrite experience bullet points to be impactful with action verbs and metrics where possible
4. Format education entries properly
5. Include projects if provided, with clear descriptions
6. List certifications if provided
7. Use ATS-friendly formatting throughout
8. Make every bullet point start with a strong action verb
9. Quantify achievements wherever possible`,
  });

  console.log(`[AI] generateResumeContent completed via provider=${provider}`);
  return object;
}
