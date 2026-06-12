import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXTAUTH_URL || "https://careerboost.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CareerBoost AI - AI-Powered Career Advancement Platform",
    template: "%s | CareerBoost AI",
  },
  description: "Boost your career with AI-powered resume analysis, interview preparation, and personalized career roadmaps. Get ATS-optimized resumes and ace your next interview.",
  keywords: [
    "Resume Analyzer AI",
    "ATS Resume Checker",
    "Interview Question Generator",
    "Career Roadmap Generator",
    "Career Planning Tool",
    "AI Career Coach",
    "Resume ATS Score",
    "Job Interview Preparation",
  ],
  authors: [{ name: "CareerBoost AI" }],
  creator: "CareerBoost AI",
  openGraph: {
    title: "CareerBoost AI - AI-Powered Career Advancement Platform",
    description: "Boost your career with AI-powered resume analysis, interview preparation, and personalized career roadmaps.",
    type: "website",
    siteName: "CareerBoost AI",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerBoost AI - AI-Powered Career Advancement Platform",
    description: "Boost your career with AI-powered resume analysis, interview preparation, and personalized career roadmaps.",
    creator: "@careerboost_ai",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CareerBoost AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "AI-powered career advancement platform for job seekers. Resume analysis, interview prep, and career roadmaps.",
    url: SITE_URL,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "3 free AI generations per day",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "12",
        priceCurrency: "USD",
        description: "Unlimited AI generations, advanced features",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "2500",
      bestRating: "5",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
