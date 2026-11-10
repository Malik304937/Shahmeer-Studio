import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Eye as ViewIcon,
  Check,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  X,
  Layers,
  CheckCircle,
  FolderOpen,
  Key,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Artwork,
  ArtworkCategory,
  ARTWORK_CATEGORIES,
  ArtworkStats,
} from '../types';
import {
  adminLogin,
  adminLogout,
  verifyAdminSession,
  fetchArtworks,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  uploadArtworkImage,
  calculateStats,
  changeAdminPassword,
} from '../services/api';

interface AdminPanelProps {
  onBackToPortfolio: () => void;
  onArtworksChanged: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToPortfolio,
  onArtworksChanged,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Artwork management state
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(false);
  const [stats, setStats] = useState<ArtworkStats>({
    totalUploaded: 0,
    totalPublished: 0,
    totalDrafts: 0,
  });

  // Upload & Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ArtworkCategory>('Logo Design');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Table filter
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check existing session on mount
  useEffect(() => {
    async function checkAuth() {
      setIsCheckingAuth(true);
      const authed = await verifyAdminSession();
      setIsAuthenticated(authed);
      if (authed) {
        await loadAdminArtworks();
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const loadAdminArtworks = async () => {
    setIsLoadingArtworks(true);
    try {
      const data = await fetchArtworks();
      setArtworks(data);
      setStats(calculateStats(data));
      onArtworksChanged();
    } catch (err) {
      console.error('Error fetching admin artworks:', err);
    } finally {
      setIsLoadingArtworks(false);
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Please enter the administrator password');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    const res = await adminLogin(password);
    setIsLoggingIn(false);

    if (res.success) {
      setIsAuthenticated(true);
      setPassword('');
      await loadAdminArtworks();
    } else {
      setLoginError(res.error || 'Access denied. Invalid administrator security key.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
    setArtworks([]);
    onArtworksChanged();
  };

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match');
      return;
    }

    setIsChangingPwd(true);
    const res = await changeAdminPassword(currentPwd, newPwd);
    setIsChangingPwd(false);

    if (res.success) {
      setPwdSuccess('Admin security password updated successfully! Please keep it secure.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPwdSuccess('');
      }, 2500);
    } else {
      setPwdError(res.error || 'Failed to update admin password');
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingArtwork(null);
    setFormTitle('');
    setFormCategory('Logo Design');
    setFormDescription('');
    setFormImageUrl('');
    setFormPublished(true);
    setSelectedFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (art: Artwork) => {
    setEditingArtwork(art);
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormDescription(art.description || '');
    setFormImageUrl(art.imageUrl);
    setFormPublished(art.published);
    setSelectedFile(null);
    setImagePreview(art.imageUrl);
    setUploadProgress(0);
    setFormError('');
    setIsModalOpen(true);
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFormError('Image exceeds the maximum 25MB file size limit');
      return;
    }

    setSelectedFile(file);
    setFormError('');

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Form Submit (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setFormError('Artwork title is required');
      return;
    }

    if (!selectedFile && !formImageUrl.trim() && !imagePreview) {
      setFormError('Please select an image file or provide an image URL');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setUploadProgress(10);

    try {
      let finalImageUrl = formImageUrl.trim();

      // If user uploaded a new file, track upload progress
      if (selectedFile) {
        finalImageUrl = await uploadArtworkImage(selectedFile, (percent) => {
          setUploadProgress(percent);
        });
      }

      if (editingArtwork) {
        // Update existing artwork
        await updateArtwork(editingArtwork.id, {
          title: formTitle.trim(),
          category: formCategory,
          description: formDescription.trim(),
          imageUrl: finalImageUrl,
          published: formPublished,
        });
        setSuccessMessage('Artwork updated successfully!');
      } else {
        // Create new artwork
        await createArtwork({
          title: formTitle.trim(),
          category: formCategory,
          description: formDescription.trim(),
          imageUrl: finalImageUrl,
          published: formPublished,
        });

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#FFF4D0', '#AA820A'],
          });
        } catch {}

        setSuccessMessage('New artwork successfully published to Shahmeer Studio!');
      }

      setIsModalOpen(false);
      await loadAdminArtworks();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Toggle publish status directly
  const handleTogglePublish = async (art: Artwork) => {
    try {
      await updateArtwork(art.id, { published: !art.published });
      await loadAdminArtworks();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  // Delete Artwork
  const handleDeleteArtwork = async (id: string) => {
    try {
      await deleteArtwork(id);
      setDeleteConfirmId(null);
      await loadAdminArtworks();
      setSuccessMessage('Artwork successfully removed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete artwork:', err);
    }
  };

  // Filter artworks for table
  const filteredTableArtworks = artworks.filter((art) => {
    const matchesStatus =
      tableFilter === 'all' ||
      (tableFilter === 'published' && art.published) ||
      (tableFilter === 'drafts' && !art.published);

    const q = tableSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // ======================== RENDER: AUTH CHECKING ======================== //
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono-accent">
            Verifying Studio Credentials...
          </p>
        </div>
      </div>
    );
  }

  // ======================== RENDER: LOGIN FORM ======================== //
  // STRICT PRIVACY: Only shows brand, title, password input, unlock button, and error messages.
  // NO HINTS, NO DEFAULT PASSWORDS, NO EXPOSED SECRETS.
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#D4AF37]/8 blur-[130px] rounded-full pointer-events-none" />

        {/* Back to Portfolio Link */}
        <button
          onClick={onBackToPortfolio}
          className="absolute top-8 left-8 inline-flex items-center space-x-2 text-xs font-mono-accent uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>

        {/* Login Card */}
        <div className="w-full max-w-md bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative z-10">
          {/* Header with Royal Gold Emblem */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full border border-[#D4AF37]/60 p-1 bg-[#161616] flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
              <img
                src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
                alt="Shahmeer Studio Emblem"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="font-serif-luxury text-xl font-bold tracking-[0.15em] text-white">
              SHAHMEER STUDIO
            </h2>
            <p className="text-xs font-mono-accent uppercase tracking-widest text-[#D4AF37] mt-1 font-semibold">
              PRIVATE ADMIN PORTAL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full bg-[#181818] border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white text-sm rounded-lg pl-10 pr-10 py-3 outline-none transition-all placeholder:text-gray-600 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-lg bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Unlock Studio Admin</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ======================== RENDER: ADMIN DASHBOARD ======================== //
  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#D4AF37]/20 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full border border-[#D4AF37]/60 p-0.5 bg-[#121212] overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/Shahmeer_Studio_Royal_Gold_Emblem_2de8b0bc.png"
                alt="Emblem"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <button
                  onClick={onBackToPortfolio}
                  className="text-xs font-mono-accent uppercase tracking-wider text-gray-400 hover:text-[#D4AF37] flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View Live Portfolio</span>
                </button>
              </div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wide text-white">
                SHAHMEER STUDIO <span className="text-gold-gradient">DASHBOARD</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage online artwork gallery, upload designs to permanent storage, and synchronize public exhibitions.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-full border border-[#D4AF37]/40 text-[#F5D77F] hover:bg-[#D4AF37]/10 text-xs uppercase tracking-wider transition-all cursor-pointer"
              title="Change Admin Security Password"
            >
              <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Change Password</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Artwork</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-red-500/40 text-red-300 hover:bg-red-950/30 text-xs uppercase tracking-wider transition-all cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Global Toast Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Studio Metrics Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Total Uploaded */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#D4AF37]/25 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono-accent uppercase tracking-widest text-gray-400 font-semibold">
                Total Uploaded Designs
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <FolderOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white mb-1">
              {stats.totalUploaded}
            </div>
            <p className="text-[11px] text-gray-500">
              Permanent studio artwork archive
            </p>
          </div>

          {/* Card 2: Total Published */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-emerald-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono-accent uppercase tracking-widest text-emerald-400 font-semibold">
                Published &amp; Live
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white mb-1">
              {stats.totalPublished}
            </div>
            <p className="text-[11px] text-gray-500">
              Active in public gallery across all devices
            </p>
          </div>

          {/* Card 3: Unpublished Drafts */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-amber-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono-accent uppercase tracking-widest text-amber-400 font-semibold">
                Drafts / Unpublished
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white mb-1">
              {stats.totalDrafts}
            </div>
            <p className="text-[11px] text-gray-500">
              Saved privately in studio archive
            </p>
          </div>
        </div>

        {/* Projects Table & Management Section */}
        <div className="rounded-2xl bg-[#121212] border border-[#D4AF37]/25 overflow-hidden shadow-2xl">
          {/* Table Controls */}
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setTableFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  tableFilter === 'all'
                    ? 'bg-gold-gradient text-black font-bold'
                    : 'text-gray-400 hover:text-white bg-[#181818]'
                }`}
              >
                All ({artworks.length})
              </button>
              <button
                onClick={() => setTableFilter('published')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  tableFilter === 'published'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white bg-[#181818]'
                }`}
              >
                Published ({stats.totalPublished})
              </button>
              <button
                onClick={() => setTableFilter('drafts')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  tableFilter === 'drafts'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white bg-[#181818]'
                }`}
              >
                Drafts ({stats.totalDrafts})
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search artworks..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs rounded-lg px-3 py-2 outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Table Content */}
          {isLoadingArtworks ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-mono-accent">Loading artworks...</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="py-16 text-center px-4">
              <FolderOpen className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">
                No artworks uploaded yet
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                Your portfolio currently shows the &ldquo;New Creative Projects Coming Soon&rdquo; message. Click below to add your first project.
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Artwork</span>
              </button>
            </div>
          ) : filteredTableArtworks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No artworks match the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181818] uppercase tracking-wider text-gray-400 border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Artwork</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date Uploaded</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTableArtworks.map((art) => (
                    <tr key={art.id} className="hover:bg-[#161616] transition-colors">
                      {/* Image & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-12 h-12 rounded object-cover border border-white/10 shrink-0 bg-[#0d0d0d]"
                          />
                          <div>
                            <span className="font-semibold text-white block text-sm">
                              {art.title}
                            </span>
                            <span className="text-gray-400 line-clamp-1 text-[11px] max-w-xs">
                              {art.description || 'No description provided'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded bg-[#1e1e1e] border border-white/10 text-[11px] text-[#F5D77F] whitespace-nowrap">
                          {art.category}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(art)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                            art.published
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                              : 'bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
                          }`}
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              art.published ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <span>{art.published ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                        {new Date(art.uploadDate).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(art)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Artwork"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(art.id)}
                            className="p-1.5 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Delete Artwork"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ======================== MODAL: UPLOAD / EDIT ARTWORK ======================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#121212] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-white">
                  {editingArtwork ? 'Edit Artwork' : 'Upload New Artwork'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2">
                  Artwork Image *
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-[#080808] aspect-video max-h-56 flex items-center justify-center mb-3">
                    <img
                      src={imagePreview}
                      alt="Artwork Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setSelectedFile(null);
                        setFormImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-400 border border-white/20"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 text-center cursor-pointer bg-[#181818] transition-colors mb-3 group"
                  >
                    <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold text-white">
                      Click to browse or drop artwork file
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Supports PNG, JPG, WebP, SVG (up to 25MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] text-[#F5D77F] mb-1">
                      <span>Uploading to permanent storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden border border-[#D4AF37]/30">
                      <div
                        className="bg-gold-gradient h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Or Image URL Input */}
                <div className="text-[11px] text-gray-400 mb-1">
                  Or provide image URL:
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/artwork.jpg"
                  value={formImageUrl}
                  onChange={(e) => {
                    setFormImageUrl(e.target.value);
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                    }
                  }}
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Crown Monogram Identity"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs sm:text-sm rounded-lg px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ArtworkCategory)}
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs sm:text-sm rounded-lg px-3.5 py-2.5 text-white outline-none cursor-pointer"
                >
                  {ARTWORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-2">
                  Description / Art Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide background, design tools used, typography details, or commission story..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs sm:text-sm rounded-lg px-3.5 py-2 text-white outline-none resize-none"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#181818] border border-white/5">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-gray-600 bg-gray-700 cursor-pointer"
                />
                <label htmlFor="publishedToggle" className="text-xs text-gray-200 cursor-pointer">
                  <span className="font-semibold block">Publish directly to Portfolio Gallery</span>
                  <span className="text-[11px] text-gray-400">
                    If unchecked, this artwork will be saved as an internal draft.
                  </span>
                </label>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                {/* Preview Before Publishing */}
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  disabled={!formTitle || !imagePreview}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:text-white text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                >
                  <ViewIcon className="w-3.5 h-3.5" />
                  <span>Preview Card</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gold-gradient hover:bg-gold-gradient-hover text-[#080808] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingArtwork ? 'Save Changes' : 'Publish Artwork'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== MODAL: PREVIEW BEFORE PUBLISHING ======================== */}
      {previewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-[#121212] border border-[#D4AF37] rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs uppercase font-mono-accent tracking-widest text-[#D4AF37] font-semibold">
                Live Visitor Preview
              </span>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Card */}
            <div className="rounded-xl overflow-hidden bg-[#181818] border border-[#D4AF37]/30">
              <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt={formTitle}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#080808]/85 text-[10px] uppercase tracking-wider font-semibold text-[#F5D77F] border border-[#D4AF37]/30">
                  {formCategory}
                </span>
              </div>
              <div className="p-5">
                <h4 className="font-serif-luxury text-base font-bold text-white mb-1">
                  {formTitle || 'Artwork Title'}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {formDescription || 'Design description will appear here...'}
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Status: {formPublished ? 'Will be Live' : 'Saved as Draft'}</span>
                  <span className="text-[#D4AF37]">Click to Expand &rarr;</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewModalOpen(false)}
              className="w-full mt-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs uppercase tracking-wider font-semibold text-white cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* ======================== MODAL: CHANGE ADMIN PASSWORD ======================== */}
      {isPasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-[#121212] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif-luxury text-lg font-bold text-white">
                  Update Admin Password
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Set a private, confidential password known only to you. This replaces the initial default password and secures your studio dashboard.
            </p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs rounded-lg px-3.5 py-2.5 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-1.5">
                  New Private Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new private password..."
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs rounded-lg px-3.5 py-2.5 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full bg-[#181818] border border-white/10 focus:border-[#D4AF37] text-xs rounded-lg px-3.5 py-2.5 text-white outline-none"
                  required
                />
              </div>

              {pwdError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-6 py-2 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {isChangingPwd ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== MODAL: DELETE CONFIRMATION ======================== */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-[#141414] border border-red-500/40 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Delete Artwork?
            </h4>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete this artwork from Shahmeer Studio? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteArtwork(deleteConfirmId)}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
