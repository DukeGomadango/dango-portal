"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * だんごかくれんぼ (Dango Game - Purple)
 * 
 * - ビジュアル: もこもこファー / 多重シェル構造の模倣 (法線ノイズベースのフサフサ突起)
 * - インタラクション: カーソルが近づくと恥ずかしがって逆方向へすっと逃げる動き (Shy Monster)
 * - スクロール同期: スクロール量に応じて画面中央から紹介セクションのデモ位置へ滑らかに遷移
 */

const DangoGameShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#8b5cf6") },
    uGlowColor: { value: new THREE.Color("#ec4899") },
    uFurLength: { value: 0.18 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uFurLength;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    float hash(vec3 p) {
      p = fract(p * vec3(443.8975, 397.2973, 491.1871));
      p += dot(p.xyz, p.yzx + 19.19);
      return fract(p.x * p.y * p.z);
    }

    float furNoise(vec3 p) {
      vec3 i = floor(p * 25.0);
      return hash(i);
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      float noise = furNoise(position + vec3(0.0, uTime * 0.05, 0.0));
      float wave = sin(position.x * 3.0 + uTime * 2.0) * cos(position.y * 3.0 + uTime * 2.0) * 0.3 + 0.7;
      
      float displacement = noise * uFurLength * wave;
      
      vec3 newPosition = position + normal * displacement;
      
      vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.2);

      vec3 furColor = mix(uColor * 0.4, uGlowColor, fresnel);
      
      float shadow = dot(normal, vec3(0.3, 1.0, 0.5)) * 0.4 + 0.6;
      vec3 finalColor = furColor * shadow;

      float alpha = mix(0.8, 1.0, fresnel);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

interface DangoGameProps {
  position?: [number, number, number];
}

export default function DangoGame({ position = [0, 0, 0] }: DangoGameProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const currentVelocity = useRef(new THREE.Vector3(0, 0, 0));

  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.clone(DangoGameShader.uniforms);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      : new THREE.Vector3(1.8, 0, 0); // 右側にフォーカス (カードが左配置のため)
    const hiddenPos = isMobile
      ? new THREE.Vector3(0, -3.5, -2.0)
      : new THREE.Vector3(4.0, 2.0, -2.0); // 退避位置

    let targetScale = 1.0;
    let interactive = false;

    const targetElement = document.getElementById("tool-game");
    const baseTargetPos = new THREE.Vector3();
    
    if (scrollY < viewHeight * 0.3) {
      baseTargetPos.copy(initialPos);
      baseTargetPos.y += Math.cos(time * 0.9) * 0.15; // 待機浮遊
      targetScale = 0.65 * widthFactor;
      interactive = true;
    } else if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = viewHeight / 2;
      
      const dist = Math.abs(elementCenter - screenCenter);
      const activeWeight = Math.max(0, 1.0 - dist / (viewHeight * 0.8));

      if (activeWeight > 0.05) {
        baseTargetPos.lerpVectors(hiddenPos, focusPos, activeWeight);
        targetScale = (0.3 + activeWeight * 0.9) * widthFactor;
        interactive = activeWeight > 0.7;
      } else {
        baseTargetPos.copy(hiddenPos);
        targetScale = 0.2 * widthFactor;
      }
    } else {
      baseTargetPos.copy(hiddenPos);
      targetScale = 0.2 * widthFactor;
    }

    // --- マウスとの距離による「逃避（Shy Monster）」ロジック (インタラクティブな時のみ) ---
    const escapeForce = new THREE.Vector3();
    
    if (interactive) {
      const aspect = state.size.width / state.size.height;
      const vExtent = Math.tan((50 * Math.PI) / 360) * 5;
      const hExtent = vExtent * aspect;
      
      const mouse3D = new THREE.Vector3(
        mousePos.current.x * hExtent,
        mousePos.current.y * vExtent,
        0
      );

      const toMouse = new THREE.Vector3().subVectors(mesh.position, mouse3D);
      const distance = toMouse.length();
      const threatRadius = 3.0;

      if (distance < threatRadius) {
        const strength = Math.pow((threatRadius - distance) / threatRadius, 2) * 1.5;
        escapeForce.copy(toMouse).normalize().multiplyScalar(strength);
        
        if (materialRef.current) {
          gsap.to(materialRef.current.uniforms.uFurLength, {
            value: 0.28,
            duration: 0.15,
            ease: "power2.out"
          });
        }
      } else {
        if (materialRef.current) {
          gsap.to(materialRef.current.uniforms.uFurLength, {
            value: 0.18,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }
    }

    // 最終移動目標 = スクロール同期基準点 + マウス逃避力
    const target = new THREE.Vector3().addVectors(baseTargetPos, escapeForce);

    // スプリング減衰振動でスムーズに追従
    const springK = 0.08;
    const damping = 0.82;
    
    const force = new THREE.Vector3().subVectors(target, mesh.position).multiplyScalar(springK);
    currentVelocity.current.add(force).multiplyScalar(damping);
    mesh.position.add(currentVelocity.current);

    // スケール追従
    const curScale = mesh.scale.x;
    const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.1);
    mesh.scale.set(nextScale, nextScale, nextScale);

    // 速度に応じた生き物のような傾き + 回転
    mesh.rotation.z = -currentVelocity.current.x * 0.8;
    mesh.rotation.x = currentVelocity.current.y * 0.8;
    mesh.rotation.y += 0.02;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={DangoGameShader.vertexShader}
          fragmentShader={DangoGameShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}
