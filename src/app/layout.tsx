import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velloway Hair Studio | Portfolio sample",
  description:
    "A demo landing page for an invented hair salon: services, prices and online booking requests. Built by jdcreative.studiodesign.",
  // An invented business, so keep it out of search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
