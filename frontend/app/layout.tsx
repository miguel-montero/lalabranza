import type { Metadata } from "next";
import { Fraunces, Lora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Labranza",
  description:
    "La Labranza — the live-cooking, tableside-storytelling restaurant of Viña La Quirinca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${lora.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
