import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KubeGuard - Self-Healing Kubernetes Platform",
  description: "Real-time Kubernetes monitoring, incident diagnostics, and autonomous healing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-[#F1F5FF] font-sans selection:bg-[#7C3AED]/30 selection:text-[#00D9FF]">
        <DashboardProvider>
          <AppLayout>{children}</AppLayout>
        </DashboardProvider>
      </body>
    </html>
  );
}
