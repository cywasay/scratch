"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float, OrbitControls, ContactShadows } from "@react-three/drei";
import { useInView } from "framer-motion";
import * as THREE from "three";

function SkullModel({ scale, isPushed, isInView }) {
  const { scene } = useGLTF("/glitched_skull/scene.gltf");
  const modelRef = useRef();
  
  // Internal state for smooth lerping
  const anim = useRef({
    scale: 0.1,
    z: -15,
    rotation: Math.PI
  });

  useFrame((state) => {
    if (!modelRef.current) return;

    const t = state.clock.elapsedTime;

    // 1. Calculate Target Values
    // Entry: From Z -15 and Scale 0.1
    // Normal: Z 0 and Scale 1
    // Pushed: Z -8 and Scale 0.4
    const targetScale = isInView ? scale * (isPushed ? 0.4 : 1) : 0.1;
    const targetZ = isInView ? (isPushed ? -8 : 0) : -15;

    // 2. Smooth Lerp
    anim.current.scale = THREE.MathUtils.lerp(anim.current.scale, targetScale, 0.05);
    anim.current.z = THREE.MathUtils.lerp(anim.current.z, targetZ, 0.05);

    // 3. Apply Transformations
    // We only ever touch Z and Scale to keep it "straight"
    modelRef.current.scale.setScalar(anim.current.scale);
    modelRef.current.position.set(0, -0.3, anim.current.z);

    // 4. Local Animations
    modelRef.current.rotation.y = t * 0.15;
    modelRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;

    // Subtle Glitch Jitter (Horizontal only)
    if (Math.random() > 0.985) {
      modelRef.current.position.x = (Math.random() - 0.5) * 0.03;
    } else {
      modelRef.current.position.x = 0;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
    </group>
  );
}

const GlitchedSkull = ({ isPushed }) => {
  const [responsiveScale, setResponsiveScale] = useState(0.6);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setResponsiveScale(0.4);
      } else if (window.innerWidth < 1024) {
        setResponsiveScale(0.5);
      } else {
        setResponsiveScale(0.6);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[1]"
      style={{
        pointerEvents: isPushed ? "none" : "auto",
        background: "transparent"
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00ff41" />
        <pointLight position={[-4, 3, -3]} intensity={0.5} color="#00ffc8" />
        <spotLight
          position={[0, 8, 2]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
            <SkullModel 
              scale={responsiveScale} 
              isPushed={isPushed} 
              isInView={isInView} 
            />
          </Float>
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={12}
            blur={2.5}
            far={10}
            color="#00ff41"
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default GlitchedSkull;

useGLTF.preload("/glitched_skull/scene.gltf");
