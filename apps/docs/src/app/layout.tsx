import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const codeFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code",
});

const siteUrl = "https://invespro.vercel.app";
const siteTitle = "Invespro - Investment Profiling and Portfolio Allocation";
const siteDescription =
  "Try Invespro, a rules-based investment profiling and portfolio allocation engine with default questionnaires, custom model definitions, JSON and CSV batch evaluation, and REST/CLI integrations.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Invespro",
  title: {
    default: siteTitle,
    template: "%s | Invespro",
  },
  description: siteDescription,
  keywords: [
    "investment risk profiling",
    "portfolio allocation",
    "risk questionnaire",
    "suitability engine",
    "fintech API",
    "rules engine",
    "CSV batch evaluation",
    "Zen Engine",
    "GoRules",
  ],
  authors: [{ name: "Vibedcoder", url: "https://github.com/vibedcoder" }],
  creator: "Vibedcoder",
  publisher: "Vibedcoder",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Invespro",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/vibedcoder-logo.jpg",
        width: 1003,
        height: 1003,
        alt: "Vibedcoder logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/vibedcoder-logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${codeFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <RootProvider search={{ enabled: true }} theme={{ enabled: true }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
