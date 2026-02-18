
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: "AAU Lost & Found | Official Portal",
  description: "The secure recovery network for Ambrose Alli University.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-slate-50 text-slate-900 overflow-x-hidden`}>
        {/* Animated Creative Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-violet-500/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
