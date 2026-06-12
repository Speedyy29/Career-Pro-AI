<<<<<<< HEAD
# Career-Pro-AI
=======
# CareerBoost AI

AI-powered career platform that helps job seekers analyze resumes, prepare for interviews, and build career roadmaps.

**Tech stack:** Next.js 16, TypeScript, Tailwind CSS 4, Prisma, Auth.js v5, Google Gemini AI, Neon PostgreSQL

---

## Quick Start (6 steps, ~15 minutes)

Everything below uses **100% free services**. No credit card required for any of them.

---

### Step 1: Clone and Install

```bash
# Clone the repo (or download the zip)
git clone <your-repo-url>
cd "AI career pro"

# Install dependencies
npm install
```

---

### Step 2: Get Your Gemini API Key (FREE)

This powers the AI features (resume analysis, interview questions, career roadmaps).

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select a Google Cloud project (or create a new one)
5. Copy the API key — it looks like: `AIzaSy...`

The Gemini Flash model used here is on the free tier (15 requests/minute, plenty for development).

---

### Step 3: Create Your Neon Database (FREE)

This stores all user data, resume analyses, interview sessions, etc.

1. Go to **https://console.neon.tech** and sign up (free, no credit card)
2. Click **"Create Project"**
   - Name: `careerboost` (or anything)
   - Region: pick the closest to you
   - Click **"Create Project"**
3. On the dashboard, find **"Connection Details"**
4. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this string — you'll paste it into your `.env` file next.

---

### Step 4: Set Up Google OAuth (FREE)

This enables the "Sign in with Google" button.

1. Go to **https://console.cloud.google.com**
2. Create a new project (or select an existing one)
3. Go to **"APIs & Services" → "Credentials"**
4. Click **"Create Credentials" → "OAuth client ID"**
   - If prompted, configure the consent screen:
     - User Type: **External**
     - App name: **CareerBoost AI**
     - User support email: your email
     - Developer contact: your email
     - Click **Save and Continue** through scopes (skip for now)
     - Add test users (add your own email for testing)
     - Click **Save and Continue → Back to Dashboard**
5. Now create the OAuth client:
   - Application type: **Web application**
   - Name: **CareerBoost AI**
   - Under **"Authorized redirect URIs"**, click **"Add URI"** and enter:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **"Create"**
6. Copy the **Client ID** and **Client Secret** — you need both for `.env`.

---

### Step 5: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:

   ```env
   # Paste your Neon connection string from Step 3
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

   # Generate a random secret (run: npx auth secret)
   AUTH_SECRET="paste-the-output-here"

   # Leave as-is for local development
   NEXTAUTH_URL="http://localhost:3000"

   # Paste your Gemini key from Step 2
   GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."

   # Paste from Google Cloud Console (Step 4)
   AUTH_GOOGLE_ID="123456789-xxxxx.apps.googleusercontent.com"
   AUTH_GOOGLE_SECRET="GOCSPX-xxxxx"
   ```

3. Generate your AUTH_SECRET:
   ```bash
   npx auth secret
   ```
   Copy the output and paste it as the value for `AUTH_SECRET` in your `.env` file.

---

### Step 6: Set Up Database and Run

```bash
# Push the database schema to Neon (creates all tables)
npx prisma db push

# Generate the Prisma client
npx prisma generate

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser. You should see the landing page.

Click "Get Started Free" to create an account and test the app.

---

## Deploy to Vercel (FREE)

### Prerequisites
- A free Vercel account: https://vercel.com/signup
- Your code pushed to GitHub

### Deploy Steps

1. Go to **https://vercel.com/new**
2. Import your GitHub repository
3. Under **"Environment Variables"**, add all 6 variables:

   | Variable Name | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string |
   | `AUTH_SECRET` | Same secret from Step 5 |
   | `NEXTAUTH_URL` | `https://your-project-name.vercel.app` |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key |
   | `AUTH_GOOGLE_ID` | Your Google Client ID |
   | `AUTH_GOOGLE_SECRET` | Your Google Client Secret |

4. Click **"Deploy"**

### After Deployment

5. Update your Google OAuth redirect URI:
   - Go to **https://console.cloud.google.com/apis/credentials**
   - Edit your OAuth client
   - Add a new **"Authorized redirect URI"**:
     ```
     https://your-project-name.vercel.app/api/auth/callback/google
     ```
   - Save

6. Update `NEXTAUTH_URL` in Vercel:
   - Go to your Vercel project **Settings → Environment Variables**
   - Update `NEXTAUTH_URL` to your actual Vercel URL: `https://your-project-name.vercel.app`
   - Redeploy: `vercel --prod` or push to GitHub

---

## Launch Checklist

Use this checklist to make sure everything is ready:

- [ ] Gemini API key created at https://aistudio.google.com/apikey
- [ ] Neon database created at https://console.neon.tech
- [ ] Google OAuth credentials created at https://console.cloud.google.com/apis/credentials
- [ ] All 6 environment variables filled in `.env`
- [ ] `npx prisma db push` ran successfully
- [ ] `npm run dev` starts without errors
- [ ] Can register with email/password
- [ ] Can sign in with Google
- [ ] Resume analyzer returns results
- [ ] Interview prep generates questions
- [ ] Career roadmap creates a plan
- [ ] Deployed to Vercel
- [ ] Google OAuth redirect URI updated for Vercel URL
- [ ] `NEXTAUTH_URL` updated to Vercel URL in Vercel env vars

---

## Environment Variables Reference

| Variable | Where to Get It | Required? |
|---|---|---|
| `DATABASE_URL` | https://console.neon.tech | Yes |
| `AUTH_SECRET` | `npx auth secret` | Yes |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or Vercel URL (prod) | Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/apikey | Yes |
| `AUTH_GOOGLE_ID` | https://console.cloud.google.com/apis/credentials | Yes |
| `AUTH_GOOGLE_SECRET` | https://console.cloud.google.com/apis/credentials | Yes |

---

## Troubleshooting

### "MISSING ENVIRONMENT VARIABLES" error on startup
The app validates all required env vars at startup. If you see this error:
1. Check that your `.env` file exists
2. Make sure all 6 variables have real values (not placeholders)
3. Restart the dev server: `npm run dev`

### "Can't reach database" error
1. Check your `DATABASE_URL` in `.env`
2. Make sure it starts with `postgresql://` and ends with `?sslmode=require`
3. Verify your Neon project is running (not paused) at https://console.neon.tech

### Google login doesn't work
1. Check that `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in `.env`
2. Verify your redirect URI matches exactly:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Vercel: `https://your-project.vercel.app/api/auth/callback/google`
3. Make sure your Google Cloud project has the OAuth consent screen configured

### AI features return errors
1. Verify your `GOOGLE_GENERATIVE_AI_API_KEY` is correct
2. Check you haven't exceeded the free tier rate limit (15 requests/minute)
3. The app uses `gemini-2.0-flash` which is on the free tier

### Build fails
```bash
# Clear caches and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint

npx prisma db push       # Push schema changes to database
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI (http://localhost:5555)
```

---

## What's NOT included (disabled for now)

These features are built but not wired up — they require paid services:

- **Stripe payments** — pricing page shows plans but checkout is stubbed
- **Razorpay payments** — same, stubbed
- **PDF export** — referenced in pricing as "coming soon"
- **Google AdSense** — ad placeholder slots removed
- **Email sending** — forgot password generates a token but doesn't send email (use Resend/SendGrid when ready)

None of these block the app from running. Users can register, use all 3 AI tools, and browse the full UI.
>>>>>>> c6d7145 (Production release candidate)
