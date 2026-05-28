"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollIndicator() {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const ctx = gsap.context(() => {
      // 初期表示: 少し遅れてフェードイン
      gsap.fromTo(
        indicator,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, delay: 2.5, ease: "power2.out" }
      );

      // 上下バウンスアニメーション（無限ループ）
      gsap.to(indicator.querySelector(".scroll-arrow"), {
        y: 8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // スクロール開始後にフェードアウト
      gsap.to(indicator, {
        opacity: 0,
        y: 20,
        scrollTrigger: {
          trigger: indicator,
          start: "top 90%",
          end: "top 70%",
          scrub: 1,
        },
      });
    }, indicator);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={indicatorRef}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 z-10"
    >
      <span className="text-xs font-sans tracking-[0.3em] uppercase text-foreground/30">
        Scroll
      </span>
      <div className="scroll-arrow text-foreground/30">
        <ChevronDown size={20} strokeWidth={1.5} />
      </div>
      {/* 極細のスクロールラインアニメーション */}
      <div className="w-px h-12 bg-gradient-to-b from-foreground/20 to-transparent" />
    </div>
  );
}
