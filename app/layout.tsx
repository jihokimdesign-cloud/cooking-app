import type { Metadata } from "next";
import { Nunito_Sans, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cheffy's Kitchen - 초보 요리사를 위한 친구",
  description: "Cheffy와 함께 시작하는 요리 여정! 초보자도 쉽게 따라할 수 있는 레시피와 친절한 가이드를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${inter.variable} ${roboto.variable} font-body antialiased`}
        style={{ fontFamily: 'var(--font-roboto), sans-serif' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-[#FBF7F0]">
            {/* 왼쪽 사이드바 - 모든 페이지에 표시 */}
            <SidebarNav />
            
            {/* 오른쪽 메인 콘텐츠 영역 */}
            <main className="flex-1 lg:ml-64">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
