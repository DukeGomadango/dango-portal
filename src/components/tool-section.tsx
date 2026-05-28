"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import type { DangoTool } from "@/lib/tool-data";

gsap.registerPlugin(ScrollTrigger);

const COLOR_MAP: Record<string, string> = {
  green: "glass-panel-glow-green",
  pink: "glass-panel-glow-pink",
  yellow: "glass-panel-glow-yellow",
  purple: "",
} as const;

const ACCENT_HSL: Record<string, string> = {
  green: "hsl(150, 85%, 55%)",
  pink: "hsl(330, 95%, 65%)",
  yellow: "hsl(45, 95%, 55%)",
  purple: "hsl(270, 80%, 65%)",
} as const;

interface ToolSectionProps {
  tool: DangoTool;
  index: number;
}

export default function ToolSection({ tool, index }: ToolSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const titleEl = titleRef.current;

    if (!section || !card || !titleEl) return;

    const ctx = gsap.context(() => {
      // カードのスライドイン（偶数は左から、奇数は右から）
      const xDirection = index % 2 === 0 ? -80 : 80;

      gsap.fromTo(
        card,
        { opacity: 0, x: xDirection, y: 40 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );

      // タイトルのリビール
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [index]);

  const glowClass = COLOR_MAP[tool.color] ?? "";
  const accentColor = ACCENT_HSL[tool.color] ?? "hsl(270, 80%, 65%)";

  return (
    <section
      ref={sectionRef}
      // ベストプラクティス：セクション全体はイベント透過にして背後の3D Canvasにマウスを届かせる
      className="relative py-24 sm:py-32 px-6 pointer-events-none"
      id={`tool-${tool.id}`}
    >
      <div className="mx-auto max-w-5xl">
        {/* セクション番号 */}
        <span
          className="block font-display text-8xl sm:text-9xl font-black leading-none opacity-[0.03] select-none mb-[-40px] sm:mb-[-60px]"
          style={{ color: accentColor }}
          aria-hidden="true"
        >
          0{index + 1}
        </span>

        {/* ツール名 (英語) */}
        <h2
          ref={titleRef}
          className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-2 pointer-events-auto select-text"
          style={{ color: accentColor }}
        >
          {tool.nameEn}
        </h2>
        <p className="font-sans text-sm sm:text-base text-foreground/40 tracking-wider mb-8 pointer-events-auto select-text">
          {tool.name}
        </p>

        {/* カード本体 */}
        <div
          ref={cardRef}
          // カード本体とその中身はインタラクティブにする
          className={`glass-panel ${glowClass} rounded-2xl p-8 sm:p-12 opacity-0 pointer-events-auto`}
        >
          {/* キャッチコピー */}
          <p className="font-sans text-xl sm:text-2xl font-medium text-foreground/90 mb-4 leading-relaxed select-text">
            {tool.tagline}
          </p>

          {/* 説明文 */}
          <p className="font-sans text-sm sm:text-base text-foreground/50 leading-relaxed mb-8 max-w-2xl select-text">
            {tool.description}
          </p>

          {/* 機能タグ */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tool.features.map((feature) => (
              <span
                key={feature}
                className="rounded-full px-4 py-1.5 text-xs font-medium tracking-wide border select-text"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}33`,
                  backgroundColor: `${accentColor}0a`,
                }}
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTA ボタン */}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:gap-3"
            style={{
              color: "var(--background)",
              backgroundColor: accentColor,
            }}
          >
            使ってみる
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
