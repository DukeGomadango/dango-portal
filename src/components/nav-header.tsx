"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Lock, ShieldCheck } from "lucide-react";
import { DANGO_TOOLS } from "@/lib/tool-data";

/**
 * プレミアム・ナビゲーションヘッダー (Glassmorphism & エルゴノミクス設計)
 * 
 * 【デザイン特徴】
 * 1. デスクトップ: 上部固定の極薄ガラスパネル。スクロール量に応じて縮小し、背景のぼかしが深まる動的トランジション。
 * 2. モバイル: 画面下部にフローティングする「エルゴノミクス・コントロールポッド」（親指で届く設計）。
 *    タップすると画面下部から滑らかにガラスメニューがスライドアップ（ドロワー）します。
 * 3. プレミアムホバー: 各種マイクロインタラクション、グラデーションハイライト、滑らかなバウンスイージング。
 */
export default function NavHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // スクロール状態の監視
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ログインダミーハンドラー (Phase 3のSSOブリッジで本実装)
  const handleLoginToggle = () => {
    setIsLoggedIn((prev) => !prev);
  };

  const activeAccent = "from-dango-green via-dango-pink to-dango-yellow";

  return (
    <>
      {/* ============================================ */}
      {/* デスクトップ用ヘッダー (画面上部固定) */}
      {/* ============================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out hidden md:block select-none pointer-events-auto
          ${
            isScrolled
              ? "py-4 bg-background/50 border-b border-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl"
              : "py-7 bg-transparent border-b border-transparent"
          }`}
      >
        <div className="mx-auto max-w-7xl px-8 flex items-center justify-between">
          {/* 左側: ブランドロゴ */}
          <a
            href="#hero"
            className="flex items-center gap-3 group transition-transform duration-300 active:scale-95"
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeAccent} p-[1.5px] transition-transform duration-500 group-hover:rotate-180`}>
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${activeAccent} opacity-80`} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-black tracking-wider uppercase leading-none bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
                DANGO
              </span>
              <span className="font-sans text-[9px] font-bold tracking-widest text-foreground/40 uppercase leading-none mt-1">
                Streamverse
              </span>
            </div>
          </a>

          {/* 中央: ナビゲーションリンク */}
          <nav className="flex items-center gap-1.5 glass-panel px-1.5 py-1 rounded-full border border-white/5 bg-white/2">
            {DANGO_TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={`#tool-${tool.id}`}
                className="relative px-5 py-2 rounded-full text-xs font-sans font-medium tracking-widest text-foreground/50 uppercase transition-all duration-300 hover:text-foreground/90 hover:bg-white/5 active:scale-95"
              >
                {tool.nameEn.replace("Dango ", "")}
              </a>
            ))}
          </nav>

          {/* 右側: ログインボタン */}
          <button
            onClick={handleLoginToggle}
            className={`group flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-sans font-semibold tracking-wider uppercase transition-all duration-300 active:scale-95
              ${
                isLoggedIn
                  ? "bg-dango-green/10 border border-dango-green/20 text-dango-green hover:bg-dango-green/20"
                  : "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-black/20"
              }`}
          >
            {isLoggedIn ? (
              <>
                <ShieldCheck size={14} className="animate-pulse" />
                DANGO ID
              </>
            ) : (
              <>
                <Lock size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                ログイン
              </>
            )}
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* モバイル用コントロールポッド (画面下部固定フローティング) */}
      {/* ============================================ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-auto select-none">
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-full border shadow-2xl transition-all duration-300 active:scale-95 backdrop-blur-xl
            ${
              isMobileMenuOpen
                ? "bg-background/90 border-white/10 text-foreground scale-95"
                : "bg-background/60 border-white/5 text-foreground/80 hover:bg-background/80"
            }`}
        >
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${activeAccent} ${isMobileMenuOpen ? "" : "animate-pulse"}`} />
          <span className="font-display text-xs font-black tracking-widest uppercase">
            {isMobileMenuOpen ? "CLOSE" : "STREAMVERSE"}
          </span>
          <div className="w-[1px] h-3.5 bg-white/10" />
          {isMobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {/* ============================================ */}
      {/* モバイル用スライドアップメニュー (ドロワー) */}
      {/* ============================================ */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden transition-all duration-500 ease-in-out pointer-events-auto
          ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 bg-background/95 border-t border-white/10 rounded-t-[32px] p-8 pb-28 flex flex-col gap-8 transition-transform duration-500 ease-out shadow-2xl
            ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ドロワーの引き手インジケータ */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto" />

          {/* ブランドロゴ */}
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeAccent} p-[1.5px]`}>
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${activeAccent}`} />
              </div>
            </div>
            <span className="font-display text-lg font-black tracking-wider uppercase leading-none bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
              DANGO STREAMVERSE
            </span>
          </div>

          {/* ナビゲーションリスト */}
          <nav className="flex flex-col gap-3">
            {DANGO_TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={`#tool-${tool.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/5 bg-white/1 hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
              >
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                    0{DANGO_TOOLS.indexOf(tool) + 1}
                  </span>
                  <span className="font-display text-base font-extrabold tracking-wider text-foreground/80 uppercase">
                    {tool.nameEn.replace("Dango ", "")}
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `hsla(${
                      tool.color === "green"
                        ? "150, 85%, 55%"
                        : tool.color === "pink"
                        ? "330, 95%, 65%"
                        : tool.color === "yellow"
                        ? "45, 95%, 55%"
                        : "270, 80%, 65%"
                    }, 0.1)`,
                    color:
                      tool.color === "green"
                        ? "hsl(150, 85%, 55%)"
                        : tool.color === "pink"
                        ? "hsl(330, 95%, 65%)"
                        : tool.color === "yellow"
                        ? "hsl(45, 95%, 55%)"
                        : "hsl(270, 80%, 65%)",
                  }}
                >
                  <ArrowUpRight size={14} />
                </div>
              </a>
            ))}
          </nav>

          {/* ログインボタン (モバイルサイズ) */}
          <button
            onClick={() => {
              handleLoginToggle();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full py-4 rounded-2xl text-sm font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-95
              ${
                isLoggedIn
                  ? "bg-dango-green/10 border border-dango-green/20 text-dango-green"
                  : "bg-foreground text-background shadow-lg"
              }`}
          >
            {isLoggedIn ? (
              <>
                <ShieldCheck size={16} />
                DANGO ID 接続完了
              </>
            ) : (
              <>
                <Lock size={14} />
                DANGO ID でログイン
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
