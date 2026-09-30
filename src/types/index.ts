export type UnitSystem = 'metric' | 'imperial';

export interface BodyMeasurements {
  height: number; // in cm
  shoulderWidth: number; // in cm
  chest: number; // in cm
  waist: number; // in cm
  hip: number; // in cm
  armLength: number; // in cm
  inseam: number; // in cm
  weight?: number; // in kg
}

export type StylePreference = 
  | 'Casual'
  | 'Streetwear'
  | 'Formal'
  | 'Minimalist'
  | 'Smart Casual'
  | 'Ethnic';

export type OccasionType = 
  | 'College'
  | 'Casual Outing'
  | 'Party'
  | 'Office'
  | 'Wedding'
  | 'Travel';

export type BudgetTier = 'accessible' | 'contemporary' | 'luxury';

export interface UserProfile {
  id: string;
  displayName: string;
  ageRange?: string;
  units: UnitSystem;
  measurements: BodyMeasurements;
  appearance: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    referencePhotoUrl?: string;
  };
  preferences: {
    styles: StylePreference[];
    favoriteColors: string[];
    categories: string[];
    budgetTier: BudgetTier;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories';
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  retailerUrl?: string;
  color?: string;
  fitDescription?: string;
}

export interface OutfitLook {
  id: string;
  name: string;
  occasion: OccasionType;
  style: StylePreference;
  budgetTier: BudgetTier;
  explanation: string;
  imageUrl: string;
  items: ClothingItem[];
  totalPrice: number;
  silhouetteMatchScore: number; // percentage match with user's twin
  matchReason?: string;
  savedAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  style: StylePreference;
  price: number;
  retailer: string;
  imageUrl: string;
  productUrl: string;
  isNewArrival?: boolean;
}
