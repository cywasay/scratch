"use client";

import React, { useState, useEffect } from "react";

// Varied navigation items with unique colors, sub-labels, and mock data
const navLinks = [
  { id: "00", label: "ROOT", subLabel: "SYSTEM_CORE_ACCESS", colorClass: "text-green-400", borderClass: "border-green-400", bgClass: "bg-green-400", hex: "0x00A1", ping: "12ms" },
  { id: "01", label: "SYS_ARCHIVE", subLabel: "PROJECT_VAULT_DATA", colorClass: "text-cyan-400", borderClass: "border-cyan-400", bgClass: "bg-cyan-400", hex: "0xB4F2", ping: "45ms" },
  { id: "02", label: "NEURAL_NET", subLabel: "BIO_SYNC_METRICS", colorClass: "text-pink-500", borderClass: "border-pink-500", bgClass: "bg-pink-500", hex: "0xC99D", ping: "08ms" },
  { id: "03", label: "UPLINK", subLabel: "EXTERNAL_COMMS", colorClass: "text-yellow-400", borderClass: "border-yellow-400", bgClass: "bg-yellow-400", hex: "0xF1E4", ping: "120ms" },
];

const NavItem = ({ id, label, subLabel, colorClass, borderClass, bgClass, hex, ping, active, onClick, delayIndex, isOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(label);
  const chars = "01!@#$%&ABCDEF";

  useEffect(() => {
    let interval;
    if (isHovered || (isOpen && displayText !== label)) {
      let ticks = 0;
      interval = setInterval(() => {
        setDisplayText(
          label.split("").map((c, i) => {
            if (ticks > 6 && Math.random() > 0.5) return c;
            if (ticks > 12) return c;
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
        );
        ticks++;
        if (ticks > 15) {
          clearInterval(interval);
          setDisplayText(label);
        }
      }, 30);
    } else {
      setDisplayText(label);
    }
    return () => clearInterval(interval);
  }, [isHovered, isOpen, label]);

  return (
    <a
      href={`#${label.toLowerCase()}`}
      onClick={(e) => { 
        e.preventDefault(); 
        onClick(); 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col items-start cursor-pointer w-full transition-all duration-700 ease-out transform ${
        isOpen ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
      }`}
      style={{ transitionDelay: `${isOpen ? delayIndex * 100 + 150 : 0}ms` }}
    >
      {/* Active / Hover Background Panel */}
      <div 
        className={`absolute inset-0 -left-4 -right-4 rounded-sm transition-all duration-300 pointer-events-none z-0 ${
          active ? "bg-white/[0.03]" : isHovered ? "bg-white/[0.02]" : "bg-transparent"
        }`} 
      />

      {/* Top Metadata Row */}
      <div className="w-full flex justify-between items-end mb-1 relative z-10">
        <span className={`font-mono text-[9px] tracking-widest transition-colors duration-300 ${active ? colorClass : "text-green-900/60 group-hover:text-white"}`}>
          [{id}]
        </span>
        <div className="flex gap-3 font-mono text-[8px] text-green-900/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>ADDR:{hex}</span>
          <span>PING:{ping}</span>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 relative z-10">
        {/* Colorful Indicator Bar */}
        <div 
          className={`transition-all duration-300 ${bgClass} ${
            active ? "w-1 h-8 opacity-100 shadow-[0_0_8px_currentColor]" : isHovered ? "w-0.5 h-6 opacity-80" : "w-[1px] h-4 opacity-30"
          }`}
        />

        <div className="flex flex-col flex-1">
          {/* Main Label */}
          <span 
            className={`font-mono text-xl font-black tracking-widest transition-all duration-300 ${
              active ? `text-white text-shadow-glow` : isHovered ? colorClass : "text-green-600/70"
            }`}
            style={{ textShadow: active ? "0 0 10px rgba(255,255,255,0.4)" : "none" }}
          >
            {displayText}
          </span>
          
          {/* Secondary Sub-Label */}
          <span className={`font-mono text-[8px] tracking-[0.2em] transition-all duration-300 ${active ? colorClass : "text-green-900/40 group-hover:text-green-500/80"}`}>
            {subLabel}
          </span>
        </div>
      </div>

      {/* Bottom Border Line - Visible on Active */}
      <div 
        className={`mt-2 h-[1px] transition-all duration-500 ${bgClass} ${
          active ? "w-full opacity-30" : "w-0 opacity-0"
        }`} 
      />
    </a>
  );
};

const Navigation = ({ isVisible, isOpen, setIsOpen }) => {
  const [activeId, setActiveId] = useState("00");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  return (
    <>
      {/* Sleek Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed top-8 right-8 z-40 font-mono flex items-center gap-3 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-green-500/20 text-green-500 hover:text-white hover:border-green-400 hover:bg-green-500/20 transition-all duration-300 group ${
          isVisible && !isOpen ? "opacity-100 translate-y-0 delay-300" : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-[3px] opacity-70 group-hover:opacity-100">
          <div className="w-4 h-[1px] bg-current" />
          <div className="w-3 h-[1px] bg-current" />
          <div className="w-2 h-[1px] bg-current group-hover:w-4 transition-all" />
        </div>
        <span className="text-[10px] tracking-widest uppercase">NAV</span>
      </button>

      {/* Backdrop — no blur here since page.jsx handles the visual push */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Holographic Slim Sidebar */}
      <nav 
        className={`fixed top-0 right-0 h-full w-72 bg-[#001510]/80 backdrop-blur-md border-l border-green-400/30 shadow-[-20px_0_60px_rgba(0,255,200,0.15)] z-50 flex flex-col justify-center px-8 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: "inset 40px 0 100px rgba(0, 200, 255, 0.05), -5px 0 30px rgba(0, 255, 100, 0.1)"
        }}
      >
        {/* === SIDEBAR HOLOGRAM OVERLAYS === */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Cyan color wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-green-500/10 mix-blend-screen" />
          
          {/* Dense CRT scanlines */}
          <div 
            className="absolute inset-0" 
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 1px,
                rgba(0, 0, 0, 0.2) 1px,
                rgba(0, 0, 0, 0.2) 2px
              )`
            }} 
          />
          
          {/* Moving scan beam */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute left-0 w-full h-32"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(0,255,200,0.1), transparent)",
                animation: "hologram-scan 3s linear infinite",
              }}
            />
          </div>

          {/* Holographic grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,100,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,100,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px"
            }}
          />

          {/* Flicker */}
          <div className="absolute inset-0 bg-black" style={{ animation: "hologram-flicker 0.15s steps(3) infinite" }} />
          
          {/* Glitch Tear */}
          <div 
            className="absolute left-0 w-full h-[2px] bg-cyan-400/40 shadow-[0_0_8px_rgba(0,255,200,0.5)]" 
            style={{ animation: "hologram-tear 3s steps(1) infinite" }} 
          />
        </div>

        {/* Architectural Background Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] z-0">
           <div className="absolute left-6 w-[1px] h-full bg-cyan-500" />
           <div className="absolute right-6 w-[1px] h-full bg-cyan-500" />
           <div className="absolute top-20 w-full h-[1px] bg-cyan-500" />
           <div className="absolute bottom-20 w-full h-[1px] bg-cyan-500" />
        </div>

        {/* Close Button & Header */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center border-b border-green-500/10 pb-2">
          <div className="font-mono text-[9px] text-green-500/60 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            SYS.NODE_882
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-green-600/50 hover:text-white hover:scale-110 font-mono text-xs transition-all"
          >
            [X]
          </button>
        </div>

        {/* Varied Links Container */}
        <div className="flex flex-col gap-6 relative z-20">
          {navLinks.map((link, index) => (
            <NavItem 
              key={link.id} 
              {...link} 
              active={activeId === link.id}
              isOpen={isOpen}
              delayIndex={index}
              onClick={() => {
                setActiveId(link.id);
                setTimeout(() => setIsOpen(false), 300);
              }}
            />
          ))}
        </div>

        {/* Complex Footer Data */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between border-t border-green-500/10 pt-2 font-mono text-[8px] text-green-900/50 uppercase tracking-widest">
          <span>MEM: 16.4TB</span>
          <span className="animate-pulse text-green-500/40">SEC: ACTIVE</span>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
