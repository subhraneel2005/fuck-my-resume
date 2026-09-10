import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";

const SITE_URL = "https://fuck-my-resume.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fuck My Resume — Your resume is shit. We fix that.",
    template: "%s | Fuck My Resume",
  },
  description:
    "AI resume tailoring, cold outreach drafts, and mock interviews that score you out of 10. Bring your own API key — no subscription, your data stays yours.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Fuck My Resume",
    title: "Fuck My Resume — Your resume is shit. We fix that.",
    description:
      "Upload your resume, paste the job description, get an ATS-optimized version in 10 seconds. Plus cold outreach, mock interviews scored out of 10, and a public leaderboard. BYOK — free and open source.",
    images: [
      {
        url: "/fmr-opengraph.png",
        width: 1600,
        height: 900,
        alt: "Fuck My Resume — Your resume is shit. We fix that.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuck My Resume — Your resume is shit. We fix that.",
    description:
      "AI resume tailoring, cold outreach, and mock interviews scored out of 10. BYOK — free and open source.",
    images: ["/fmr-opengraph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={cn(GeistSans.className)}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
