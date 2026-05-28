"use client";

import { useRef, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * FPS監視 & 動的画質調整コンポーネント
 *
 * useFrame でフレームレートを計測し、30FPS を下回る状態が
 * 一定時間続いた場合に Canvas の dpr（デバイスピクセルレシオ）を
 * 自動で下げてパフォーマンスを回復させる。
 */

/** FPSサンプリング設定 */
const SAMPLE_WINDOW = 60; // 60フレーム分の平均で判定
const LOW_FPS_THRESHOLD = 30;
const LOW_FPS_DURATION_FRAMES = 90; // 90フレーム連続で低FPSならダウングレード
const MIN_DPR = 0.75;
const DPR_STEP = 0.25;

export default function AdaptivePerformance() {
  const { gl } = useThree();
  const fpsBuffer = useRef<number[]>([]);
  const lowFpsCount = useRef(0);
  const lastTime = useRef(0);
  const currentDpr = useRef(1);

  // マウント時にブラウザAPIの値を取得（SSR安全 & lint準拠）
  useEffect(() => {
    lastTime.current = performance.now();
    currentDpr.current = Math.min(window.devicePixelRatio, 2);
  }, []);

  const downgrade = useCallback(() => {
    const nextDpr = Math.max(MIN_DPR, currentDpr.current - DPR_STEP);
    if (nextDpr < currentDpr.current) {
      currentDpr.current = nextDpr;
      gl.setPixelRatio(nextDpr);
    }
  }, [gl]);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    // deltaが0以下の場合はスキップ（タブ非アクティブ復帰時など）
    if (delta <= 0 || delta > 1000) return;

    const fps = 1000 / delta;
    const buffer = fpsBuffer.current;

    buffer.push(fps);
    if (buffer.length > SAMPLE_WINDOW) {
      buffer.shift();
    }

    // サンプルが十分溜まったら平均を計算
    if (buffer.length >= SAMPLE_WINDOW) {
      const avgFps =
        buffer.reduce((sum, val) => sum + val, 0) / buffer.length;

      if (avgFps < LOW_FPS_THRESHOLD) {
        lowFpsCount.current += 1;
      } else {
        // FPSが回復したらカウンタリセット
        lowFpsCount.current = 0;
      }

      if (lowFpsCount.current >= LOW_FPS_DURATION_FRAMES) {
        downgrade();
        lowFpsCount.current = 0;
        // バッファもリセットして再計測開始
        fpsBuffer.current = [];
      }
    }
  });

  // このコンポーネントはUIを描画しない（ロジックのみ）
  return null;
}
