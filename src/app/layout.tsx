import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Push. Pull. Legs. Track every set, every rep.",
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 pt-5 sm:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
