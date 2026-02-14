import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";

import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
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
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${rajdhani.variable} min-h-screen font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
