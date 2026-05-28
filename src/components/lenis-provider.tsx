"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPプラグインの登録
gsap.registerPlugin(ScrollTrigger);

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    // 慣性スクロールの初期化
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // エクスポネンシャルな滑らかなイージング
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // GSAP ScrollTrigger と Lenis のスクロールイベントを完全同期
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // GSAPのTicker（描画更新ループ）にLenisの更新処理を統合
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // 秒からミリ秒に変換
    };

    gsap.ticker.add(updateTicker);

    // 遅延スムージングをリセットして同期のズレを防止
    gsap.ticker.lagSmoothing(0);

    return () => {
      // クリーンアップ
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
    };
  }, []);

  return <>{children}</>;
}
