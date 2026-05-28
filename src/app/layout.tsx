import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import LenisProvider from "@/components/lenis-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0b0e",
};

export const metadata: Metadata = {
  title: "だんごポータル | Dango Streamverse",
  description: "配信をスマートでイケてるものに。だんごツールファミリーが一元化されたプレミアム配信ツールスイートポータルサイト。",
  keywords: ["配信ツール", "ライブ配信", "だんごツール", "だんごカレンダー", "配信カウンター", "だんごシェアリンク"],
  openGraph: {
    title: "だんごポータル | Dango Streamverse",
    description: "配信をスマートでイケてるものに。だんごツールファミリーが一元化されたプレミアム配信ツールスイートポータルサイト。",
    url: "https://dango-portal.com",
    siteName: "Dango Streamverse",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "Dango Streamverse",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "だんごポータル | Dango Streamverse",
    description: "配信をスマートでイケてるものに。だんごツールファミリーが一元化されたプレミアム配信ツールスイートポータルサイト。",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative selection:bg-dango-green/20 selection:text-dango-green">
        <LenisProvider>
          {/* 動的オーロラバックグラウンドメッシュ (アクセントカラー発光) */}
          <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
            {/* ボール1 (だんごグリーン) */}
            <div 
              className="absolute top-[-10%] left-[-20%] w-[80vmax] h-[80vmax] sm:w-[60vw] sm:h-[60vw] rounded-full blur-[120px] sm:blur-[140px] animate-aurora-slow opacity-35 sm:opacity-30" 
              style={{ backgroundColor: "hsl(150, 85%, 55%)" }}
            />
            {/* ボール2 (だんごピンク) */}
            <div 
              className="absolute bottom-[-10%] right-[-20%] w-[75vmax] h-[75vmax] sm:w-[55vw] sm:h-[55vw] rounded-full blur-[120px] sm:blur-[140px] animate-aurora-fast opacity-30 sm:opacity-25" 
              style={{ backgroundColor: "hsl(330, 95%, 65%)" }}
            />
            {/* ボール3 (だんごイエロー) */}
            <div 
              className="absolute top-[35%] left-[10%] w-[65vmax] h-[65vmax] sm:w-[45vw] sm:h-[45vw] rounded-full blur-[100px] sm:blur-[120px] animate-aurora-slow opacity-25 sm:opacity-20" 
              style={{ backgroundColor: "hsl(45, 95%, 55%)" }}
            />
            {/* 超極細のサイバーグリッドでハイエンド感を演出 */}
            <div 
              className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
              style={{
                backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
            {/* アナログ質感を醸し出す微細ノイズレイヤー */}
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
          </div>
          
          {/* メインコンテンツ */}
          <main className="relative flex-1 flex flex-col">
            {children}
          </main>
        </LenisProvider>
      </body>
    </html>
  );
}
