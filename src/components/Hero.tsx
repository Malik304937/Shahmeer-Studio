import React, { useState } from 'react';
import { ArrowDown, ExternalLink, Sparkles, Instagram, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Dynamic mouse spotlight glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(212, 175, 55, 0.12), transparent 70%)`,
        }}
      />

      {/* Decorative ambient background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-32 right-10 w-96 h-96 bg-[#9A7415]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Luxury studio pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border border-[#D4AF37]/35 bg-[#121212]/80 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-in fade-in duration-700">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[11px] sm:text-xs font-mono-accent uppercase tracking-[0.25em] text-[#F5D77F] font-medium">
            SHAHMEER STUDIO &bull; OFFICIAL PORTFOLIO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        </div>

        {/* Official Royal Gold Studio Emblem */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full border-2 border-[#D4AF37] p-1 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-[0_0_40px_rgba(212,175,55,0.35)] relative group">
            <img
              src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
              alt="Shahmeer Studio Royal Emblem"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -inset-1.5 rounded-full border border-[#D4AF37]/30 border-dashed animate-spin [animation-duration:40s]" />
          </div>
        </div>

        {/* Logo Text */}
        <h2 className="font-serif-luxury text-xs sm:text-sm uppercase tracking-[0.45em] text-[#D4AF37] font-semibold mb-3">
          SHAHMEER STUDIO
        </h2>

        {/* Main Heading */}
        <h1 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.05em] text-white leading-[1.1] mb-6 max-w-4xl text-balance">
          DESIGN THAT <br className="hidden sm:inline" />
          <span className="text-gold-shimmer">MAKES YOU DIFFERENT.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-[#B3B3B3] max-w-2xl mx-auto leading-relaxed font-light mb-10 text-balance">
          Welcome to Shahmeer Studio. Explore creative artwork, professional graphic designs and unique visual identities.
        </p>

        {/* Buttons: EXPLORE MY WORK, CONTACT ON INSTAGRAM, ORDER YOUR DESIGN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {/* Button 1: EXPLORE MY WORK */}
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-bold text-xs uppercase tracking-[0.18em] shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>EXPLORE MY WORK</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>

          {/* Button 2: CONTACT ON INSTAGRAM */}
          <a
            href="https://www.instagram.com/shahmeer.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-full border border-[#D4AF37]/70 hover:border-[#D4AF37] bg-[#121212]/90 hover:bg-[#181818] text-[#F5F5F5] hover:text-[#F5D77F] font-semibold text-xs uppercase tracking-[0.18em] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer group"
          >
            <Instagram className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>CONTACT ON INSTAGRAM</span>
            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
          </a>

          {/* Button 3: ORDER YOUR DESIGN */}
          <a
            href="https://www.instagram.com/shahmeer.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#171717] hover:bg-[#202020] text-[#D4AF37] hover:text-white font-semibold text-xs uppercase tracking-[0.18em] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer group"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>ORDER YOUR DESIGN</span>
          </a>
        </div>

        {/* Subtle trust badge */}
        <div className="mt-14 pt-8 border-t border-[#D4AF37]/15 flex items-center justify-center space-x-6 text-gray-400 text-xs tracking-wider uppercase">
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Bespoke Visual Identity</span>
          </span>
          <span className="hidden sm:inline-block text-[#D4AF37]/40">&bull;</span>
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Custom Apparel &amp; Logos</span>
          </span>
          <span className="hidden sm:inline-block text-[#D4AF37]/40">&bull;</span>
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Original Art Direction</span>
          </span>
        </div>
      </div>
    </section>
  );
};
