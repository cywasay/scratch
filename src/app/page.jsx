"use client";

import { useState } from "react";
import MatrixBackground from "@/components/MatrixBackground";
import SiteLoader from "@/components/SiteLoader";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";
import NeuralArchive from "@/components/NeuralArchive";
import CrackedGlass from "@/components/CrackedGlass";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      {loading && <SiteLoader onComplete={() => setLoading(false)} />}

      {/* 3D Perspective Container */}
      <div
        style={{
          perspective: "900px",
          perspectiveOrigin: "75% 50%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <main
          className="relative w-full flex flex-col overflow-y-auto overflow-x-hidden h-full scroll-smooth"
          style={{
            transformStyle: "preserve-3d",
            transform: navOpen
              ? "translateX(-180px) translateZ(-280px) rotateY(14deg)"
              : "translateX(0) translateZ(0) rotateY(0deg)",
            transformOrigin: "right center",
            transition:
              "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1), filter 0.8s ease",
            filter: navOpen ? "saturate(0.3)" : "saturate(1)",
            willChange: "transform, filter",
          }}
        >
          <MatrixBackground />

          <div style={{ contentVisibility: "auto" }}>
            <HeroSection />
          </div>
          <div style={{ contentVisibility: "auto" }}>
            <AboutSection />
          </div>
          <div style={{ contentVisibility: "auto" }}>
            <NeuralArchive />
          </div>
          <div style={{ contentVisibility: "auto" }}>
            <CrackedGlass />
          </div>

          <div className="fixed bottom-10 left-10 z-10 font-mono text-[10px] text-green-900 uppercase pointer-events-none">
            Terminal ID: 882-AG-BETA
          </div>

          {/* ===== HOLOGRAM COMPOSITE OVERLAY ===== */}
          <div
            className="fixed inset-0 pointer-events-none z-30"
            style={{
              opacity: navOpen ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}
          >
            {/* Layer 1: Holographic Glow & Scanlines (Combined) */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(160deg, rgba(0,180,255,0.1) 0%, rgba(0,255,200,0.05) 50%, rgba(0,80,255,0.08) 100%),
                  repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0, 0, 0, 0.1) 1px, rgba(0, 0, 0, 0.1) 2px)
                `,
              }}
            />

            {/* Layer 2: Bright scan beam sweeping down */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute left-0 w-full"
                style={{
                  height: "120px",
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0,220,255,0.05) 30%, rgba(0,255,200,0.1) 50%, rgba(0,220,255,0.05) 70%, transparent 100%)",
                  animation: "hologram-scan 3s linear infinite",
                  willChange: "top",
                }}
              />
            </div>

            {/* Layer 3: Edge & Bottom Projection Glows (Combined) */}
            <div
              className="absolute inset-0"
              style={{
                border: "1px solid rgba(0, 200, 255, 0.15)",
                boxShadow: `
                  inset 0 0 60px rgba(0, 180, 255, 0.05),
                  0 0 30px rgba(0, 200, 255, 0.08)
                `,
                background:
                  "linear-gradient(to left, rgba(0, 220, 255, 0.1), transparent 30%), linear-gradient(to top, rgba(0, 200, 255, 0.05), transparent 20%)",
              }}
            />

            {/* Layer 4: Minimal Flicker */}
            <div
              className="absolute inset-0 bg-black/10"
              style={{
                animation: "hologram-flicker 0.2s steps(2) infinite",
              }}
            />
          </div>
        </main>
      </div>

      <Navigation
        isVisible={!loading}
        isOpen={navOpen}
        setIsOpen={setNavOpen}
      />
    </>
  );
}
