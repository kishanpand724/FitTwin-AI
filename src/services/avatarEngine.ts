/**
 * Avatar Engine Abstraction Layer
 * Provides modular configuration, future API integration hook, and layer management.
 */

import { BodyMeasurements, UserProfile } from '../types';

export type ClothingLayerTop = 'none' | 'crewneck' | 'shirt';
export type ClothingLayerBottom = 'none' | 'trousers' | 'jeans';
export type ClothingLayerOuterwear = 'none' | 'blazer';
export type ClothingLayerFootwear = 'none' | 'boots' | 'sneakers';

export interface AvatarLayersState {
  top: ClothingLayerTop;
  bottom: ClothingLayerBottom;
  outerwear: ClothingLayerOuterwear;
  footwear: ClothingLayerFootwear;
}

export interface AvatarAppearanceConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  referencePhotoUrl?: string;
}

export interface AvatarCalibrationMetrics {
  heightScale: number;
  shoulderScale: number;
  chestScale: number;
  waistScale: number;
  hipScale: number;
  armScale: number;
  inseamScale: number;
}

export const DEFAULT_AVATAR_LAYERS: AvatarLayersState = {
  top: 'none',
  bottom: 'none',
  outerwear: 'none',
  footwear: 'none',
};

/**
 * Calculates normalized physiological scaling factors from Euclidean measurements
 * Base calibration reference: 175cm height, 42cm shoulder, 90cm chest, 72cm waist, 96cm hip.
 */
export function calculateAvatarCalibration(measurements: BodyMeasurements): AvatarCalibrationMetrics {
  const baseH = 175;
  const baseS = 42;
  const baseC = 90;
  const baseW = 72;
  const baseHip = 96;
  const baseArm = 59;
  const baseInseam = 80;

  return {
    heightScale: Math.max(0.85, Math.min(1.25, (measurements.height || baseH) / baseH)),
    shoulderScale: Math.max(0.82, Math.min(1.28, (measurements.shoulderWidth || baseS) / baseS)),
    chestScale: Math.max(0.80, Math.min(1.30, (measurements.chest || baseC) / baseC)),
    waistScale: Math.max(0.75, Math.min(1.30, (measurements.waist || baseW) / baseW)),
    hipScale: Math.max(0.80, Math.min(1.30, (measurements.hip || baseHip) / baseHip)),
    armScale: Math.max(0.85, Math.min(1.20, (measurements.armLength || baseArm) / baseArm)),
    inseamScale: Math.max(0.85, Math.min(1.20, (measurements.inseam || baseInseam) / baseInseam)),
  };
}

/**
 * Avatar generation service abstraction.
 * Prepared for future dedicated generative 3D avatar APIs (e.g. ReadyPlayerMe, Avaturn, or proprietary neural mesh).
 */
export interface AvatarGenerationProvider {
  id: string;
  name: string;
  isAvailable: boolean;
  generateModelUrl?: (profile: UserProfile) => Promise<string>;
}

export const avatarEngineService = {
  getAvailableProviders(): AvatarGenerationProvider[] {
    return [
      {
        id: 'parametric-studio',
        name: 'Local High-Precision Parametric Mannequin (Active)',
        isAvailable: true,
      },
      {
        id: 'neural-mesh-cloud',
        name: 'Neural 3D Mesh Generator (In Development)',
        isAvailable: false,
      },
    ];
  },
};
