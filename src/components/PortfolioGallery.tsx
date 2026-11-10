import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Maximize2,
  X,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Instagram,
} from 'lucide-react';
import { Artwork, ArtworkCategory, ARTWORK_CATEGORIES } from '../types';

interface PortfolioGalleryProps {
  artworks: Artwork[];
  isLoading: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdminUpload?: () => void;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  artworks,
  isLoading,
  isAdminLoggedIn,
  onOpenAdminUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null);

  // Filter artworks based on category and search query
  const filteredArtworks = useMemo(() => {
    return artworks.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [artworks, selectedCategory, searchQuery]);

  // Compute counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: artworks.length };
    ARTWORK_CATEGORIES.forEach((cat) => {
      counts[cat] = artworks.filter((a) => a.category === cat).length;
    });
    return counts;
  }, [artworks]);

  // Keyboard navigation for preview modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewArtwork) return;

      if (e.key === 'Escape') {
        setPreviewArtwork(null);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredArtworks.findIndex(
          (a) => a.id === previewArtwork.id
        );
        if (currentIndex !== -1 && currentIndex < filteredArtworks.length - 1) {
          setPreviewArtwork(filteredArtworks[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredArtworks.findIndex(
          (a) => a.id === previewArtwork.id
        );
        if (currentIndex > 0) {
          setPreviewArtwork(filteredArtworks[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewArtwork, filteredArtworks]);

  return (
    <section id="portfolio" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Section Accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-mono-accent uppercase tracking-[0.3em] text-[#D4AF37] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Portfolio</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.05em] text-white mb-4">
            FEATURED <span className="text-gold-gradient">ARTWORKS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            A bespoke showcase of logos, custom apparel prints, editorial posters, and brand identities crafted with precision and distinction.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-gold-gradient text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-[#121212] border border-[#D4AF37]/20 text-gray-300 hover:text-white hover:border-[#D4AF37]/60'
              }`}
            >
              All
              <span className="ml-1.5 opacity-70 text-[10px]">({categoryCounts.All || 0})</span>
            </button>

            {ARTWORK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gold-gradient text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#121212] border border-[#D4AF37]/20 text-gray-300 hover:text-white hover:border-[#D4AF37]/60'
                }`}
              >
                {cat}
                <span className="ml-1.5 opacity-70 text-[10px]">({categoryCounts[cat] || 0})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designs..."
              className="w-full bg-[#121212] border border-[#D4AF37]/25 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white text-xs rounded-full pl-10 pr-9 py-2.5 outline-none transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin mb-4" />
            <p className="text-xs font-mono-accent uppercase tracking-widest text-[#D4AF37]">
              Loading Shahmeer Studio Portfolio...
            </p>
          </div>
        )}

        {/* Empty State Requirements: CRITICAL */}
        {/* "Do not create fake designs, demo images, placeholder artwork or sample portfolio projects. */}
        {/* Initially show a professional empty-state message: 'New Creative Projects Coming Soon.' */}
        {/* Only display real artwork uploaded by the admin." */}
        {!isLoading && artworks.length === 0 && (
          <div className="py-24 px-6 rounded-2xl border border-[#D4AF37]/20 bg-[#101010]/90 backdrop-blur-sm text-center max-w-2xl mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Elegant corner gold accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-xl" />

            <div className="w-20 h-20 rounded-full border border-[#D4AF37]/40 bg-[#161616] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <Sparkles className="w-9 h-9 text-[#D4AF37]" />
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wide text-white mb-3">
              New Creative Projects Coming Soon.
            </h3>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Shahmeer Studio is curating its latest design collection. Only authentic, commissioned artwork and original studio designs will be exhibited here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/shahmeer.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gold-gradient text-[#080808] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>DM ON INSTAGRAM FOR CUSTOM ORDERS</span>
              </a>

              {isAdminLoggedIn && onOpenAdminUpload && (
                <button
                  onClick={onOpenAdminUpload}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload First Artwork</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filtered empty state (when designs exist overall but search returns nothing) */}
        {!isLoading && artworks.length > 0 && filteredArtworks.length === 0 && (
          <div className="py-20 text-center rounded-xl border border-white/5 bg-[#121212]/50 p-8 max-w-md mx-auto">
            <Filter className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">No designs found</h4>
            <p className="text-gray-400 text-xs mb-4">
              No artworks match your search &ldquo;{searchQuery}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs uppercase tracking-wider text-[#D4AF37] underline underline-offset-4 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Artwork Grid */}
        {!isLoading && filteredArtworks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((art) => (
              <div
                key={art.id}
                onClick={() => setPreviewArtwork(art)}
                className="group relative rounded-xl overflow-hidden bg-[#121212] border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.22)] flex flex-col cursor-pointer"
              >
                {/* Artwork Image Container */}
                <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-[#0d0d0d]">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded bg-[#080808]/85 backdrop-blur-md border border-[#D4AF37]/30 text-[10px] uppercase tracking-wider font-semibold text-[#F5D77F]">
                      {art.category}
                    </span>
                  </div>

                  {/* Hover Overlay with expand action */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <div className="w-12 h-12 rounded-full bg-gold-gradient text-black flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Artwork Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between border-t border-[#D4AF37]/10 bg-gradient-to-b from-[#141414] to-[#101010]">
                  <div>
                    <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white group-hover:text-[#F5D77F] transition-colors line-clamp-1 mb-1.5">
                      {art.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {art.description || 'Custom creative artwork crafted by Shahmeer Studio.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                      <span>{new Date(art.uploadDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </span>
                    <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                      <span>View</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Image Preview Modal (Lightbox) */}
      {previewArtwork && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewArtwork(null)}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[#101010] border border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-[#0d0d0d]">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs uppercase tracking-wider font-semibold text-[#F5D77F]">
                  {previewArtwork.category}
                </span>
                <span className="text-gray-500 text-xs hidden sm:inline">&bull;</span>
                <span className="text-gray-400 text-xs hidden sm:inline">
                  Shahmeer Studio Original
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewArtwork(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Image View */}
              <div className="lg:col-span-2 bg-[#080808] flex items-center justify-center p-4 sm:p-8 min-h-[300px] sm:min-h-[460px] relative">
                <img
                  src={previewArtwork.imageUrl}
                  alt={previewArtwork.title}
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/5"
                />
              </div>

              {/* Artwork Information Sidebar */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#121212] border-t lg:border-t-0 lg:border-l border-[#D4AF37]/15">
                <div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-white mb-2 leading-tight">
                    {previewArtwork.title}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Uploaded {new Date(previewArtwork.uploadDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-[11px] font-mono-accent uppercase tracking-widest text-[#D4AF37] mb-2 font-semibold">
                      Design Details
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {previewArtwork.description || 'Custom crafted design showcasing Shahmeer Studio\'s distinctive visual style and artistic execution.'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#D4AF37]/15 flex flex-col space-y-3">
                  <a
                    href="https://www.instagram.com/shahmeer.studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Inquire for Similar Design</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <p className="text-[11px] text-center text-gray-500">
                    Direct message on Instagram for custom commissioned orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
