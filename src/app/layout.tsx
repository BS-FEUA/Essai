import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "BS-Lokossa | FEUA",
  description: "Bureau Syndical de Lokossa - Fédération des Étudiants Universitaires Associés",
  keywords: ["FEUA", "BS-Lokossa", "syndicat", "étudiants", "Bénin", "Lokossa"],
  authors: [{ name: "FEUA BS-Lokossa" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/feua-logo.png",
    apple: "/feua-logo.png",
  },
  openGraph: {
    title: "BS-Lokossa | FEUA",
    description: "Bureau Syndical de Lokossa - Fédération des Étudiants Universitaires Associés",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1B7A3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="description" content="Bureau Syndical de Lokossa - Fédération des Étudiants Universitaires Associés au Bénin" />
        <link rel="apple-touch-icon" href="/feua-logo.png" />
      </head>
      <body className="site-liquid-glass antialiased bg-background text-foreground min-h-screen overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
