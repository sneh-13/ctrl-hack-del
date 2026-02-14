import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "BioSync — Circadian Rhythm Optimizer",
  description: "AI-powered Biological Prime Time scheduler. Optimize your focus, strength, and recovery with chronobiology science.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-[#060912] text-gray-200`}
      >
        <div className="bg-gradient-mesh min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
