import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Fun School 🎒",
  description: "Fun math, Hebrew, and English games for 3rd grade!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <AuthProvider>
            <NavBar />
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
