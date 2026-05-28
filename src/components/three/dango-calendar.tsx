"use client";

import React, { useRef, useMemo, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * だんごカレンダー (Dango Calendar - Pink)
 * 
 * - ビジュアル: ホログラム虹色シフト + 上下ループ走査線 (Scanline)
 * - インタラクション: マウスホバーで表面がカクカクしたデジタルブロックへ分解 (Disintegrate)
 * - スクロール同期: スクロール量に応じて画面中央から紹介セクションのデモ位置へ滑らかに遷移
 * - 堅牢設計: ホバーとスクロールのスケール制御を useFrame 内で一本化しコンフリクトを完全防止
 */

const DangoCalendarShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#f05aa0") },
    uGlowColor: { value: new THREE.Color("#a855f7") },
    uHoverEffect: { value: 0.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uHoverEffect;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float blockNoise(vec3 p) {
      vec3 i = floor(p * 5.0);
      return hash(i);
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      float noise = blockNoise(position + vec3(uTime * 0.5));
      float displacement = noise * uHoverEffect * 0.3;
      
      vec3 newPosition = position + normal * displacement;
      newPosition += normal * (uHoverEffect * 0.15 * step(0.5, noise));
      
      vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uTime;
    uniform float uHoverEffect;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.0);

      float phase = dot(normal, viewDir) * 3.14159;
      vec3 iridescence = vec3(
        sin(phase + 0.0) * 0.5 + 0.5,
        sin(phase + 2.094) * 0.5 + 0.5,
        sin(phase + 4.188) * 0.5 + 0.5
      );
      
      vec3 baseColor = mix(uColor, uGlowColor, fresnel);
      vec3 hologramColor = mix(baseColor, iridescence, 0.4);

      float scanline = sin(vPosition.y * 30.0 + uTime * 6.0) * 0.5 + 0.5;
      float scanPattern = mix(scanline * 0.3, scanline * 0.8, uHoverEffect);
      
      vec3 finalColor = hologramColor + (uGlowColor * scanPattern);

      float alphaNoise = step(0.9, fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5453));
      float baseAlpha = mix(0.4, 0.8, fresnel) + scanline * 0.15;
      float finalAlpha = mix(baseAlpha, baseAlpha * (0.4 + 0.6 * alphaNoise), uHoverEffect);

      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `
};

interface DangoCalendarProps {
  position?: [number, number, number];
}

export default function DangoCalendar({ position = [0, 0, 0] }: DangoCalendarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [isInteractive, setIsInteractive] = useState(true);

  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.clone(DangoCalendarShader.uniforms);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
    }
    
    const mesh = meshRef.current;
    if (!mesh) return;

    // --- スクロール同期ポジショニングロジック ---
    const scrollY = window.scrollY;
    const viewHeight = window.innerHeight;

    const initialPos = new THREE.Vector3(position[0], position[1], position[2]);
    const focusPos = new THREE.Vector3(1.8, 0, 0); // 右側にフォーカス (カードが左配置のため)
    const hiddenPos = new THREE.Vector3(4.0, -2.0, -2.0); // 退避位置

    const targetPos = new THREE.Vector3();
    let targetScale = 1.0;
    let interactive = false;

    const targetElement = document.getElementById("tool-calendar");
    
    if (scrollY < viewHeight * 0.3) {
      targetPos.copy(initialPos);
      targetPos.y += Math.cos(time * 1.3) * 0.13; // 待機浮遊
      targetScale = 0.65; // 初期表示は控えめで美しい0.65
      interactive = true;
    } else if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = viewHeight / 2;
      
      const dist = Math.abs(elementCenter - screenCenter);
      const activeWeight = Math.max(0, 1.0 - dist / (viewHeight * 0.8));

      if (activeWeight > 0.05) {
        targetPos.lerpVectors(hiddenPos, focusPos, activeWeight);
        targetScale = 0.3 + activeWeight * 0.9;
        interactive = activeWeight > 0.7;
      } else {
        targetPos.copy(hiddenPos);
        targetScale = 0.2;
      }
    } else {
      targetPos.copy(hiddenPos);
      targetScale = 0.2;
    }

    mesh.position.lerp(targetPos, 0.08);
    
    // ベストプラクティス：ホバー時の拡大スケール（uHoverEffectに連動）を目標値に算入し、
    // useFrame の lerp に一本化。GSAPと競合させず100%バグを防ぎます。
    const hoverMultiplier = 1.0 + uniforms.uHoverEffect.value * 0.18; // ホバー時に最大約1.18倍に膨らむ
    const finalTargetScale = targetScale * hoverMultiplier;

    const curScale = mesh.scale.x;
    const nextScale = THREE.MathUtils.lerp(curScale, finalTargetScale, 0.1);
    mesh.scale.set(nextScale, nextScale, nextScale);

    setIsInteractive(interactive);

    mesh.rotation.y = -time * 0.25;
    mesh.rotation.x = time * 0.1;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!isInteractive) return;
    e.stopPropagation();
    document.body.style.cursor = "pointer";

    if (materialRef.current) {
      gsap.killTweensOf(materialRef.current.uniforms.uHoverEffect);
      gsap.to(materialRef.current.uniforms.uHoverEffect, {
        value: 1.0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "default";

    if (materialRef.current) {
      gsap.killTweensOf(materialRef.current.uniforms.uHoverEffect);
      gsap.to(materialRef.current.uniforms.uHoverEffect, {
        value: 0.0,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={DangoCalendarShader.vertexShader}
          fragmentShader={DangoCalendarShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}
