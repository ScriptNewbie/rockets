import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";

const tektur = Tektur({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rockets",
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
        <div className="text-center m-3">
          Data provided by{" "}
          <a href="https://www.rocketlaunch.live/">rocketlaunch.live</a>
        </div>
      </body>
    </html>
  );
}
