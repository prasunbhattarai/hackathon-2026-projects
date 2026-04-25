import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundus AI | Retinal Diagnosis Platform",
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
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
