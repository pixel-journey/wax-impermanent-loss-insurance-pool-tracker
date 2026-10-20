import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IL insurance tracker — educational example",
  description: "Compare full-range impermanent loss with a fixture insurance policy. No network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
