import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { roRO } from "@clerk/localizations";
import "./globals.css";
import TRPCProvider from "@/lib/trpc/Provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TopZonal.ro",
  description: "Servicii de top din zona ta!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={roRO}>
      <html lang="ro">
        <head>
          {/* Script-ul Plausible */}
          <Script
            async
            src="https://plausible.io/js/pa-geZ21iAX90eARs7sNf7ac.js"
            strategy="afterInteractive"
          />
          <Script id="plausible-init" strategy="afterInteractive">
            {`
            window.plausible = window.plausible || function() {
              (plausible.q = plausible.q || []).push(arguments)
            };
            plausible.init = plausible.init || function(i) {
              plausible.o = i || {};
            };
            plausible.init();
          `}
          </Script>
        </head>
        <body className={inter.className}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
