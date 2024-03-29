import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";

const tektur = Tektur({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={tektur.className + " bg-black text-slate-100"}>
        {children}
      </body>
    </html>
  );
}
