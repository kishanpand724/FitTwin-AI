import { OutfitLook, ProductItem, UserProfile } from '../types';
import { MOCK_OUTFITS, SAMPLE_PROFILE } from './mockData';

const PROFILE_KEY = 'fittwin_user_profile';
const SAVED_LOOKS_KEY = 'fittwin_saved_looks';
const SAVED_PRODUCTS_KEY = 'fittwin_saved_products';
const HAS_VISITED_KEY = 'fittwin_has_visited';

export const storageService = {
  // Profile
  getProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserProfile;
    } catch {
      return null;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  deleteProfile(): void {
    localStorage.removeItem(PROFILE_KEY);
  },

  loadDemoProfile(): UserProfile {
    this.saveProfile(SAMPLE_PROFILE);
    // Also seed a couple of saved looks so they see looks in saved looks page
    const initialSaved = [MOCK_OUTFITS[0], MOCK_OUTFITS[1]];
    localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(initialSaved));
    return SAMPLE_PROFILE;
  },

  // Saved Looks
  getSavedLooks(): OutfitLook[] {
    try {
      const data = localStorage.getItem(SAVED_LOOKS_KEY);
      if (!data) return [];
      return JSON.parse(data) as OutfitLook[];
    } catch {
      return [];
    }
  },

  saveLook(outfit: OutfitLook): boolean {
    try {
      const current = this.getSavedLooks();
      if (current.some(item => item.id === outfit.id)) {
        return false; // already saved
      }
      const updated = [
        { ...outfit, savedAt: new Date().toISOString() },
        ...current,
      ];
      localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  removeLook(outfitId: string): void {
    try {
      const current = this.getSavedLooks();
      const updated = current.filter(item => item.id !== outfitId);
      localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove look', e);
    }
  },

  isLookSaved(outfitId: string): boolean {
    const current = this.getSavedLooks();
    return current.some(item => item.id === outfitId);
  },

  // Saved Products
  getSavedProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(SAVED_PRODUCTS_KEY);
      if (!data) return [];
      return JSON.parse(data) as ProductItem[];
    } catch {
      return [];
    }
  },

  toggleSaveProduct(product: ProductItem): boolean {
    try {
      const current = this.getSavedProducts();
      const exists = current.some(item => item.id === product.id);
      let updated: ProductItem[];
      if (exists) {
        updated = current.filter(item => item.id !== product.id);
      } else {
        updated = [product, ...current];
      }
      localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },

  isProductSaved(productId: string): boolean {
    const current = this.getSavedProducts();
    return current.some(item => item.id === productId);
  },

  // Prototype reset
  clearAllPrototypeData(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SAVED_LOOKS_KEY);
    localStorage.removeItem(SAVED_PRODUCTS_KEY);
    localStorage.removeItem(HAS_VISITED_KEY);
  },
};
