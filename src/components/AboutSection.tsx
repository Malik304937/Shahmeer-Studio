import React from 'react';
import { Sparkles, Palette, Shirt, Layers, Compass, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: Palette,
      title: 'Brand & Logo Identity',
      desc: 'Distinctive, memorable emblems and typography systems built to elevate brands across all mediums.',
    },
    {
      icon: Shirt,
      title: 'Apparel & Merch Graphics',
      desc: 'High-impact streetwear, screen-print, and DTG graphic illustrations tailored for fashion labels.',
    },
    {
      icon: Layers,
      title: 'Editorial & Event Posters',
      desc: 'Sophisticated typography, spatial balance, and visual hierarchy for print and digital exhibition.',
    },
    {
      icon: Compass,
      title: 'Original Art Direction',
      desc: 'Uncompromising creative visions from initial sketch to production-ready master assets.',
    },
  ];

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
      {/* Decorative Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Crest & Brand Statement */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl p-8 bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-[#D4AF37]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden text-center sm:text-left">
              {/* Gold Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/60 p-1 bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(212,175,55,0.25)] mx-auto sm:mx-0">
                <img
                  src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
                  alt="Shahmeer Studio Royal Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="inline-block text-[11px] font-mono-accent uppercase tracking-[0.25em] text-[#D4AF37] mb-3">
                Creative Design Studio
              </div>

              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                Where originality meets uncompromising craft.
              </h3>

              <div className="space-y-3 pt-4 border-t border-[#D4AF37]/15 text-left">
                <div className="flex items-center space-x-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>100% Original Vector &amp; Raster Artwork</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Tailored for Screen Print, Digital, and Web</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Direct Communication with the Designer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Required Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center space-x-2 text-xs font-mono-accent uppercase tracking-[0.3em] text-[#D4AF37] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identity &amp; Philosophy</span>
            </div>

            {/* Required Title */}
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.05em] text-white mb-6">
              ABOUT <span className="text-gold-gradient">SHAHMEER STUDIO</span>
            </h2>

            {/* Required Description */}
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-10 font-light text-balance">
              Shahmeer Studio is a creative design portfolio showcasing unique visual concepts, graphic artwork and creative projects. Every design represents creativity, detail and originality.
            </p>

            {/* Specialty Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#121212]/70 border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {p.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
