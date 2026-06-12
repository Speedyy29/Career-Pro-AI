# Resume Features & Monetization Overhaul

## Task 1: Install Dependencies

- `pdf-parse` -- server-side PDF text extraction
- `@react-pdf/renderer` -- PDF export for resume builder templates
- Run `npx prisma generate` after schema changes

## Task 2: Update Prisma Schema (`prisma/schema.prisma`)

- Add `RESUME_BUILD` to `ToolType` enum
- Add `GeneratedResume` model:
  ```
  model GeneratedResume {
    id, userId, fullName, email, phone, linkedin, location,
    summary, skills (String[]), experience (Json), education (Json),
    projects (Json), certifications (Json),
    template (String), content (Json),
    isDraft (Boolean), createdAt, updatedAt
    user relation
  }
  ```
- Update `User` model with `generatedResumes GeneratedResume[]`

## Task 3: Overhaul Rate Limiting (`src/lib/rate-limit.ts`)

Replace current shared daily limit with per-tool, per-plan counters:

| Tool | Free | Pro |
|------|------|-----|
| RESUME_ANALYSIS | 3/day | 50/month |
| RESUME_BUILD | 1/day | 20/month |
| INTERVIEW_PREP | 3/day | 50/month |
| CAREER_ROADMAP | 3/day | 50/month |

- `checkRateLimit(userId, plan, toolType)` -- returns `{ allowed, remaining, resetDate }`
- `recordUsage(userId, toolType)` -- unchanged signature but accepts new enum value
- Free = daily window, Pro = monthly window (resets on 1st of month)

## Task 4: Update Validation Limits (`src/lib/validation.ts`)

- Add `PDF_MAX_SIZE: 5 * 1024 * 1024` (5MB)
- Add `RESUME_BUILDER` related field limits

## Task 5: FEATURE 1 -- PDF Resume Upload

### 5a: API Route (`src/app/api/resume/upload/route.ts`)
- Accept multipart form data with PDF file
- Validate: file exists, is PDF type, size 