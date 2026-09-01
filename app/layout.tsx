import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { WorkspaceProvider } from "@/lib/store";
import { WorkspaceShell } from "@/components/shell";
import "./globals.css";

const THEME_INIT = `(function(){try{if(localStorage.getItem("faddit-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Faddit — Fashion Product Development Workspace",
  description: "디자인부터 생산 준비까지, 브랜드 팀이 하나의 제품 위에서 함께 일하는 공간",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <WorkspaceProvider>
            <WorkspaceShell>{children}</WorkspaceShell>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
