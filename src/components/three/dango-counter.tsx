"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * だんごカウンター (Dango Counter - Green)
 * 
 * - ビジュアル: 半透明エメラルドガラスシェーダー (Fresnelグロー + 有機的変形)
 * - インタラクション: クリックで弾性バウンド + 中心から「+1」ホログラムが浮き上がる
 * - スクロール同期: スクロール量に応じて画面中央ヒーロー位置から紹介セクションのデモ位置へ滑らかに遷移
 * - 堅牢設計: クリックバウンド係数 (clickBounce) をGSAPで駆動し、useFrame 内でスケールに合成するスプリング一本化仕様
 */

const DangoCounterShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#10e678") },
    uGlowColor: { value: new THREE.Color("#05ff8b") },
    uPulse: { value: 0.05 },
    uClickEffect: { value: 0.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPulse;
    uniform float uClickEffect;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    float wave(vec3 p, float t) {
      return sin(p.x * 2.0 + t) * cos(p.y * 2.0 + t) * sin(p.z * 2.0 + t);
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      float distortion = wave(position, uTime * 2.0) * uPulse;
      distortion += sin(position.y * 10.0 - uTime * 5.0) * uClickEffect * 0.15;
      
      vec3 newPosition = position + normal * distortion;
      
      vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uTime;
    uniform float uClickEffect;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.5);
      
      vec3 baseColor = mix(uColor * 0.3, uGlowColor, fresnel);
      
      float wavePattern = sin(vPosition.y * 8.0 - uTime * 10.0) * 0.5 + 0.5;
      vec3 finalColor = baseColor + (uGlowColor * wavePattern * uClickEffect * 0.4);
      
      float spec = pow(max(0.0, dot(reflect(-viewDir, normal), vec3(0.0, 1.0, 0.0))), 16.0);
      finalColor += vec3(spec * 0.4);

      float alpha = mix(0.35, 0.9, fresnel) + spec * 0.2;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

interface DangoCounterProps {
  position?: [number, number, number];
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function DangoCounter({ position = [0, 0, 0] }: DangoCounterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);
  
  // クリック時のバネ変形係数 (GSAPで揺らして useFrame でスケールに合成する)
  const clickBounceRef = useRef({ scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 });
  const [isInteractive, setIsInteractive] = useState(true);

  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.clone(DangoCounterShader.uniforms);
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

    const { width: viewportWidth } = state.viewport;
    const isMobile = viewportWidth < 6.0;
    
    // モバイル・タブレット時の表示調整 (画面幅に合わせてスケールダウン & 中央寄せ)
    const widthFactor = Math.min(1.0, viewportWidth / 7.5);

    const initialPos = new THREE.Vector3(
      position[0] * widthFactor,
      position[1] * (isMobile ? 0.75 : 1.0),
      position[2]
    );
    const focusPos = isMobile
      ? new THREE.Vector3(0, 1.25, -0.2) // モバイル時は中央上部に配置してカードの邪魔をしない
      : new THREE.Vector3(-1.8, 0, 0); // 左側にフォーカス (カードが右配置のため)
    const hiddenPos = isMobile
      ? new THREE.Vector3(0, -3.5, -2.0)
      : new THREE.Vector3(-4.0, -2.0, -2.0); // 画面外退避位置

    const targetPos = new THREE.Vector3();
    let targetScale = 1.0;
    let interactive = false;

    const targetElement = document.getElementById("tool-counter");
    
    if (scrollY < viewHeight * 0.3) {
      targetPos.copy(initialPos);
      targetPos.y += Math.sin(time * 1.5) * 0.15; // 待機浮遊
      targetScale = 0.65 * widthFactor; // 初期表示は控えめで美しい
      interactive = true;
    } else if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = viewHeight / 2;
      
      const dist = Math.abs(elementCenter - screenCenter);
      const activeWeight = Math.max(0, 1.0 - dist / (viewHeight * 0.8));

      if (activeWeight > 0.05) {
        targetPos.lerpVectors(hiddenPos, focusPos, activeWeight);
        targetScale = (0.3 + activeWeight * 0.9) * widthFactor;
        interactive = activeWeight > 0.7;
      } else {
        targetPos.copy(hiddenPos);
        targetScale = 0.2 * widthFactor;
      }
    } else {
      targetPos.copy(hiddenPos);
      targetScale = 0.2 * widthFactor;
    }

    mesh.position.lerp(targetPos, 0.08);
    
    // スケール追従＋クリック時の弾性変形係数を滑らかに合成
    const curScale = mesh.scale.x;
    const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.1);
    
    // X, Y, Z に異なる弾性変形を適用して「ぷるぷる感」を最大化
    mesh.scale.set(
      nextScale * clickBounceRef.current.scaleX,
      nextScale * clickBounceRef.current.scaleY,
      nextScale * clickBounceRef.current.scaleZ
    );

    setIsInteractive(interactive);

    mesh.rotation.y = time * 0.3;
    mesh.rotation.z = time * 0.1;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isInteractive) return;
    e.stopPropagation();
    
    const material = materialRef.current;
    if (!material) return;

    // クリックバウンド係数オブジェクトをGSAPで弾性変形アニメーション
    gsap.killTweensOf(clickBounceRef.current);
    clickBounceRef.current = { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 };
    
    gsap.timeline()
      .to(clickBounceRef.current, {
        scaleX: 1.35,
        scaleY: 0.65,
        scaleZ: 1.35,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(clickBounceRef.current, {
        scaleX: 0.8,
        scaleY: 1.3,
        scaleZ: 0.8,
        duration: 0.15,
        ease: "power1.inOut"
      })
      .to(clickBounceRef.current, {
        scaleX: 1.15,
        scaleY: 0.9,
        scaleZ: 1.15,
        duration: 0.18,
        ease: "power2.inOut"
      })
      .to(clickBounceRef.current, {
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        duration: 0.4,
        ease: "elastic.out(1.2, 0.3)"
      });

    gsap.killTweensOf(material.uniforms.uClickEffect);
    material.uniforms.uClickEffect.value = 1.0;
    gsap.to(material.uniforms.uClickEffect, {
      value: 0.0,
      duration: 0.8,
      ease: "power2.out"
    });

    const id = particleIdCounter.current++;
    const randomX = (Math.random() - 0.5) * 60;
    const randomY = -40 - Math.random() * 40;

    setParticles((prev) => [...prev, { id, x: randomX, y: randomY }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={DangoCounterShader.vertexShader}
          fragmentShader={DangoCounterShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {particles.map((particle) => (
        <Html
          key={particle.id}
          position={[0, 0.5, 0]}
          center
          distanceFactor={6}
          pointerEvents="none"
        >
          <div
            className="select-none font-display font-black text-3xl tracking-tighter text-dango-green flex items-center justify-center opacity-0 filter drop-shadow-[0_0_12px_rgba(16,230,120,0.6)] animate-float-fade"
            style={
              {
                "--target-x": `${particle.x}px`,
                "--target-y": `${particle.y}px`,
              } as React.CSSProperties
            }
          >
            +1
          </div>
        </Html>
      ))}
    </group>
  );
}
