"use client";

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AdaptivePerformance from "./adaptive-performance";

/**
 * ヒーロー3Dシーン内のライティング＆カメラ追従ロジック
 *
 * - ambientLight + pointLight x2 の基本ライティング
 * - マウス座標に微追従するカメラ揺れ（lerp補間で滑らかに）
 * - FPS監視＆動的画質調整（AdaptivePerformance）
 */

/** マウス追従の感度 */
const CAMERA_FOLLOW_STRENGTH = 0.3;
/** lerp 補間の速度（0に近いほどゆるやかに追従） */
const LERP_FACTOR = 0.05;
/** カメラのlookAtターゲット */
const LOOK_AT_TARGET = new THREE.Vector3(0, 0, 0);

export default function HeroScene() {
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const currentOffset = useRef(new THREE.Vector2(0, 0));

  // マウス移動でターゲット位置を更新
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // -1 〜 +1 に正規化（画面中央が 0）
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTarget.current.set(x, y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // useFrame のコールバック引数 state からカメラを取得して操作
  // （useThree の戻り値を直接mutateするとReact 19 lintで警告されるため）
  useFrame((state) => {
    // 現在のオフセットをターゲットに向かってlerp補間
    currentOffset.current.lerp(mouseTarget.current, LERP_FACTOR);

    // カメラ位置に微妙なオフセットを加算（元の位置 z=5 を基準）
    state.camera.position.x = currentOffset.current.x * CAMERA_FOLLOW_STRENGTH;
    state.camera.position.y = currentOffset.current.y * CAMERA_FOLLOW_STRENGTH;
    state.camera.lookAt(LOOK_AT_TARGET);
  });

  return (
    <>
      {/* 環境光: シーン全体に均一な柔らかい光 */}
      <ambientLight intensity={0.4} color="#e8e0ff" />

      {/* メインのポイントライト: だんごグリーン系の明るい光 */}
      <pointLight
        position={[5, 5, 5]}
        intensity={60}
        color="#10e678"
        decay={2}
      />

      {/* フィルライト: だんごピンク系の補助光 */}
      <pointLight
        position={[-4, -3, 3]}
        intensity={40}
        color="#f05aa0"
        decay={2}
      />

      {/* FPS監視 & 動的画質調整 */}
      <AdaptivePerformance />
    </>
  );
}
