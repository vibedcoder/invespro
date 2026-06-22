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

const siteUrl = "https://helm.vercel.app";
const siteTitle = "Helm - Investment Profiling and Portfolio Allocation";
const siteDescription =
  "Try Helm, a rules-based investment profiling and portfolio allocation engine with default questionnaires, custom model definitions, JSON and CSV batch evaluation, and REST/CLI integrations.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Helm",
  title: {
    default: siteTitle,
    template: "%s | Helm",
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
  authors: [{ name: "Zagvar", url: "https://github.com/zagvar" }],
  creator: "Zagvar",
  publisher: "Zagvar",
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
    siteName: "Helm",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/zagvar-logo.jpg",
        width: 1003,
        height: 1003,
        alt: "Zagvar logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/zagvar-logo.jpg"],
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
