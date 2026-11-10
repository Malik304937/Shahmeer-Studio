import React, { useState } from 'react';
import { Instagram, ExternalLink, Check, Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';

export const InstagramContact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyHandle = () => {
    navigator.clipboard.writeText('@shahmeer.studio');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#D4AF37]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#141414] via-[#101010] to-[#0a0a0a] p-8 sm:p-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
          {/* Subtle gold corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-tr-full pointer-events-none" />

          {/* Studio Emblem Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#D4AF37]/60 p-1 bg-[#0a0a0a] shadow-[0_0_35px_rgba(212,175,55,0.3)] mb-6">
            <img
              src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
              alt="Shahmeer Studio Emblem"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="inline-flex items-center space-x-2 text-xs font-mono-accent uppercase tracking-[0.3em] text-[#D4AF37] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Studio Inquiries</span>
          </div>

          {/* Heading */}
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.05em] text-white mb-5 leading-tight">
            LET&apos;S CREATE SOMETHING AMAZING.
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-light">
            Need a professional logo, T-shirt design, poster or custom artwork? Contact Shahmeer Studio directly on Instagram.
          </p>

          {/* Instagram Username Pill with Copy */}
          <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-[#171717] border border-[#D4AF37]/30 mb-10">
            <span className="text-xs uppercase tracking-wider text-gray-400">Instagram Handle:</span>
            <span className="font-mono-accent text-sm font-bold text-[#F5D77F]">
              @shahmeer.studio
            </span>
            <button
              onClick={handleCopyHandle}
              className="ml-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Copy handle"
            >
              {copied ? (
                <span className="text-green-400 flex items-center space-x-1 text-[11px]">
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </span>
              ) : (
                <span className="underline underline-offset-2 text-[11px]">Copy</span>
              )}
            </button>
          </div>

          {/* Action Buttons: "DM FOR CUSTOM DESIGN" & "ORDER YOUR DESIGN" */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/shahmeer.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.7)] transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>DM FOR CUSTOM DESIGN</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>

            <a
              href="https://www.instagram.com/shahmeer.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full border border-[#D4AF37] hover:bg-[#D4AF37]/15 text-[#F5D77F] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <span>ORDER YOUR DESIGN</span>
            </a>
          </div>

          {/* Response Time Guarantee */}
          <div className="mt-8 text-xs text-gray-500 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active for custom commissions &amp; collaborations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
