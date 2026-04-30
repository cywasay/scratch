"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useInView } from "framer-motion";

const GlitchedSkull = dynamic(() => import("./IsoGlitch"), {
  ssr: false,
  loading: () => null,
});

// --- NEW: Glitch Burst Overlay Component ---
const GlitchBurst = ({ trigger }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.8, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, times: [0, 0.1, 0.3, 0.5, 1] }}
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen animate-pulse" />
          <div className="absolute inset-0 bg-magenta-500/10 mix-blend-multiply" />
          <div className="absolute inset-0 opacity-40 bg-[url('https://media.giphy.com/media/oEI9uWUicGPoY/giphy.gif')] bg-cover mix-blend-overlay scale-110" />
          <div className="absolute top-1/4 w-full h-[2px] bg-white/50 shadow-[0_0_15px_white] animate-hologram-tear" />
          <div className="absolute top-2/3 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_10px_cyan] animate-hologram-tear [animation-delay:0.2s]" />
          <div className="absolute inset-0 bg-white opacity-10 animate-hologram-flicker" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- 1. Holographic Dropdown Panel Component ---
const HoloPanel = ({
  title,
  id,
  side = "left",
  isOpen,
  onToggle,
  delay = 2,
  children,
}) => {
  const [hexCode, setHexCode] = useState("0x0000");

  useEffect(() => {
    // Generate random hex only on client to avoid hydration mismatch
    setHexCode(`0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0")}`);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -100 : 100, filter: "blur(20px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] }}
      className={`absolute top-[20%] ${side === "left" ? "left-[5%]" : "right-[5%]"} z-50 w-80 md:w-96 pointer-events-auto`}
    >
      <div className="w-full flex justify-between items-end mb-1 px-1">
        <span className="font-mono text-[8px] tracking-[0.3em] text-green-500/40">
          [{id}] // SEC_NODE
        </span>
        <div className="flex gap-2 font-mono text-[7px] text-green-500/20">
          <span>HEX:{hexCode}</span>
          <span>LAT:0.02ms</span>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 px-4 py-2 bg-[#001510]/90 backdrop-blur-md border border-green-500/30 hover:border-green-400 transition-all group relative overflow-hidden h-12`}
      >
        <div
          className={`transition-all duration-500 bg-green-500 ${
            isOpen
              ? "w-1 h-8 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
              : "w-[2px] h-5 opacity-40"
          }`}
        />
        <div className="flex flex-col items-start flex-1 relative z-10">
          <span className="font-mono text-sm font-black tracking-[0.2em] text-green-400 group-hover:text-white transition-colors">
            {title}
          </span>
          <span className="font-mono text-[7px] tracking-widest text-green-500/40 uppercase">
            System_Uplink_Established
          </span>
        </div>
        <div className="font-mono text-[9px] text-green-500/30 group-hover:text-green-400 transition-all transform group-hover:scale-110">
          {isOpen ? "[ CLOSE ]" : "[ EXPAND ]"}
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-green-400/20 animate-hologram-scan" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="overflow-hidden border-x border-b border-green-500/30 bg-[#000d0a]/95 backdrop-blur-2xl relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 opacity-[0.03] bg-green-500 animate-hologram-flicker" />
              <div
                className="absolute inset-0"
                style={{
                  background: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0, 255, 65, 0.05) 1px, rgba(0, 255, 65, 0.05) 2px)",
                  backgroundSize: "100% 3px",
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,255,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.1) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
            <div className="p-6 relative z-10 space-y-6">
              {children}
            </div>
            <div className="px-6 py-2 border-t border-green-500/10 flex justify-between font-mono text-[7px] text-green-500/20 tracking-[0.3em] uppercase">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 animate-pulse" />
                Dta_Stream_OK
              </span>
              <span>Enc:AES-256</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AugmentationBar = ({ name, level, colorClass }) => {
  return (
    <div className="flex flex-col gap-2 w-full group/bar">
      <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-green-500/60 group-hover/bar:text-green-400 transition-colors">
        <span>{name}</span>
        <span className="font-bold text-white/40 group-hover/bar:text-white transition-colors">{level}%</span>
      </div>
      <div className="w-full h-1.5 bg-green-900/30 overflow-hidden relative border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className={`h-full ${colorClass} relative`}
        >
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

const AboutSection = () => {
  const [openPanels, setOpenPanels] = useState({ bio: false, skills: false });
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1, once: false });
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimatedIn) {
      setGlitchTrigger(true);
      const timer = setTimeout(() => {
        setHasAnimatedIn(true);
      }, 600);
      return () => clearTimeout(timer);
    } else if (!isInView) {
      setHasAnimatedIn(false);
      setGlitchTrigger(false);
    }
  }, [isInView, hasAnimatedIn]);

  const togglePanel = (panel) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  return (
    <>
      <style>{`
        @keyframes hologram-scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes hologram-flicker {
          0% { opacity: 0.1; }
          30% { opacity: 0.05; }
          70% { opacity: 0.15; }
          100% { opacity: 0.1; }
        }
        @keyframes hologram-tear {
          0% { transform: translateX(0) scaleY(1); opacity: 0; }
          10% { transform: translateX(-5%) scaleY(1.2); opacity: 1; }
          20% { transform: translateX(5%) scaleY(0.8); opacity: 0.8; }
          30% { transform: translateX(0) scaleY(1); opacity: 0; }
          100% { transform: translateX(0); opacity: 0; }
        }
        .animate-hologram-scan { animation: hologram-scan 3s linear infinite; }
        .animate-hologram-flicker { animation: hologram-flicker 0.1s steps(2) infinite; }
        .animate-hologram-tear { animation: hologram-tear 0.4s steps(2) infinite; }
      `}</style>

      <GlitchBurst trigger={glitchTrigger} />

      <section
        ref={sectionRef}
        id="about"
        className="relative min-h-screen w-full flex items-center justify-center z-10 overflow-hidden"
      >
        <motion.div
          animate={glitchTrigger ? { x: [0, -20, 20, 0], filter: ["blur(0px)", "blur(20px)", "blur(0px)"] } : {}}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[120px] z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-green-900/10 rounded-full blur-[150px] z-0" />
        </motion.div>

        <GlitchedSkull isPushed={openPanels.bio || openPanels.skills} />

        {hasAnimatedIn && (
          <>
            <HoloPanel
              title="BIO_METRICS"
              id="01"
              side="left"
              isOpen={openPanels.bio}
              onToggle={() => togglePanel("bio")}
              delay={0}
            >
              <div className="space-y-5 font-mono text-[11px] leading-relaxed">
                <div className="flex flex-col gap-1 border-l-2 border-green-500/20 pl-3">
                  <span className="text-green-500/40 text-[8px] tracking-[0.3em] uppercase">User_Designation</span>
                  <span className="text-white font-black text-lg tracking-tight">MUHAMMAD WASAY</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-green-500/20 pl-3">
                  <span className="text-green-500/40 text-[8px] tracking-[0.3em] uppercase">Primary_Class</span>
                  <span className="text-green-400 font-medium">FULL-STACK_ARCHITECT // 3D_VISUALIZER</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-green-500/20 to-transparent" />
                <div className="bg-white/5 p-3 rounded-sm border border-white/5 italic text-green-500/80">
                  "Engineering high-performance digital interfaces where precision logic meets immersive visual aesthetics."
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[9px] text-green-500/40">
                  <div className="flex flex-col">
                    <span className="uppercase text-[7px] mb-0.5">Location</span>
                    <span className="text-white/60">DUBAI, UAE [UTC+4]</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-[7px] mb-0.5">Status</span>
                    <span className="text-green-400">AVAILABLE_FOR_LINK</span>
                  </div>
                </div>
              </div>
            </HoloPanel>

            <HoloPanel
              title="AUGMENTATIONS"
              id="02"
              side="right"
              isOpen={openPanels.skills}
              onToggle={() => togglePanel("skills")}
              delay={0.15}
            >
              <div className="space-y-5">
                <AugmentationBar name="REACT_ENGINE" level={95} colorClass="bg-green-400" />
                <AugmentationBar name="WEBGL_GRAPHICS" level={88} colorClass="bg-cyan-400" />
                <AugmentationBar name="SYSTEM_ARCH" level={82} colorClass="bg-green-500" />
                <AugmentationBar name="HOLOGRAPHIC_UI" level={92} colorClass="bg-green-400" />
                
                <div className="mt-4 pt-4 border-t border-green-500/20 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 group/mod">
                    <div className="w-1 h-1 bg-green-500 shadow-[0_0_5px_currentColor] animate-pulse" />
                    <span className="font-mono text-[8px] text-green-500/60 uppercase group-hover/mod:text-white transition-colors">Tailwind_v4</span>
                  </div>
                  <div className="flex items-center gap-2 group/mod">
                    <div className="w-1 h-1 bg-cyan-400 shadow-[0_0_5px_currentColor] animate-pulse" />
                    <span className="font-mono text-[8px] text-cyan-400/60 uppercase group-hover/mod:text-white transition-colors">Next.js_15</span>
                  </div>
                  <div className="flex items-center gap-2 group/mod">
                    <div className="w-1 h-1 bg-green-500 shadow-[0_0_5px_currentColor] animate-pulse" />
                    <span className="font-mono text-[8px] text-green-500/60 uppercase group-hover/mod:text-white transition-colors">Three.js</span>
                  </div>
                  <div className="flex items-center gap-2 group/mod">
                    <div className="w-1 h-1 bg-yellow-400 shadow-[0_0_5px_currentColor] animate-pulse" />
                    <span className="font-mono text-[8px] text-yellow-400/60 uppercase group-hover/mod:text-white transition-colors">Framr_Motion</span>
                  </div>
                </div>
              </div>
            </HoloPanel>
          </>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.4em] text-green-500/10 uppercase animate-pulse pointer-events-none">
          Sector_02 // Terminal_Active
        </div>
      </section>
    </>
  );
};

export default AboutSection;
