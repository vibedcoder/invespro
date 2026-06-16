import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invespro Demo",
  description: "Demo app for the Invespro investment profiling engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
