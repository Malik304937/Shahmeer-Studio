import React from 'react';
import { ArrowUp, Instagram, Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'portfolio' | 'admin', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050505] border-t border-[#D4AF37]/20 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info with Royal Emblem */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border border-[#D4AF37]/60 p-0.5 bg-[#121212] overflow-hidden">
                <img
                  src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
                  alt="Shahmeer Studio Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-serif-luxury text-base tracking-[0.2em] font-bold text-white block">
                  SHAHMEER STUDIO
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/90 font-mono-accent block">
                  Create &bull; Inspire &bull; Explore
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              A private design atelier specializing in bespoke logo marks, apparel graphics, editorial posters, and unique visual identities.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.instagram.com/shahmeer.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#121212] hover:bg-[#181818] text-xs text-[#F5D77F] transition-all"
              >
                <Instagram className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>@shahmeer.studio</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-mono-accent uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('portfolio', 'home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio', 'portfolio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Portfolio Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio', 'about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio', 'contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Instagram Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Admin & Legal */}
          <div>
            <h4 className="text-xs font-mono-accent uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-4">
              Studio Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center space-x-1.5 text-[#D4AF37] hover:underline transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel Login</span>
                </button>
              </li>
              <li className="text-[11px] text-gray-500">
                Direct client inquiries via Instagram DM
              </li>
              <li className="text-[11px] text-gray-500">
                Original Artwork &copy; {new Date().getFullYear()}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} SHAHMEER STUDIO. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
