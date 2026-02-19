import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: "AAU Hub | Lost & Found Recovery",
  description: "The official, secure recovery network for Ambrose Alli University students and staff.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AAU Hub",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plusJakarta.variable} font-sans bg-slate-50 text-slate-900 overflow-x-hidden antialiased`}>
        {/* Production-grade Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-sky-500/5 blur-[100px] rounded-full animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}