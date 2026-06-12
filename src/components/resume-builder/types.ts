export interface ResumeData {
  fullName: string;
  email: string;
  phone?: string | null;
  linkedin?: string | null;
  location?: string | null;
  summary?: string | null;
  skills: string[];
  experience?: Record<string, unknown>[] | null;
  education?: Record<string, unknown>[] | null;
  projects?: Record<string, unknown>[] | null;
  certifications?: Record<string, unknown>[] | null;
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}
