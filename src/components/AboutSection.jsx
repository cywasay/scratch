"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// --- CSS Animations for True 3D Holograms ---
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes grid-move {
    from { transform: translateY(0); }
    to { transform: translateY(60px); }
  }
  @keyframes spin-x { 100% { transform: rotateX(360deg); } }
  @keyframes spin-y { 100% { transform: rotateY(360deg); } }
  @keyframes spin-z { 100% { transform: rotateZ(360deg); } }
  @keyframes spin-cube { 100% { transform: rotateX(360deg) rotateY(360deg); } }
  @keyframes spin-panels { 100% { transform: rotateZ(360deg); } }
  @keyframes data-shoot {
    0% { top: 0%; opacity: 1; transform: translateX(-50%) scaleY(1); }
    80% { opacity: 1; }
    100% { top: 100%; opacity: 0; transform: translateX(-50%) scaleY(3); }
  }

  @keyframes section-glitch {
    0%, 100% { transform: none; opacity: 1; }
    7% { transform: translate(-1px, 0.5px) skewX(-0.2deg); }
    10% { transform: translate(1px, -0.5px) skewX(0.2deg); }
    13% { transform: none; }
    60% { transform: none; }
    63% { transform: translate(-0.5px, 0) skewX(-0.1deg); opacity: 0.97; }
    66% { transform: translate(0.5px, 0.5px); opacity: 1; }
    69% { transform: none; }
  }

  @keyframes hex-float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 0.3; }
    50% { transform: translateY(-30px) translateX(5px); opacity: 0.15; }
    90% { opacity: 0.3; }
  }
  
  .preserve-3d { transform-style: preserve-3d; }
  .perspective-1000 { perspective: 1000px; }

  .hologram-transition {
    transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .about-section-wrapper {
    animation: section-glitch 12s steps(1) infinite;
  }
`;

// --- 1. Canvas Component for the "Neural Sphere" ---
const NeuralSphere = ({ isPushed }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const points = [];
    const numPoints = 180; // Optimized density for performance
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      points.push({
        nx: Math.cos(theta) * radiusAtY,
        ny: y,
        nz: Math.sin(theta) * radiusAtY,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Generate ring points
    const ringPoints = [];
    for (let i = 0; i < 60; i++) {
      const theta = (i / 60) * Math.PI * 2;
      ringPoints.push({ nx: Math.cos(theta), ny: 0, nz: Math.sin(theta) });
    }

    let rotationX = 0;
    let rotationY = 0;
    let frame;
    let start = performance.now();

    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const elapsed = (now - start) / 1000;

      ctx.clearRect(0, 0, w, h);

      const baseRadius = Math.min(w, h) * 0.28;
      const fov = baseRadius * 3;

      // Smooth mouse tracking + continuous idle rotation
      const targetRotationY = mouseX * 0.8 + elapsed * 0.2;
      const targetRotationX = -mouseY * 0.8 + Math.sin(elapsed * 0.5) * 0.15;

      rotationY += (targetRotationY - rotationY) * 0.05;
      rotationX += (targetRotationX - rotationX) * 0.05;

      const centerX = w / 2;
      const centerY = h / 2;

      // Draw Central Energy Core
      const coreRadius =
        baseRadius * 0.3 + Math.sin(elapsed * 3) * (baseRadius * 0.05);
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius * 2,
      );
      gradient.addColorStop(0, "rgba(0, 255, 100, 0.4)");
      gradient.addColorStop(0.4, "rgba(0, 255, 65, 0.1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Project Sphere Points
      const projectedPoints = [];
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Core pulse wave that travels through the sphere
        const wave = Math.sin(p.ny * 5 - elapsed * 2);
        const breathe =
          Math.sin(elapsed * 1.5 + p.pulseOffset) * (baseRadius * 0.03) +
          (wave > 0.8 ? baseRadius * 0.05 : 0);
        const currentRadius = baseRadius + breathe;

        const cx = p.nx * currentRadius;
        const cy = p.ny * currentRadius;
        const cz = p.nz * currentRadius;

        let x1 = cx * Math.cos(rotationY) - cz * Math.sin(rotationY);
        let z1 = cz * Math.cos(rotationY) + cx * Math.sin(rotationY);

        let y2 = cy * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = z1 * Math.cos(rotationX) + cy * Math.sin(rotationX);

        const scale = fov / (fov + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        projectedPoints.push({ px, py, z: z2, scale, wave });
      }

      // Draw Neural Connections
      // Draw Neural Connections (Batched)
      ctx.lineWidth = 0.5;
      const conn = { cyan: [], magenta: [], green: [] };

      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];
        if (p1.z > baseRadius * 0.3) continue;

        let connections = 0;
        for (let j = i + 1; j < projectedPoints.length; j++) {
          if (connections >= 2) break;
          const p2 = projectedPoints[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = dx * dx + dy * dy;

          if (dist < Math.pow(baseRadius * 0.3 * p1.scale, 2)) {
            const l = [p1.px, p1.py, p2.px, p2.py];
            if (p1.wave > 0.9 || p2.wave > 0.9) conn.cyan.push(l);
            else if (Math.random() > 0.999) conn.magenta.push(l);
            else conn.green.push(l);
            connections++;
          }
        }
      }

      const drawBatch = (list, color) => {
        if (!list.length) return;
        ctx.strokeStyle = color;
        ctx.beginPath();
        list.forEach((l) => {
          ctx.moveTo(l[0], l[1]);
          ctx.lineTo(l[2], l[3]);
        });
        ctx.stroke();
      };

      drawBatch(conn.cyan, "rgba(0, 255, 200, 0.7)");
      drawBatch(conn.magenta, "rgba(255, 0, 85, 0.6)");
      drawBatch(conn.green, "rgba(0, 255, 65, 0.12)");

      // Draw Nodes
      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];
        const alpha = Math.max(
          0.1,
          0.8 - (p1.z + baseRadius) / (baseRadius * 2),
        );
        ctx.fillStyle =
          p1.wave > 0.9 ? "#00ffc8" : `rgba(0, 255, 65, ${alpha})`;
        ctx.beginPath();
        ctx.arc(
          p1.px,
          p1.py,
          Math.max(0.5, (p1.wave > 0.9 ? 3.5 : 2.5) * p1.scale),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Draw Equatorial Rings
      const drawRing = (radiusMult, yOffset, speedMult, color) => {
        const rRotY = rotationY * speedMult;
        const rRotX = rotationX;
        ctx.beginPath();
        for (let i = 0; i <= ringPoints.length; i++) {
          const p = ringPoints[i % ringPoints.length];
          const cx = p.nx * baseRadius * radiusMult;
          const cy = yOffset;
          const cz = p.nz * baseRadius * radiusMult;

          let x1 = cx * Math.cos(rRotY) - cz * Math.sin(rRotY);
          let z1 = cz * Math.cos(rRotY) + cx * Math.sin(rRotY);
          let y2 = cy * Math.cos(rRotX) - z1 * Math.sin(rRotX);
          let z2 = z1 * Math.cos(rRotX) + cy * Math.sin(rRotX);

          const scale = fov / (fov + z2);
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      drawRing(1.3, 0, 1.5, "rgba(0, 255, 100, 0.15)");
      drawRing(1.4, Math.sin(elapsed) * 20, -1.2, "rgba(0, 255, 200, 0.1)");
      drawRing(1.1, Math.cos(elapsed) * 15, 2.0, "rgba(255, 0, 85, 0.1)");
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
      style={{
        transform: isPushed
          ? "translateZ(-400px) scale(0.5)"
          : "translateZ(0) scale(1)",
        opacity: isPushed ? 0.15 : 1,
        willChange: "transform, opacity",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// --- 2. True 3D CSS Hologram Objects with Three.js Cores ---

const Core3D = ({ type, color }) => {
  const groupRef = useRef();
  const innerRef = useRef();
  useFrame((state, delta) => {
    groupRef.current.rotation.x += delta * 1.2;
    groupRef.current.rotation.y += delta * 1.5;
    innerRef.current.rotation.x -= delta * 2.0;
    innerRef.current.rotation.z += delta * 1.8;
  });

  return (
    <group>
      <pointLight color={color} intensity={2} distance={8} />
      <group ref={groupRef} scale={1.6}>
        <mesh>
          {type === "gyro" && <icosahedronGeometry args={[1, 1]} />}
          {type === "cube" && <boxGeometry args={[1, 1, 1]} />}
          {type === "panels" && <octahedronGeometry args={[1, 0]} />}
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        <mesh scale={1.5}>
          {type === "gyro" && <icosahedronGeometry args={[1, 1]} />}
          {type === "cube" && <boxGeometry args={[1.2, 1.2, 1.2]} />}
          {type === "panels" && <octahedronGeometry args={[1, 0]} />}
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
      <group ref={innerRef} scale={0.6}>
        <mesh>
          {type === "gyro" && <octahedronGeometry args={[1, 0]} />}
          {type === "cube" && <tetrahedronGeometry args={[1, 0]} />}
          {type === "panels" && <icosahedronGeometry args={[1, 0]} />}
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>
    </group>
  );
};

const GyroscopeHologram = () => (
  <div className="relative w-40 h-40">
    {/* Glow Aura */}
    <div
      className="absolute inset-[-20%] rounded-full animate-pulse pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%)",
      }}
    />
    {/* Pulsing outer ring */}
    <div
      className="absolute inset-[-10%] rounded-full border border-cyan-500/20 animate-ping pointer-events-none"
      style={{ animationDuration: "3s" }}
    />
    {/* CSS rings */}
    <div
      className="absolute inset-2 preserve-3d"
      style={{ animation: "spin-y 8s linear infinite" }}
    >
      <div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/60"
        style={{ boxShadow: "0 0 12px rgba(0,255,255,0.3)" }}
      />
      <div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/60"
        style={{
          transform: "rotateX(90deg)",
          boxShadow: "0 0 12px rgba(0,255,255,0.3)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full border border-cyan-400/30"
        style={{ transform: "rotateY(90deg)" }}
      />
    </div>
    {/* Three.js core */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-10">
      <Canvas
        camera={{ position: [0, 0, 6] }}
        style={{ pointerEvents: "none" }}
      >
        <Core3D type="gyro" color="#00ffff" />
      </Canvas>
    </div>
    {/* Data readout */}
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] text-cyan-500/40 whitespace-nowrap tracking-widest">
      ● ONLINE
    </div>
  </div>
);

const DataCubeHologram = () => (
  <div className="relative w-36 h-36">
    {/* Glow Aura */}
    <div
      className="absolute inset-[-20%] rounded-full animate-pulse pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(255,0,128,0.12) 0%, transparent 70%)",
      }}
    />
    {/* Pulsing outer ring */}
    <div
      className="absolute inset-[-10%] rounded-full border border-pink-500/20 animate-ping pointer-events-none"
      style={{ animationDuration: "4s" }}
    />
    {/* CSS cube */}
    <div
      className="absolute inset-2 preserve-3d"
      style={{ animation: "spin-cube 10s linear infinite" }}
    >
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{
          transform: "translateZ(28px)",
          boxShadow: "0 0 10px rgba(255,0,128,0.2)",
        }}
      />
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{ transform: "rotateY(180deg) translateZ(28px)" }}
      />
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{ transform: "rotateY(-90deg) translateZ(28px)" }}
      />
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{ transform: "rotateY(90deg) translateZ(28px)" }}
      />
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{ transform: "rotateX(90deg) translateZ(28px)" }}
      />
      <div
        className="absolute inset-0 border-2 border-pink-400/50 bg-pink-500/5"
        style={{ transform: "rotateX(-90deg) translateZ(28px)" }}
      />
    </div>
    {/* Three.js core */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-10">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{ pointerEvents: "none" }}
      >
        <Core3D type="cube" color="#ff0080" />
      </Canvas>
    </div>
    {/* Data readout */}
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] text-pink-500/40 whitespace-nowrap tracking-widest">
      ● SYNCED
    </div>
  </div>
);

const StackedPanelsHologram = () => (
  <div className="relative w-36 h-36">
    {/* Glow Aura */}
    <div
      className="absolute inset-[-20%] rounded-full animate-pulse pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(255,200,0,0.12) 0%, transparent 70%)",
      }}
    />
    {/* Pulsing outer ring */}
    <div
      className="absolute inset-[-10%] rounded-full border border-yellow-500/20 animate-ping pointer-events-none"
      style={{ animationDuration: "3.5s" }}
    />
    {/* CSS panels */}
    <div
      className="absolute inset-2 preserve-3d"
      style={{ transform: "rotateX(55deg) rotateY(15deg)" }}
    >
      <div
        className="absolute inset-0 preserve-3d"
        style={{ animation: "spin-panels 6s linear infinite" }}
      >
        <div
          className="absolute inset-0 border-2 rounded-lg border-yellow-400/60"
          style={{
            transform: "translateZ(30px)",
            boxShadow: "0 0 10px rgba(255,200,0,0.2)",
          }}
        />
        <div
          className="absolute inset-0 border-2 rounded-lg border-yellow-400/30"
          style={{ transform: "translateZ(0px) scale(0.8)" }}
        />
        <div
          className="absolute inset-0 border-2 rounded-lg border-yellow-400/15"
          style={{ transform: "translateZ(-30px) scale(0.6)" }}
        />
      </div>
    </div>
    {/* Three.js core */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-10">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{ pointerEvents: "none" }}
      >
        <Core3D type="panels" color="#ffcc00" />
      </Canvas>
    </div>
    {/* Data readout */}
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] text-yellow-500/40 whitespace-nowrap tracking-widest">
      ● ARMED
    </div>
  </div>
);

// --- 3. Augmentation (Skill) Bar Component ---
const AugmentationBar = ({ name, level, colorClass = "bg-green-400" }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), 300);
    return () => clearTimeout(timer);
  }, [level]);

  return (
    <div className="flex flex-col gap-2 mb-6 animate-in slide-in-from-right duration-700">
      <div className="flex justify-between font-mono text-[10px] tracking-widest text-green-500/70">
        <span>{name}</span>
        <span>{width}%</span>
      </div>
      <div className="w-full h-1.5 bg-green-900/30 overflow-hidden relative">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`}
          style={{ width: `${width}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// --- 4. Main Section Component ---
const AboutSection = () => {
  const [activeNode, setActiveNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const getHologramColor = (colorClass) => {
    switch (colorClass) {
      case "cyan":
        return "rgba(0, 255, 200, 0.6)";
      case "pink":
        return "rgba(255, 0, 128, 0.6)";
      case "yellow":
        return "rgba(255, 200, 0, 0.6)";
      default:
        return "rgba(0, 255, 65, 0.6)";
    }
  };

  const handleNodeClick = (id) => {
    if (activeNode === id) setActiveNode(null);
    else setActiveNode(id);
  };

  const nodePositions = {
    SKILLS: { top: "15%", left: "10%", classes: "top-[15%] left-[10%]" },
    BIOMETRICS: { top: "25%", right: "10%", classes: "top-[25%] right-[10%]" },
    DIRECTIVES: {
      bottom: "20%",
      left: "12%",
      classes: "bottom-[20%] left-[12%]",
    },
  };

  return (
    <>
      <style>{`
        @keyframes grid-move {
          from { transform: translateY(0); }
          to { transform: translateY(60px); }
        }
        ${styles}
      `}</style>

      <section
        id="about"
        className="relative min-h-screen w-full flex items-center justify-center z-10 bg-black overflow-hidden perspective-1000"
      >
        {/* --- DYNAMIC BACKGROUND ELEMENTS --- */}
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-green-900/10 rounded-full blur-[150px] pointer-events-none z-0" />

        {/* Perspective Cyber-Grid */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <div
            className="absolute w-[200vw] h-[200vh]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 65, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 65, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              animation: "grid-move 4s linear infinite",
              maskImage:
                "radial-gradient(ellipse at center, black 10%, transparent 60%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 10%, transparent 60%)",
            }}
          />
        </div>

        {/* === GLITCH & DISTORTION OVERLAYS === */}

        {/* === HUD CORNER BRACKETS === */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-green-500/20 pointer-events-none z-[5]" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-green-500/20 pointer-events-none z-[5]" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-green-500/20 pointer-events-none z-[5]" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-green-500/20 pointer-events-none z-[5]" />

        {/* HUD Section Label */}
        <div className="absolute top-8 left-20 font-mono text-[10px] tracking-[0.5em] text-green-500/15 uppercase pointer-events-none z-[5]">
          SYS.NEURAL_CORE // ACTIVE
        </div>
        <div className="absolute bottom-8 right-20 font-mono text-[10px] tracking-[0.3em] text-green-500/10 uppercase pointer-events-none z-[5]">
          SECTOR 02 // BIOMETRIC ACCESS GRANTED
        </div>

        {/* Floating Hex Data */}
        <div
          className="absolute top-[20%] right-[5%] font-mono text-[9px] text-green-500/10 pointer-events-none z-[5] leading-relaxed"
          style={{ animation: "hex-float 6s ease-in-out infinite" }}
        >
          0xAF29E1B3
          <br />
          0x00FF4100
          <br />
          0xDEADBEEF
        </div>
        <div
          className="absolute bottom-[25%] right-[8%] font-mono text-[9px] text-cyan-500/8 pointer-events-none z-[5] leading-relaxed"
          style={{ animation: "hex-float 8s ease-in-out infinite 2s" }}
        >
          NODE::ACTIVE
          <br />
          PKT_RECV: 847
          <br />
          LATENCY: 0.3ms
        </div>

        <NeuralSphere isPushed={activeNode !== null} />

        {/* Backdrop for active state — click to close */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-700 z-[55] ${activeNode ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"}`}
          onClick={() => setActiveNode(null)}
        />

        {/* --- 3D HOLOGRAM NODES --- */}
        <div className="absolute inset-0 w-full h-full">
          {/* SKILLS */}
          <div
            className={`absolute flex flex-col items-center gap-6 cursor-pointer hologram-transition z-50 ${activeNode === "SKILLS" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : activeNode ? "opacity-0 scale-0 pointer-events-none" : "top-[15%] left-[10%]"}`}
            onClick={() => handleNodeClick("SKILLS")}
            onMouseEnter={() => setHoveredNode("SKILLS")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              transform:
                activeNode === "SKILLS"
                  ? "translate(-50%, -50%) scale(1.5)"
                  : undefined,
            }}
          >
            <div className="relative flex items-center justify-center transition-transform duration-700">
              <GyroscopeHologram active={activeNode === "SKILLS"} />
              <div
                className={`absolute -bottom-8 font-mono text-sm tracking-[0.3em] font-bold whitespace-nowrap transition-all duration-500 ${activeNode === "SKILLS" ? "opacity-0" : "text-cyan-400 group-hover:text-white"}`}
              >
                [LOADED_SKILLS]
              </div>
            </div>
          </div>

          {/* BIOMETRICS */}
          <div
            className={`absolute flex flex-col items-center gap-6 cursor-pointer hologram-transition z-50 ${activeNode === "BIOMETRICS" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : activeNode ? "opacity-0 scale-0 pointer-events-none" : "top-[25%] right-[10%]"}`}
            onClick={() => handleNodeClick("BIOMETRICS")}
            onMouseEnter={() => setHoveredNode("BIOMETRICS")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              transform:
                activeNode === "BIOMETRICS"
                  ? "translate(-50%, -50%) scale(1.5)"
                  : undefined,
            }}
          >
            <div className="relative flex items-center justify-center transition-transform duration-700">
              <DataCubeHologram active={activeNode === "BIOMETRICS"} />
              <div
                className={`absolute -bottom-8 font-mono text-sm tracking-[0.3em] font-bold whitespace-nowrap transition-all duration-500 ${activeNode === "BIOMETRICS" ? "opacity-0" : "text-pink-500 group-hover:text-white"}`}
              >
                [BIOMETRICS]
              </div>
            </div>
          </div>

          {/* DIRECTIVES */}
          <div
            className={`absolute flex flex-col items-center gap-6 cursor-pointer hologram-transition z-50 ${activeNode === "DIRECTIVES" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : activeNode ? "opacity-0 scale-0 pointer-events-none" : "bottom-[20%] left-[12%]"}`}
            onClick={() => handleNodeClick("DIRECTIVES")}
            onMouseEnter={() => setHoveredNode("DIRECTIVES")}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              transform:
                activeNode === "DIRECTIVES"
                  ? "translate(-50%, -50%) scale(1.5)"
                  : undefined,
            }}
          >
            <div className="relative flex items-center justify-center transition-transform duration-700">
              <StackedPanelsHologram active={activeNode === "DIRECTIVES"} />
              <div
                className={`absolute -bottom-8 font-mono text-sm tracking-[0.3em] font-bold whitespace-nowrap transition-all duration-500 ${activeNode === "DIRECTIVES" ? "opacity-0" : "text-yellow-400 group-hover:text-white"}`}
              >
                [DIRECTIVES]
              </div>
            </div>
          </div>
        </div>

        {/* --- DATA PANELS (Visible when active) --- */}
        <div
          className={`absolute inset-0 z-[60] flex items-center justify-center pointer-events-none ${activeNode ? "opacity-100" : "opacity-0"} transition-all duration-700`}
        >
          <div className="w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 gap-8">
            {/* LEFT PANEL */}
            <div
              className={`w-full md:w-[35%] pointer-events-auto transition-all duration-700 ${activeNode ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}
            >
              <div
                className="border border-white/5 bg-black/60 backdrop-blur-xl rounded-lg p-6 space-y-5"
                style={{
                  boxShadow:
                    "0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {activeNode === "SKILLS" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 uppercase">
                        System.Augmentations
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                        ACTIVE
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-cyan-500/40 via-cyan-500/10 to-transparent mb-4" />
                    <AugmentationBar
                      name="REACT_CORE"
                      level={95}
                      colorClass="bg-cyan-400"
                    />
                    <AugmentationBar
                      name="NEXT.JS_FRAMEWORK"
                      level={88}
                      colorClass="bg-cyan-400"
                    />
                    <AugmentationBar
                      name="TAILWIND_CSS"
                      level={98}
                      colorClass="bg-cyan-400"
                    />
                  </>
                )}
                {activeNode === "BIOMETRICS" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-pink-400 uppercase">
                        Biometric.Readout
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-pink-500/30 text-pink-400 bg-pink-500/10">
                        VERIFIED
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-pink-500/40 via-pink-500/10 to-transparent mb-4" />
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; DESIGNATION
                        </span>
                        <span className="text-white font-medium">
                          Muhammad Wasay
                        </span>
                      </div>
                      <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; CLASS
                        </span>
                        <span className="text-white font-medium">
                          Full-Stack Engineer
                        </span>
                      </div>
                      <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; SPECIALIZATION
                        </span>
                        <span className="text-white font-medium">
                          Frontend Architecture
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {activeNode === "DIRECTIVES" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-yellow-400 uppercase">
                        Core.Directives
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                        ARMED
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-yellow-500/40 via-yellow-500/10 to-transparent mb-4" />
                    <div className="space-y-4 font-mono text-xs leading-relaxed">
                      <div className="flex gap-3 items-start">
                        <span className="text-yellow-500/80 shrink-0 mt-0.5">
                          01
                        </span>
                        <div>
                          <span className="text-white font-bold block mb-1">
                            INTERFACE_SYNTHESIS
                          </span>
                          <span className="text-yellow-500/50">
                            Architecting high-performance, immersive web
                            applications.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-yellow-500/80 shrink-0 mt-0.5">
                          02
                        </span>
                        <div>
                          <span className="text-white font-bold block mb-1">
                            PERFORMANCE_OPTIMIZATION
                          </span>
                          <span className="text-yellow-500/50">
                            Maximizing frame rates and minimizing latency.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CENTER — reserved for hologram */}
            <div className="hidden md:block w-[30%]" />

            {/* RIGHT PANEL */}
            <div
              className={`w-full md:w-[35%] pointer-events-auto transition-all duration-700 delay-100 ${activeNode ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
            >
              <div
                className="border border-white/5 bg-black/60 backdrop-blur-xl rounded-lg p-6 space-y-5"
                style={{
                  boxShadow:
                    "0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {activeNode === "SKILLS" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-cyan-400/60 uppercase">
                        Extended.Modules
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-cyan-500/20 to-transparent mb-4" />
                    <AugmentationBar
                      name="NODE.JS_RUNTIME"
                      level={85}
                      colorClass="bg-cyan-400"
                    />
                    <AugmentationBar
                      name="THREE.JS_WEBGL"
                      level={75}
                      colorClass="bg-cyan-400"
                    />
                    <AugmentationBar
                      name="UI_UX_ARCHITECTURE"
                      level={90}
                      colorClass="bg-cyan-400"
                    />
                  </>
                )}
                {activeNode === "BIOMETRICS" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-pink-400/60 uppercase">
                        System.Vitals
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-pink-500/20 to-transparent mb-4" />
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; NEURAL_UPTIME
                        </span>
                        <span className="text-white font-medium">
                          5+ Years Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; PROJECTS
                        </span>
                        <span className="text-white font-medium">
                          30+ Deployed
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-pink-500/60 text-xs w-28 shrink-0">
                          &gt; STATUS
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400 font-medium">
                            OPTIMAL
                          </span>
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {activeNode === "DIRECTIVES" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-yellow-400/60 uppercase">
                        Sub.Protocols
                      </span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-yellow-500/20 to-transparent mb-4" />
                    <div className="space-y-4 font-mono text-xs leading-relaxed">
                      <div className="flex gap-3 items-start">
                        <span className="text-yellow-500/80 shrink-0 mt-0.5">
                          03
                        </span>
                        <div>
                          <span className="text-white font-bold block mb-1">
                            AESTHETIC_INTEGRITY
                          </span>
                          <span className="text-yellow-500/50">
                            Upholding strict visual standards across every
                            pixel.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-yellow-500/80 shrink-0 mt-0.5">
                          04
                        </span>
                        <div>
                          <span className="text-white font-bold block mb-1">
                            CONTINUOUS_EVOLUTION
                          </span>
                          <span className="text-yellow-500/50">
                            Perpetual learning. Adapting to emerging
                            technologies.
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click-anywhere hint */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[65] font-mono text-[10px] tracking-[0.3em] text-white/20 transition-all duration-700 ${activeNode ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          CLICK ANYWHERE TO CLOSE
        </div>
      </section>
    </>
  );
};

export default AboutSection;
