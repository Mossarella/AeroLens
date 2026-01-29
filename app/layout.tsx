import NavBar from "@/components/nav/NavBar";
import "./globals.css";

import Footer from "@/components/footer/Footer";
import { Suspense } from "react";
import LoadingPage from "./loading";
import {
  geistSans,
  geistMono,
  inter,
  lato,
  poppins,
  yellowtail,
} from "@/public/fonts/fontproperty";
export { metadata } from "@/metadata/metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lato.variable} ${poppins.variable} ${yellowtail.variable} antialiased min-h-screen flex flex-col bg-background`}
      >
        <nav className="flex flex-col items-center shrink-0">
          <NavBar></NavBar>
        </nav>
        <main className="flex-1 flex flex-col min-h-0">
          <Suspense fallback={<LoadingPage />}>{children}</Suspense>
        </main>
        <footer className="flex flex-col w-full shrink-0 items-center">
          <Footer></Footer>
        </footer>
      </body>
    </html>
  );
}
