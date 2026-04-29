"use client";

import { useState } from "react";
import MatrixBackground from "@/components/MatrixBackground";
import SiteLoader from "@/components/SiteLoader";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";

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
          overflow: "hidden", // Disable scroll here if we want a single view, but we want scrolling
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
            transition: "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1), filter 0.8s ease",
            filter: navOpen ? "saturate(0.3)" : "saturate(1)",
          }}
        >
          <MatrixBackground />
          
          <HeroSection />
          <AboutSection />

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
            {/* Layer 1: Deep cyan/blue tint — the "holographic" color */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(160deg, rgba(0,180,255,0.18) 0%, rgba(0,255,200,0.08) 40%, rgba(0,80,255,0.12) 100%)",
                mixBlendMode: "screen",
              }}
            />

            {/* Layer 2: Dense CRT scanlines */}
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(0, 0, 0, 0.12) 1px,
                  rgba(0, 0, 0, 0.12) 2px
                )`,
              }}
            />

            {/* Layer 3: Bright scan beam sweeping down */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute left-0 w-full"
                style={{
                  height: "120px",
                  background: "linear-gradient(to bottom, transparent 0%, rgba(0,220,255,0.08) 30%, rgba(0,255,200,0.12) 50%, rgba(0,220,255,0.08) 70%, transparent 100%)",
                  animation: "hologram-scan 2.5s linear infinite",
                  boxShadow: "0 0 40px 20px rgba(0,220,255,0.03)",
                }}
              />
            </div>

            {/* Layer 4: Noise / static grain texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                opacity: 0.6,
                mixBlendMode: "overlay",
              }}
            />

            {/* Layer 5: Chromatic aberration edges + inner glow */}
            <div
              className="absolute inset-0"
              style={{
                border: "1px solid rgba(0, 200, 255, 0.25)",
                boxShadow: `
                  inset 0 0 80px rgba(0, 180, 255, 0.06),
                  inset 0 0 200px rgba(0, 100, 255, 0.03),
                  0 0 40px rgba(0, 200, 255, 0.1),
                  0 0 80px rgba(0, 100, 255, 0.05),
                  -3px 0 0 rgba(255, 0, 80, 0.08),
                  3px 0 0 rgba(0, 200, 255, 0.08)
                `,
              }}
            />

            {/* Layer 6: Edge bloom — right side projection source */}
            <div
              className="absolute top-0 right-0 h-full"
              style={{
                width: "25%",
                background: "linear-gradient(to left, rgba(0, 220, 255, 0.15), rgba(0, 180, 255, 0.05) 40%, transparent)",
              }}
            />

            {/* Layer 7: Bottom projection base */}
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{
                height: "30%",
                background: "linear-gradient(to top, rgba(0, 200, 255, 0.1), transparent)",
              }}
            />

            {/* Layer 8: Flicker — fast, subtle opacity jitter */}
            <div
              className="absolute inset-0 bg-black"
              style={{
                animation: "hologram-flicker 0.12s steps(3) infinite",
              }}
            />

            {/* Layer 9: Occasional horizontal glitch tear */}
            <div
              className="absolute left-0 w-full"
              style={{
                height: "3px",
                background: "rgba(0, 255, 200, 0.3)",
                boxShadow: "0 0 10px rgba(0, 255, 200, 0.2)",
                animation: "hologram-tear 4s steps(1) infinite",
              }}
            />

            {/* Layer 10: Subtle holographic grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        </main>
      </div>

      <Navigation isVisible={!loading} isOpen={navOpen} setIsOpen={setNavOpen} />
    </>
  );
}
