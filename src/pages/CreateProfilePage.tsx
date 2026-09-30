import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Ruler,
  User,
  Palette,
  Sparkles,
  Camera,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  BodyMeasurements,
  BudgetTier,
  StylePreference,
  UnitSystem,
  UserProfile,
} from '../types';

interface FormData {
  displayName: string;
  ageRange: string;
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
}

const SKIN_TONES = [
  { name: 'Fair Ivory', hex: '#F9E4D4' },
  { name: 'Warm Beige', hex: '#F0D0B4' },
  { name: 'Golden Olive', hex: '#E0B594' },
  { name: 'Honey Amber', hex: '#C68F65' },
  { name: 'Deep Bronze', hex: '#8D5338' },
  { name: 'Rich Espresso', hex: '#4B2A1C' },
];

const HAIR_STYLES = [
  'Short Crop',
  'Textured Waves',
  'Sleek Bob',
  'Long Layers',
  'Buzz Cut',
  'Curly Afro',
  'Braided Crown',
  'Minimalist Slicked',
];

const HAIR_COLORS = [
  { name: 'Jet Black', hex: '#1C1C1C' },
  { name: 'Deep Espresso', hex: '#2B1E16' },
  { name: 'Warm Chestnut', hex: '#5A3825' },
  { name: 'Honey Blonde', hex: '#C29B38' },
  { name: 'Platinum Ash', hex: '#DCD6CD' },
  { name: 'Burgundy Copper', hex: '#632A26' },
];

const CLOTHING_STYLES: StylePreference[] = [
  'Casual',
  'Streetwear',
  'Formal',
  'Minimalist',
  'Smart Casual',
  'Ethnic',
];

