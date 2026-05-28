"use client";

import React, { useRef, useMemo, useState } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * だんごシェアリンク (Dango Share - Yellow)
 * 
 * - ビジュアル: 液体流体金属 / メルクリウス (高輝度鏡面反射 + だんごイエローグラデーション)
 * - インタラクション: ドラッグで伸びる弾性変形 + 離すとプルプル震えるスプリング挙動
 * - 安全設計: 絶対に発散しない多重サイン波シェーダー + 強固な NaN 判定ガード
 */

const DangoShareShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#ebaf2d") },
    uGlowColor: { value: new THREE.Color("#fffbeb") },
    uDeform: { value: 0.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uDeform;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    // 3次元サイン波の多重重ね合わせによる、極めて軽量かつ数学的に絶対発散しないスムーズな液体うねり
    float liquidWaves(vec3 p, float t) {
      float w = sin(p.x * 1.5 + t) * 0.4;
      w += cos(p.y * 1.8 - t * 1.2) * 0.3;
      w += sin(p.z * 2.2 + t * 0.8) * 0.3;
      return w;
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // 流体金属の有機的なうねり (ベース歪み)
      float baseNoise = liquidWaves(position, uTime * 1.2) * 0.12;
      
      // ドラッグ時にさらに大きくグニャリとうねる歪みを付加 (uDeform に比例)
      float dragNoise = sin(position.y * 5.0 - uTime * 4.0) * uDeform * 0.22;
      
      // 合計変位量を安全な上限（元の半径の半分以下）にクランプして絶対的な安定性を担保
      float displacement = clamp(baseNoise + dragNoise, -0.5, 0.5);
      
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
    uniform float uDeform;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // スペキュラー鏡面反射のシミュレーション (MatCap風メタル感)
      vec3 reflectDir = reflect(-viewDir, normal);
      
      float specular = pow(max(0.0, dot(reflectDir, vec3(0.0, 1.0, 0.5))), 8.0);
      float highSpecular = pow(max(0.0, dot(reflectDir, vec3(0.5, 0.8, 0.2))), 32.0);

      // メタリックカラーブレンド
      vec3 metalColor = mix(uColor * 0.6, uGlowColor, specular * 0.7);
      metalColor += vec3(highSpecular * 0.9);

      // フレネル反射
      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0);
      vec3 finalColor = mix(metalColor, uGlowColor, fresnel * 0.5);
      
      // ドラッグ時の変形ストレスによる色の励起発光
      finalColor += uGlowColor * uDeform * 0.15;

      float alpha = mix(0.9, 1.0, fresnel);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

interface DangoShareProps {
  position?: [number, number, number];
}

export default function DangoShare({ position = [0, 0, 0] }: DangoShareProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);
  const pointerStart = useRef(new THREE.Vector3());
  const meshStartPos = useRef(new THREE.Vector3());
  const { raycaster } = useThree();

  // スクロール同期用の目標座標バッファ
  const scrollTargetPos = useRef(new THREE.Vector3());

  const uniforms = useMemo(() => {
    return THREE.UniformsUtils.clone(DangoShareShader.uniforms);
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
    const focusPos = new THREE.Vector3(-1.8, 0, 0); // 左側にフォーカス (カードが右配置のため)
    const hiddenPos = new THREE.Vector3(-4.0, 2.0, -2.0); // 退避位置

    let targetScale = 1.0;
    let interactive = false;

    const targetElement = document.getElementById("tool-share");
    
    if (scrollY < viewHeight * 0.3) {
      scrollTargetPos.current.copy(initialPos);
      scrollTargetPos.current.y += Math.sin(time * 1.1) * 0.12; // 待機浮遊
      targetScale = 0.65;
      interactive = true;
    } else if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const screenCenter = viewHeight / 2;
      
      const dist = Math.abs(elementCenter - screenCenter);
      const activeWeight = Math.max(0, 1.0 - dist / (viewHeight * 0.8));

      if (activeWeight > 0.05) {
        scrollTargetPos.current.lerpVectors(hiddenPos, focusPos, activeWeight);
        targetScale = 0.3 + activeWeight * 0.9;
        interactive = activeWeight > 0.7;
      } else {
        scrollTargetPos.current.copy(hiddenPos);
        targetScale = 0.2;
      }
    } else {
      scrollTargetPos.current.copy(hiddenPos);
      targetScale = 0.2;
    }

    // ドラッグ中でなければ、目標のスクロール位置へ滑らかに lerp
    if (!isDragging) {
      // 異常値 (NaN) ガード
      if (
        !isNaN(scrollTargetPos.current.x) &&
        !isNaN(scrollTargetPos.current.y) &&
        !isNaN(scrollTargetPos.current.z)
      ) {
        mesh.position.lerp(scrollTargetPos.current, 0.08);
      }
      
      // スケールの緩やかな追従
      if (!isNaN(targetScale) && isFinite(targetScale)) {
        const curScale = mesh.scale.x;
        const nextScale = THREE.MathUtils.lerp(curScale, targetScale, 0.1);
        mesh.scale.set(nextScale, nextScale, nextScale);
      }

      mesh.rotation.y = time * 0.15;
      mesh.rotation.z = -time * 0.08;
    }

    setIsInteractive(interactive);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isInteractive) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    document.body.style.cursor = "grabbing";

    const planeIntersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      planeIntersect
    );

    // 交点座標に NaN が含まれている場合はドラッグ開始をスキップ
    if (isNaN(planeIntersect.x) || isNaN(planeIntersect.y) || isNaN(planeIntersect.z)) {
      setIsDragging(false);
      document.body.style.cursor = "default";
      return;
    }

    pointerStart.current.copy(planeIntersect);
    
    if (meshRef.current) {
      meshStartPos.current.copy(meshRef.current.position);
      
      gsap.to(meshRef.current.scale, {
        x: 0.9,
        y: 1.1,
        z: 0.9,
        duration: 0.15,
        ease: "power2.out"
      });
    }

    if (materialRef.current) {
      gsap.to(materialRef.current.uniforms.uDeform, {
        value: 0.8,
        duration: 0.2,
        ease: "power1.out"
      });
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !meshRef.current) return;
    e.stopPropagation();

    const planeIntersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      planeIntersect
    );
    
    // 座標の安全ガード
    if (isNaN(planeIntersect.x) || isNaN(planeIntersect.y) || isNaN(planeIntersect.z)) {
      return;
    }

    const dragDelta = new THREE.Vector3().subVectors(planeIntersect, pointerStart.current);
    
    const dragLimit = 1.8;
    dragDelta.clampLength(0, dragLimit);

    // 移動先の位置に NaN が含まれないかチェックして更新
    const nextPos = new THREE.Vector3().copy(meshStartPos.current).add(dragDelta);
    if (!isNaN(nextPos.x) && !isNaN(nextPos.y) && !isNaN(nextPos.z)) {
      meshRef.current.position.copy(nextPos);
    }

    const stretchAmount = dragDelta.length();
    if (isNaN(stretchAmount) || !isFinite(stretchAmount)) return;

    const stretchScale = 1.0 + stretchAmount * 0.45;
    const shrinkScale = 1.0 / Math.sqrt(stretchScale);

    if (stretchAmount > 0.05 && !isNaN(stretchScale) && isFinite(stretchScale) && !isNaN(shrinkScale) && isFinite(shrinkScale)) {
      const angle = Math.atan2(dragDelta.y, dragDelta.x);
      meshRef.current.rotation.z = angle;
      meshRef.current.scale.set(stretchScale, shrinkScale, shrinkScale);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    setIsDragging(false);
    document.body.style.cursor = "default";

    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh) return;

    gsap.killTweensOf(mesh.position);
    gsap.killTweensOf(mesh.scale);
    gsap.killTweensOf(mesh.rotation);

    // スナップ戻り先の座標に NaN がないことを安全確認
    const finalX = isNaN(scrollTargetPos.current.x) ? position[0] : scrollTargetPos.current.x;
    const finalY = isNaN(scrollTargetPos.current.y) ? position[1] : scrollTargetPos.current.y;
    const finalZ = isNaN(scrollTargetPos.current.z) ? position[2] : scrollTargetPos.current.z;

    // 1. 位置をスプリングバック
    gsap.to(mesh.position, {
      x: finalX,
      y: finalY,
      z: finalZ,
      duration: 0.8,
      ease: "elastic.out(1.1, 0.4)"
    });

    // 2. スケールをスプリングバック
    gsap.to(mesh.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 1.0,
      ease: "elastic.out(1.2, 0.3)"
    });

    // 3. 回転を元に戻す
    gsap.to(mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.6,
      ease: "power2.out"
    });

    if (material) {
      gsap.to(material.uniforms.uDeform, {
        value: 0.0,
        duration: 0.7,
        ease: "power2.inOut"
      });
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={DangoShareShader.vertexShader}
          fragmentShader={DangoShareShader.fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}
