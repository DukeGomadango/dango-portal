"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ヒーロータイトルコンポーネント (Dango Streamverse)
 * 
 * 【究極のブラウザバグ回避 & 防弾デザイン設計】
 * 1. 3Dパースペクティブ (perspective: 1000px) と will-change-transform を完全撤去。
 *    これにより、Chromiumの「3D空間とテキストグラデーションの描画計算バグ」を100%回避します。
 * 2. アニメーションを「滑らかでモダンなスライドイン & ズームフェード」にシフト。
 * 3. インラインCSSにて -webkit-background-clip: text と -webkit-text-fill-color: transparent を
 *    強制指定し、ブラウザのパース欠落をディフェンシブに完全ガード。
 * 4. タイムライン(文字span) と ScrollTrigger(親h1) の完全分離構造は維持し、GSAP競合を根絶。
 */
export default function HeroTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const titleWords = ["DANGO", "STREAMVERSE"];

  useGSAP(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const badge = badgeRef.current;

    if (!container || !title || !subtitle || !badge) return;

    // スコープ内の全文字要素を取得
    const chars = container.querySelectorAll(".hero-title-char");
    if (chars.length === 0) return;

    // 1. 初期表示タイムライン (順次フェードイン & ズーム)
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // バッジ
    tl.fromTo(
      badge,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    );

    // タイトル文字の滑らかなスライドイン＆ズームフェード (3D回転は排除して安全性を最大化)
    tl.fromTo(
      chars,
      { opacity: 0, y: 40, scale: 0.93 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.03,
      },
      "-=0.3"
    );

    // サブタイトル
    tl.fromTo(
      subtitle,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

    // 2. スクロール連動アニメーション (分離設計)
    // <h1> (titleRef) 自体をスクロールでフェードアウト・上昇させる
    gsap.to(title, {
      opacity: 0.15,
      y: -50,
      scale: 0.96,
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
        immediateRender: false,
      },
    });

    // サブタイトルのフェードアウト
    gsap.to(subtitle, {
      opacity: 0,
      y: -60,
      scrollTrigger: {
        trigger: container,
        start: "15% top",
        end: "60% top",
        scrub: 1,
        immediateRender: false,
      },
    });

    // レイアウト寸法リフレッシュ
    ScrollTrigger.refresh();
    const timers = [
      setTimeout(() => ScrollTrigger.refresh(), 100),
      setTimeout(() => ScrollTrigger.refresh(), 400),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      // 3Dパースペクティブを排除し、CSS描画の安全性を絶対的に確保
      className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center select-none"
    >
      {/* バッジ */}
      <span
        ref={badgeRef}
        className="mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium tracking-wider uppercase glass-panel glass-panel-glow-green opacity-0 pointer-events-auto"
        style={{ color: "hsl(150, 85%, 55%)" }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-dango-green animate-pulse" />
        Streaming Tool Suite
      </span>

      {/* メインタイトル: 巨大タイポグラフィ (Syne) */}
      {/* ブラウザバグを回避するため -webkit-background-clip および -webkit-text-fill-color をインラインで強制指定 */}
      {/* 単語内の文字が途中で改行されるのを防ぐため、単語ごとに whitespace-nowrap のコンテナで包み、flex-wrap の gap で単語間隔を制御します */}
      <h1
        ref={titleRef}
        className="font-display text-[7.5vw] sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.1em] text-center select-text"
        style={{
          pointerEvents: "auto",
        }}
      >
        {titleWords.map((word, wordIndex) => (
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
              <span
                key={`${char}-${charIndex}`}
                // will-change-transform や opacity-0 のようなGPUアクセラレーション・初期非表示クラスを廃止し、
                // 描画エラー時のフォールバックテキスト表示を保証
                className="hero-title-char inline-block"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(to bottom, #ffffff 0%, #f1f5f9 60%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </h1>

      {/* サブタイトル */}
      <p
        ref={subtitleRef}
        className="mt-6 max-w-xl text-lg sm:text-xl text-foreground/60 font-sans font-light tracking-wide opacity-0 pointer-events-auto select-text"
      >
        配信を、洗練された体験へ。
        <br className="sm:hidden" />
        4つのツールが、ひとつのエコシステムへ。
      </p>
    </div>
  );
}