const PALETTE_COLORS = [
  { name: 'Forest Green', hex: '#244D3C' },
  { name: 'Charcoal Black', hex: '#20211F' },
  { name: 'Raw Sand', hex: '#F8F7F4' },
  { name: 'Muted Sage', hex: '#A6B6A3' },
  { name: 'Warm Camel', hex: '#D5C4A1' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Burgundy', hex: '#5C1D24' },
  { name: 'Optic White', hex: '#FFFFFF' },
];

const CATEGORIES = [
  'Outerwear',
  'Tops',
  'Trousers',
  'Dresses',
  'Knitwear',
  'Footwear',
  'Accessories',
];

export const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form from existing profile or smart defaults
  const [formData, setFormData] = useState<FormData>(() => {
    if (profile) {
      return {
        displayName: profile.displayName,
        ageRange: profile.ageRange || '25-34',
        units: profile.units,
        measurements: { ...profile.measurements },
        appearance: { ...profile.appearance },
        preferences: {
          styles: [...profile.preferences.styles],
          favoriteColors: [...profile.preferences.favoriteColors],
          categories: [...profile.preferences.categories],
          budgetTier: profile.preferences.budgetTier,
        },
      };
    }
    return {
      displayName: '',
      ageRange: '25-34',
      units: 'metric',
      measurements: {
        height: 175,
        shoulderWidth: 42,
        chest: 90,
        waist: 72,
        hip: 96,
        armLength: 59,
        inseam: 80,
        weight: 65,
      },
      appearance: {
        skinTone: '#E0B594',
        hairStyle: 'Short Crop',
        hairColor: '#2B1E16',
        referencePhotoUrl: '',
      },
      preferences: {
        styles: ['Minimalist', 'Smart Casual'],
        favoriteColors: ['#244D3C', '#20211F', '#F8F7F4'],
        categories: ['Outerwear', 'Tops', 'Trousers'],
        budgetTier: 'contemporary',
      },
    };
  });

  // Validation per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Display name is required';
      }
      if (!formData.measurements.height || formData.measurements.height < 100 || formData.measurements.height > 250) {
        newErrors.height = 'Please enter a valid height between 100cm and 250cm';
      }
    }

    if (step === 2) {
      const { shoulderWidth, chest, waist, hip, armLength, inseam } = formData.measurements;
      if (!shoulderWidth || shoulderWidth < 25 || shoulderWidth > 75) {
        newErrors.shoulderWidth = 'Shoulder breadth usually ranges between 30 and 65 cm';
      }
      if (!chest || chest < 50 || chest > 160) {
        newErrors.chest = 'Chest measurement usually ranges between 60 and 150 cm';
      }
      if (!waist || waist < 45 || waist > 160) {
        newErrors.waist = 'Waist measurement usually ranges between 50 and 150 cm';
      }
      if (!hip || hip < 55 || hip > 170) {
        newErrors.hip = 'Hip measurement usually ranges between 60 and 160 cm';
      }
      if (!armLength || armLength < 35 || armLength > 90) {
        newErrors.armLength = 'Arm length usually ranges between 40 and 85 cm';
      }
      if (!inseam || inseam < 40 || inseam > 110) {
        newErrors.inseam = 'Inseam usually ranges between 55 and 105 cm';
      }
    }

    if (step === 4) {
      if (formData.preferences.styles.length === 0) {
        newErrors.styles = 'Please select at least one preferred fashion style';
      }
      if (formData.preferences.favoriteColors.length === 0) {
        newErrors.colors = 'Please select at least one preferred color tone';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) {
      return;
    }

    const newProfile: UserProfile = {
      id: profile?.id || `ft_user_${Date.now()}`,
      displayName: formData.displayName.trim(),
      ageRange: formData.ageRange,
      units: formData.units,
      measurements: { ...formData.measurements },
      appearance: { ...formData.appearance },
      preferences: { ...formData.preferences },
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProfile(newProfile);
    navigate('/digital-twin');
  };

  // Image file handler for photo reference
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setFormData(prev => ({
          ...prev,
          appearance: {
            ...prev.appearance,
            referencePhotoUrl: event.target?.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStyle = (style: StylePreference) => {
    setFormData(prev => {
      const exists = prev.preferences.styles.includes(style);
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          styles: exists
            ? prev.preferences.styles.filter(s => s !== style)
            : [...prev.preferences.styles, style],
        },
      };
    });
  };

  const toggleColor = (hex: string) => {
    setFormData(prev => {
      const exists = prev.preferences.favoriteColors.includes(hex);
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          favoriteColors: exists
            ? prev.preferences.favoriteColors.filter(c => c !== hex)
            : [...prev.preferences.favoriteColors, hex],
        },
      };
    });
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => {
      const exists = prev.preferences.categories.includes(cat);
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          categories: exists
            ? prev.preferences.categories.filter(c => c !== cat)
            : [...prev.preferences.categories, cat],
        },
      };
    });
  };

  const stepsMeta = [
    { num: 1, title: 'Identity', icon: User },
    { num: 2, title: 'Measurements', icon: Ruler },
    { num: 3, title: 'Appearance', icon: Palette },
    { num: 4, title: 'Fashion Taste', icon: Sparkles },
    { num: 5, title: 'Review & Build', icon: Check },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Page Title */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-2">
          Parametric Calibration
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial font-medium text-[#20211F]">
          {profile ? 'Recalibrate Your Digital Twin' : 'Create Your Digital Twin'}
        </h1>
        <p className="text-xs sm:text-sm text-[#20211F]/70 mt-2 max-w-md mx-auto">
          We construct your virtual mannequin using exact Euclidean coordinates for zero-guesswork
          fashion styling.
        </p>
      </div>

      {/* Wizard Step Progress Bar */}
      <div className="mb-10 bg-white border border-[#E7E5DF] p-3 sm:p-4">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {stepsMeta.map(s => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  // Allow jumping back to earlier steps or review
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`flex flex-col items-center text-center p-2 transition-colors ${
                  isCurrent
                    ? 'border-b-2 border-[#244D3C] text-[#244D3C]'
                    : isCompleted
                    ? 'text-[#20211F] hover:text-[#244D3C]'
                    : 'text-[#20211F]/40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono mb-1 ${
                    isCurrent
                      ? 'bg-[#244D3C] text-white'
                      : isCompleted
                      ? 'bg-[#E8EDE7] text-[#244D3C]'
                      : 'bg-[#F8F7F4] text-[#20211F]/40'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider hidden sm:block truncate w-full">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Form Container */}
      <div className="bg-white border border-[#E7E5DF] p-6 sm:p-10 shadow-2xs">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E7E5DF] pb-4 mb-6">
              <span className="text-xs font-mono text-[#244D3C]">STEP 01 OF 05</span>
              <h2 className="text-xl font-editorial font-medium text-[#20211F] mt-1">
                Basic Identity & Unit Preferences
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1.5">
                Display Name <span className="text-[#244D3C]">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, displayName: e.target.value }))
                }
                placeholder="e.g. Elena Vance"
                className={`w-full p-3 bg-[#F8F7F4] border text-sm text-[#20211F] focus:outline-none focus:border-[#244D3C] transition-colors ${
                  errors.displayName ? 'border-red-500' : 'border-[#E7E5DF]'
                }`}
              />
              {errors.displayName && (
                <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.displayName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1.5">
                  Age Range (Optional)
                </label>
                <select
                  value={formData.ageRange}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, ageRange: e.target.value }))
                  }
                  className="w-full p-3 bg-[#F8F7F4] border border-[#E7E5DF] text-sm text-[#20211F] focus:outline-none focus:border-[#244D3C]"
                >
                  <option value="18-24">18 - 24 years</option>
                  <option value="25-34">25 - 34 years</option>
                  <option value="35-44">35 - 44 years</option>
                  <option value="45-54">45 - 54 years</option>
                  <option value="55+">55+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1.5">
                  Unit System
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, units: 'metric' }))
                    }
                    className={`py-2.5 text-xs uppercase font-medium border transition-colors ${
                      formData.units === 'metric'
                        ? 'bg-[#244D3C] text-white border-[#244D3C]'
                        : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                    }`}
                  >
                    Metric (cm / kg)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, units: 'imperial' }))
                    }
                    className={`py-2.5 text-xs uppercase font-medium border transition-colors ${
                      formData.units === 'imperial'
                        ? 'bg-[#244D3C] text-white border-[#244D3C]'
                        : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                    }`}
                  >
                    Imperial (in / lbs)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                  Total Height ({formData.units === 'metric' ? 'cm' : 'inches'}){' '}
                  <span className="text-[#244D3C]">*</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#244D3C]">
                  {formData.measurements.height} cm (
                  {Math.round(formData.measurements.height / 2.54)} in)
                </span>
              </div>
              <input
                type="range"
                min="130"
                max="220"
                value={formData.measurements.height}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    measurements: {
                      ...prev.measurements,
                      height: Number(e.target.value),
                    },
                  }))
                }
                className="w-full accent-[#244D3C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#20211F]/50 font-mono mt-1">
                <span>130 cm</span>
                <span>175 cm (Standard)</span>
                <span>220 cm</span>
              </div>
              {errors.height && (
                <span className="text-xs text-red-600 mt-1 block">{errors.height}</span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Body Measurements */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E7E5DF] pb-4 mb-6">
              <span className="text-xs font-mono text-[#244D3C]">STEP 02 OF 05</span>
              <h2 className="text-xl font-editorial font-medium text-[#20211F] mt-1">
                Physical Body Dimensions
              </h2>
              <p className="text-xs text-[#20211F]/60 mt-1">
                Use a flexible measuring tape against bare skin or lightweight undergarments.
              </p>
            </div>

            {/* Quick guide reminder */}
            <div className="p-3.5 bg-[#F8F7F4] border border-[#E7E5DF] flex items-start gap-2.5 text-xs text-[#20211F]/80">
              <HelpCircle className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
              <span>
                Accurate chest and waist measurements ensure jackets button without strain, while
                inseam measurements dictate trouser break and cuff style.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Shoulder Width */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Shoulder Width (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.shoulderWidth}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        shoulderWidth: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Across back from shoulder bone to shoulder bone.
                </span>
                {errors.shoulderWidth && (
                  <span className="text-xs text-red-600">{errors.shoulderWidth}</span>
                )}
              </div>

              {/* Chest */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Chest / Bust Circumference (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.chest}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        chest: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Around the fullest point of chest under armpits.
                </span>
                {errors.chest && (
                  <span className="text-xs text-red-600">{errors.chest}</span>
                )}
              </div>

              {/* Waist */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Natural Waist (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.waist}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        waist: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Narrowest point of torso above belly button.
                </span>
                {errors.waist && (
                  <span className="text-xs text-red-600">{errors.waist}</span>
                )}
              </div>

              {/* Hip */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Full Hip Circumference (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.hip}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        hip: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Widest point across buttocks and pelvis.
                </span>
                {errors.hip && (
                  <span className="text-xs text-red-600">{errors.hip}</span>
                )}
              </div>

              {/* Arm Length */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Arm Length (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.armLength}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        armLength: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  From top of shoulder down to wrist bone.
                </span>
                {errors.armLength && (
                  <span className="text-xs text-red-600">{errors.armLength}</span>
                )}
              </div>

              {/* Inseam */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Inseam Leg Length (cm)
                </label>
                <input
                  type="number"
                  value={formData.measurements.inseam}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        inseam: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Inner crotch seam down to bottom ankle hem.
                </span>
                {errors.inseam && (
                  <span className="text-xs text-red-600">{errors.inseam}</span>
                )}
              </div>
            </div>

            {/* Optional Weight */}
            <div className="pt-4 border-t border-[#E7E5DF]">
              <div className="max-w-xs">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1">
                  Weight in {formData.units === 'metric' ? 'kg' : 'lbs'} (Optional)
                </label>
                <input
                  type="number"
                  value={formData.measurements.weight || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        weight: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  placeholder="e.g. 65"
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5DF] text-sm tabular-nums focus:outline-none focus:border-[#244D3C]"
                />
                <span className="text-[10px] text-[#20211F]/50 block mt-0.5">
                  Used exclusively to refine fabric drape tension models.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Appearance */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E7E5DF] pb-4 mb-6">
              <span className="text-xs font-mono text-[#244D3C]">STEP 03 OF 05</span>
              <h2 className="text-xl font-editorial font-medium text-[#20211F] mt-1">
                Visual & Mannequin Aesthetic
              </h2>
              <p className="text-xs text-[#20211F]/60 mt-1">
                Customize avatar complexion, hairstyle, and optional visual reference.
              </p>
            </div>

            {/* Skin Tone Palette */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Skin Complexion Tone
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {SKIN_TONES.map(tone => {
                  const isSelected = formData.appearance.skinTone === tone.hex;
                  return (
                    <button
                      key={tone.hex}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, skinTone: tone.hex },
                        }))
                      }
                      className={`p-2 border text-center transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-[#244D3C] bg-[#F8F7F4] shadow-xs'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-black/10"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span className="text-[10px] font-medium text-[#20211F] leading-tight">
                        {tone.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Hair Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HAIR_STYLES.map(style => {
                  const isSelected = formData.appearance.hairStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, hairStyle: style },
                        }))
                      }
                      className={`py-2 px-3 text-xs text-left border transition-colors ${
                        isSelected
                          ? 'bg-[#244D3C] text-white border-[#244D3C]'
                          : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Hair Shade
              </label>
              <div className="flex flex-wrap gap-2.5">
                {HAIR_COLORS.map(color => {
                  const isSelected = formData.appearance.hairColor === color.hex;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, hairColor: color.hex },
                        }))
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-colors ${
                        isSelected
                          ? 'border-[#244D3C] bg-[#F8F7F4] font-medium'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Reference Photo Upload */}
            <div className="pt-4 border-t border-[#E7E5DF]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1.5">
                Optional Reference Photo (Private & Local)
              </label>
              <p className="text-xs text-[#20211F]/60 mb-3">
                Used only locally on your machine for visual twin calibration. Never uploaded to
                external clouds.
              </p>

              <div className="flex items-center gap-4">
                <label className="px-4 py-2.5 bg-[#F8F7F4] hover:bg-[#E8EDE7] border border-[#E7E5DF] text-xs font-medium uppercase tracking-wider text-[#20211F] cursor-pointer flex items-center gap-2 transition-colors">
                  <Camera className="w-4 h-4 text-[#244D3C]" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {formData.appearance.referencePhotoUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={formData.appearance.referencePhotoUrl}
                      alt="Uploaded reference preview"
                      className="w-10 h-10 object-cover border border-[#E7E5DF]"
                    />
                    <span className="text-xs text-[#244D3C] font-medium">Photo loaded ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Fashion Preferences */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E7E5DF] pb-4 mb-6">
              <span className="text-xs font-mono text-[#244D3C]">STEP 04 OF 05</span>
              <h2 className="text-xl font-editorial font-medium text-[#20211F] mt-1">
                Fashion Preferences & Wardrobe Tiers
              </h2>
            </div>

            {/* Preferred Clothing Styles */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Preferred Aesthetic Styles (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CLOTHING_STYLES.map(style => {
                  const isSelected = formData.preferences.styles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`p-3 text-xs uppercase tracking-wider text-left border flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#244D3C] text-white border-[#244D3C]'
                          : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      <span>{style}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
              {errors.styles && (
                <span className="text-xs text-red-600 mt-1 block">{errors.styles}</span>
              )}
            </div>

            {/* Preferred Color Tones */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Core Color Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PALETTE_COLORS.map(c => {
                  const isSelected = formData.preferences.favoriteColors.includes(c.hex);
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => toggleColor(c.hex)}
                      className={`p-2 border text-xs flex items-center gap-2 transition-colors ${
                        isSelected
                          ? 'border-[#244D3C] bg-[#F8F7F4] font-medium'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-none border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
              {errors.colors && (
                <span className="text-xs text-red-600 mt-1 block">{errors.colors}</span>
              )}
            </div>

            {/* Favorite Clothing Categories */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Key Wardrobe Focus Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const isSelected = formData.preferences.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
                        isSelected
                          ? 'bg-[#20211F] text-white border-[#20211F]'
                          : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range Tier */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-2">
                Default Budget Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, budgetTier: 'accessible' },
                    }))
                  }
                  className={`p-3.5 border text-left transition-colors ${
                    formData.preferences.budgetTier === 'accessible'
                      ? 'border-[#244D3C] bg-[#F8F7F4]'
                      : 'border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider block text-[#20211F]">
                    $ · Accessible
                  </span>
                  <span className="text-[11px] text-[#20211F]/60 block mt-1">
                    High quality essentials & thoughtful basics ($30 - $120/piece)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, budgetTier: 'contemporary' },
                    }))
                  }
                  className={`p-3.5 border text-left transition-colors ${
                    formData.preferences.budgetTier === 'contemporary'
                      ? 'border-[#244D3C] bg-[#F8F7F4]'
                      : 'border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider block text-[#20211F]">
                    $$ · Contemporary
                  </span>
                  <span className="text-[11px] text-[#20211F]/60 block mt-1">
                    Design ateliers & premium European labels ($120 - $450/piece)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, budgetTier: 'luxury' },
                    }))
                  }
                  className={`p-3.5 border text-left transition-colors ${
                    formData.preferences.budgetTier === 'luxury'
                      ? 'border-[#244D3C] bg-[#F8F7F4]'
                      : 'border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider block text-[#20211F]">
                    $$$ · Haute / Luxury
                  </span>
                  <span className="text-[11px] text-[#20211F]/60 block mt-1">
                    Runway tailoring, bespoke artisans & fine silk ($450+/piece)
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review All Details */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E7E5DF] pb-4 mb-6">
              <span className="text-xs font-mono text-[#244D3C]">STEP 05 OF 05</span>
              <h2 className="text-xl font-editorial font-medium text-[#20211F] mt-1">
                Final Review & Calibration Confirmation
              </h2>
              <p className="text-xs text-[#20211F]/60 mt-1">
                Verify your anatomical coordinates and aesthetic preferences before generating your
                twin.
              </p>
            </div>

            {/* Identity Review Card */}
            <div className="p-4 border border-[#E7E5DF] bg-[#F8F7F4] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block">
                  Identity & Units
                </span>
                <span className="text-base font-semibold text-[#20211F]">
                  {formData.displayName} ({formData.ageRange})
                </span>
                <span className="text-xs text-[#20211F]/70 block mt-0.5">
                  Height: {formData.measurements.height} cm · Units: {formData.units}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-[#244D3C] hover:underline uppercase tracking-wider font-semibold"
              >
                Edit
              </button>
            </div>

            {/* Measurements Grid Review */}
            <div className="p-4 border border-[#E7E5DF] bg-white">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E7E5DF]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                  Anatomical Proportions
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#244D3C] hover:underline uppercase tracking-wider font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Shoulder</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.shoulderWidth} cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Chest</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.chest} cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Waist</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.waist} cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Hips</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.hip} cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Arm Length</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.armLength} cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Inseam</span>
                  <span className="font-semibold tabular-nums">
                    {formData.measurements.inseam} cm
                  </span>
                </div>
              </div>
            </div>

            {/* Style & Preferences Review */}
            <div className="p-4 border border-[#E7E5DF] bg-[#F8F7F4]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E7E5DF]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                  Style & Wardrobe Directives
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-[#244D3C] hover:underline uppercase tracking-wider font-semibold"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Selected Styles</span>
                  <span className="font-medium text-[#20211F]">
                    {formData.preferences.styles.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#20211F]/60 uppercase block">Budget Tier</span>
                  <span className="font-medium capitalize text-[#244D3C]">
                    {formData.preferences.budgetTier}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Form Footer Buttons */}
        <div className="pt-8 border-t border-[#E7E5DF] mt-8 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create My Digital Twin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
