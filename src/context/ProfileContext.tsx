import React, { createContext, useContext, useEffect, useState } from 'react';
import { OutfitLook, ProductItem, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface ProfileContextType {
  profile: UserProfile | null;
  hasProfile: boolean;
  savedLooks: OutfitLook[];
  savedProducts: ProductItem[];
  saveProfile: (profile: UserProfile) => void;
  deleteProfile: () => void;
  loadDemoProfile: () => void;
  saveLook: (outfit: OutfitLook) => boolean;
  removeLook: (id: string) => void;
  isLookSaved: (id: string) => boolean;
  toggleSaveProduct: (product: ProductItem) => boolean;
  isProductSaved: (id: string) => boolean;
  clearAllData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [savedLooks, setSavedLooks] = useState<OutfitLook[]>([]);
  const [savedProducts, setSavedProducts] = useState<ProductItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initial load from storage
    const loadedProfile = storageService.getProfile();
    setProfileState(loadedProfile);
    setSavedLooks(storageService.getSavedLooks());
    setSavedProducts(storageService.getSavedProducts());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const saveProfile = (newProfile: UserProfile) => {
    storageService.saveProfile(newProfile);
    setProfileState(newProfile);
    showToast('Digital Twin profile updated successfully');
  };

  const deleteProfile = () => {
    storageService.deleteProfile();
    setProfileState(null);
    showToast('Profile removed');
  };

  const loadDemoProfile = () => {
    const demo = storageService.loadDemoProfile();
    setProfileState(demo);
    setSavedLooks(storageService.getSavedLooks());
    showToast('Loaded demo fashion profile & looks');
  };

  const saveLook = (outfit: OutfitLook): boolean => {
    const success = storageService.saveLook(outfit);
    if (success) {
      setSavedLooks(storageService.getSavedLooks());
      showToast(`Saved "${outfit.name}" to your wardrobe`);
    } else {
      showToast(`"${outfit.name}" is already in your saved looks`);
    }
    return success;
  };

  const removeLook = (id: string) => {
    storageService.removeLook(id);
    setSavedLooks(storageService.getSavedLooks());
    showToast('Outfit removed from saved looks');
  };

  const isLookSaved = (id: string): boolean => {
    return savedLooks.some(item => item.id === id);
  };

  const toggleSaveProduct = (product: ProductItem): boolean => {
    const added = storageService.toggleSaveProduct(product);
    setSavedProducts(storageService.getSavedProducts());
    showToast(added ? `Saved ${product.name}` : `Removed ${product.name}`);
    return added;
  };

  const isProductSaved = (id: string): boolean => {
    return savedProducts.some(item => item.id === id);
  };

  const clearAllData = () => {
    storageService.clearAllPrototypeData();
    setProfileState(null);
    setSavedLooks([]);
    setSavedProducts([]);
    showToast('All local prototype data cleared');
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: Boolean(profile),
        savedLooks,
        savedProducts,
        saveProfile,
        deleteProfile,
        loadDemoProfile,
        saveLook,
        removeLook,
        isLookSaved,
        toggleSaveProduct,
        isProductSaved,
        clearAllData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
