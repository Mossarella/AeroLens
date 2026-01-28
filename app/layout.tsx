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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lato.variable} ${poppins.variable} antialiased`}
      >
        <nav className="flex flex-col items-center">
          <NavBar></NavBar>
        </nav>
        <main>
          <Suspense fallback={<LoadingPage />}>{children}</Suspense>
        </main>
        <footer className="flex flex-col w-full flex-1 items-center">
          <Footer></Footer>
        </footer>
      </body>
    </html>
  );
}
