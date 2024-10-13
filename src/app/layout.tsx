import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import SideNav from "./_components/SideNav";

export const metadata: Metadata = {
  title: "Twitter Clone",
  description: "This is Twitter Clone by Sadiq Vali",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Providers>
            <main className="container mx-auto flex min-h-screen sm:pr-4">
              <SideNav />
              <div className="flex-grow border-x px-4 py-16">{children}</div>
            </main>
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
