"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

/**
 * ヒーロー3Dキャンバスのラッパーコンポーネント
 * 
 * - next/dynamic で R3F Canvas を SSR なしで遅延ロード
 * - ページ全体に背景固定 (fixed inset-0 z-0)
 * - イベントソース (eventSource) を子コンポーネントに伝達
 */

interface HeroCanvasProps {
  eventSource: React.RefObject<HTMLDivElement | null>;
}

const HeroCanvasInner = dynamic(
  () => import("./hero-canvas-inner"),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      />
    ),
  }
);

export default function HeroCanvas({ eventSource }: HeroCanvasProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }} // オーロラ背景(z:-50)の上、HTMLコンテンツ(z:10)の下に配置
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <HeroCanvasInner eventSource={eventSource} />
      </Suspense>
    </div>
  );
}
