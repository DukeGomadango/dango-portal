"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import HeroScene from "./hero-scene";
import DangoCounter from "./dango-counter";
import DangoCalendar from "./dango-calendar";
import DangoShare from "./dango-share";
import DangoGame from "./dango-game";

/**
 * R3F Canvas + HeroScene の実体コンポーネント
 *
 * WebGL / window に依存するためクライアント側でのみ実行。
 * 親から渡された最前面コンテンツ層の eventSource をバインドすることで、
 * z-index 的に背後にあっても、HTMLの余白部分を通過したマウス入力を完璧にキャッチします。
 */

interface HeroCanvasInnerProps {
  eventSource: React.RefObject<HTMLDivElement | null>;
}

export default function HeroCanvasInner({ eventSource }: HeroCanvasInnerProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      // 最前景のHTMLコンテンツをイベントソースに設定し、ポインター位置のプレフィックスをクライアントにアライメント
      eventSource={eventSource.current || undefined}
      eventPrefix="client"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto", // R3Fのクリック/ホバーを有効化
      }}
    >
      <HeroScene />

      {/* 4つのブランドだんごオブジェクトを配置 */}
      {/* デザインアライメント修正：巨大タイポグラフィを完全に避けるため、画面の四隅の奥に上品に散らばせる */}
      <DangoCounter position={[-3.2, 1.6, -1.0]} />
      <DangoCalendar position={[3.2, 1.4, -1.5]} />
      <DangoShare position={[-2.8, -1.6, -0.8]} />
      <DangoGame position={[2.8, -1.4, -1.2]} />
    </Canvas>
  );
}
