import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BS-Lokossa",
  description: "Plateforme du Bureau Syndical de Lokossa",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
