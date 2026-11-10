export type ArtworkCategory =
  | 'Logo Design'
  | 'T-Shirt Design'
  | 'Poster Design'
  | 'Social Media Design'
  | 'Branding'
  | 'Other Designs';

export const ARTWORK_CATEGORIES: ArtworkCategory[] = [
  'Logo Design',
  'T-Shirt Design',
  'Poster Design',
  'Social Media Design',
  'Branding',
  'Other Designs',
];

export interface Artwork {
  id: string;
  title: string;
  description: string;
  category: ArtworkCategory;
  imageUrl: string;
  uploadDate: string; // ISO string format
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
}

export interface ArtworkStats {
  totalUploaded: number;
  totalPublished: number;
  totalDrafts: number;
}
