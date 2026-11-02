import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Board",
  description: "A small place for ideas worth sharing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
