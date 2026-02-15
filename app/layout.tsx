import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { Providers } from "@/components/providers";
import { LanguageProvider } from "@/components/providers/language-provider";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aura | Bio-Adaptive Gym Optimizer",
  description:
    "Aura predicts Biological Prime Time for lifting with chronotype-aware readiness intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${manrope.variable} min-h-screen font-sans antialiased`}>
        <Providers>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
