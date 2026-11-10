import React, { useState, useEffect, useCallback } from 'react';
import { GoldParticleBackground } from './components/GoldParticleBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PortfolioGallery } from './components/PortfolioGallery';
import { AboutSection } from './components/AboutSection';
import { InstagramContact } from './components/InstagramContact';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { Artwork } from './types';
import {
  fetchArtworks,
  verifyAdminSession,
  adminLogout,
  subscribeArtworksRealtime,
} from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<'portfolio' | 'admin'>(() => {
    return window.location.pathname === '/admin' ? 'admin' : 'portfolio';
  });
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Initial load artworks
  const loadArtworks = useCallback(async () => {
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (err) {
      console.error('Failed to load artworks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check admin session on mount
  const checkAuth = useCallback(async () => {
    const isAuthed = await verifyAdminSession();
    setIsAdminLoggedIn(isAuthed);
  }, []);

  useEffect(() => {
    checkAuth();
    loadArtworks();
  }, [checkAuth, loadArtworks]);

  // Real-time synchronization: listeners for Firestore and SSE
  useEffect(() => {
    const unsubscribe = subscribeArtworksRealtime((realtimeArtworks) => {
      setArtworks(realtimeArtworks);
      setIsLoading(false);
    }, isAdminLoggedIn);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdminLoggedIn]);

  // Handle browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('portfolio');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handler
  const handleNavigate = (view: 'portfolio' | 'admin', sectionId?: string) => {
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (currentView === 'admin') {
        window.history.pushState({}, '', '/');
        setCurrentView('portfolio');
      }

      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAdminLoggedIn(false);
    loadArtworks();
    if (currentView === 'admin') {
      handleNavigate('portfolio', 'home');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] relative selection:bg-[#D4AF37]/30 selection:text-[#F5D77F]">
      {/* Background Animated Gold Particles */}
      <GoldParticleBackground />

      {/* Sticky Luxury Navbar with Royal Emblem */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="relative z-10">
        {currentView === 'portfolio' ? (
          <>
            {/* 1. Hero Section */}
            <Hero onExploreClick={() => handleNavigate('portfolio', 'portfolio')} />

            {/* 2. Portfolio Gallery with Real-time Sync */}
            <PortfolioGallery
              artworks={artworks}
              isLoading={isLoading}
              isAdminLoggedIn={isAdminLoggedIn}
              onOpenAdminUpload={() => handleNavigate('admin')}
            />

            {/* 6. About Section */}
            <AboutSection />

            {/* 5. Instagram Contact Section with updated @shahmeer.studio */}
            <InstagramContact />
          </>
        ) : (
          /* 3. Admin Panel with password privacy & permanent storage */
          <AdminPanel
            onBackToPortfolio={() => handleNavigate('portfolio', 'home')}
            onArtworksChanged={() => {
              checkAuth();
              loadArtworks();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
