"use client";

import React, { useRef, useState, useEffect } from "react";
import HeroTitle from "@/components/hero-title";
import HeroCanvas from "@/components/three/hero-canvas";
import ScrollIndicator from "@/components/scroll-indicator";
import ToolSection from "@/components/tool-section";
import NavHeader from "@/components/nav-header";
import { DANGO_TOOLS } from "@/lib/tool-data";

/**
 * メインポータルページ (Dango Streamverse)
 * 
 * ベストプラクティスに基づき、3Dキャンバス (HeroCanvas) をページ全体に fixed 配置。
 * ルートコンテナの ref (containerRef) を Canvas の eventSource としてバインドすることで、
 * イベント透過でありながら、だんごオブジェクトへの3Dインタラクションを完璧に両立します。
 */
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOgpMode, setIsOgpMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsOgpMode(params.get("ogp") === "true");
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">

      {/* ============================================ */}
      {/* 常に画面全体に固定される R3F 3D キャンバス層 */}
      {/* ============================================ */}
      <HeroCanvas eventSource={containerRef} />

      {/* ============================================ */}
      {/* ヒーローセクション: 巨大タイポグラフィ + スクロール誘導 */}
      {/* ============================================ */}
      <section className="relative pointer-events-none" id="hero" style={{ zIndex: 10 }}>
        <HeroTitle />
        {!isOgpMode && <ScrollIndicator />}
      </section>

      {/* ============================================ */}
      {/* ツール紹介セクション ×4 (スクロール駆動) */}
      {/* ============================================ */}
      <div className="relative z-10 w-full">
        {DANGO_TOOLS.map((tool, index) => (
          <ToolSection key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {/* ============================================ */}
      {/* フッター */}
      {/* ============================================ */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/5 bg-background/30 backdrop-blur-md pointer-events-auto">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* ロゴ */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dango-green via-dango-pink to-dango-yellow" />
            <span className="font-display text-lg font-bold tracking-tight text-foreground/80">
              Dango Streamverse
            </span>
          </div>

          {/* ナビリンク */}
          <nav className="flex items-center gap-6">
            {DANGO_TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={`#tool-${tool.id}`}
                className="text-xs font-sans tracking-wider text-foreground/30 hover:text-foreground/70 transition-colors duration-300 uppercase"
              >
                {tool.nameEn.replace("Dango ", "")}
              </a>
            ))}
          </nav>

          {/* コピーライト */}
          <p className="text-xs font-sans text-foreground/20 tracking-wider">
            &copy; {new Date().getFullYear()} Dukegomadango
          </p>
        </div>
      </footer>
      {!isOgpMode && <NavHeader />}
    </div>
  );
}
