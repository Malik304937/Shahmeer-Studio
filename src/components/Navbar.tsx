import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, ExternalLink, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'portfolio' | 'admin';
  onNavigate: (view: 'portfolio' | 'admin', sectionId?: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate('portfolio', sectionId);
  };

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
    onNavigate('admin');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080808]/92 backdrop-blur-md border-b border-[#D4AF37]/20 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.85)]'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Studio Brand Logo with Royal Gold Emblem */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#D4AF37]/70 p-0.5 bg-[#0a0a0a] shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_22px_rgba(212,175,55,0.6)] group-hover:border-[#D4AF37] transition-all">
              <img
                src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
                alt="Shahmeer Studio Crest"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <span className="font-serif-luxury text-base sm:text-lg tracking-[0.2em] font-bold text-white group-hover:text-[#F5D77F] transition-colors block leading-tight">
                SHAHMEER STUDIO
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/90 block font-mono-accent">
                Create &bull; Inspire &bull; Explore
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#D4AF37] cursor-pointer ${
                currentView === 'portfolio' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('portfolio')}
              className="text-xs uppercase tracking-[0.2em] font-medium text-gray-300 transition-colors hover:text-[#D4AF37] cursor-pointer"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-xs uppercase tracking-[0.2em] font-medium text-gray-300 transition-colors hover:text-[#D4AF37] cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-xs uppercase tracking-[0.2em] font-medium text-gray-300 transition-colors hover:text-[#D4AF37] cursor-pointer"
            >
              Contact
            </button>

            {/* Admin Action */}
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-[#D4AF37]/20">
                <button
                  onClick={handleAdminClick}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Log out of Admin"
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminClick}
                className={`flex items-center space-x-1 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'text-[#D4AF37] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-3 h-3 text-[#D4AF37]/70" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Instagram CTA Button: Updated to @shahmeer.studio */}
            <a
              href="https://www.instagram.com/shahmeer.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-[#D4AF37] text-xs font-semibold uppercase tracking-wider text-[#080808] bg-gold-gradient hover:bg-gold-gradient-hover shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_22px_rgba(212,175,55,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>@shahmeer.studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <a
              href="https://www.instagram.com/shahmeer.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#D4AF37]"
              aria-label="Instagram Profile"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0c] border-b border-[#D4AF37]/30 px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-2 text-sm uppercase tracking-[0.2em] font-medium text-gray-200 hover:text-[#D4AF37] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('portfolio')}
              className="text-left py-2 text-sm uppercase tracking-[0.2em] font-medium text-gray-200 hover:text-[#D4AF37] transition-colors"
            >
              Portfolio Gallery
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 text-sm uppercase tracking-[0.2em] font-medium text-gray-200 hover:text-[#D4AF37] transition-colors"
            >
              About Studio
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 text-sm uppercase tracking-[0.2em] font-medium text-gray-200 hover:text-[#D4AF37] transition-colors"
            >
              Instagram Contact
            </button>

            <div className="pt-4 border-t border-[#D4AF37]/20 flex flex-col space-y-3">
              {isAdminLoggedIn ? (
                <>
                  <button
                    onClick={handleAdminClick}
                    className="flex items-center justify-between py-2 text-sm uppercase tracking-wider text-[#D4AF37] font-semibold"
                  >
                    <span className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center space-x-2 py-2 text-sm text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAdminClick}
                  className="flex items-center space-x-2 py-2 text-sm uppercase tracking-wider text-gray-400 hover:text-[#D4AF37]"
                >
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span>Admin Login</span>
                </button>
              )}

              <a
                href="https://www.instagram.com/shahmeer.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#080808] bg-gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-2"
              >
                DM on Instagram (@shahmeer.studio)
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
