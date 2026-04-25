import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "Fundus AI | Retinal Diagnosis Platform",
  description:
    "AI-powered retinal disease detection and clinical diagnosis platform for ophthalmology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <div id="app-root">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
