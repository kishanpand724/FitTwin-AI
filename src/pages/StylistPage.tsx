import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  Bookmark,
  Shirt,
  Layers,
  Check,
  Cpu,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import {
  BudgetTier,
  OccasionType,
  OutfitLook,
  StylePreference,
} from '../types';
import { MOCK_OUTFITS } from '../services/mockData';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { OutfitModal } from '../components/outfits/OutfitModal';

const OCCASIONS: OccasionType[] = [
  'College',
  'Casual Outing',
  'Party',
  'Office',
  'Wedding',
  'Travel',
];

const STYLES: StylePreference[] = [
  'Casual',
  'Streetwear',
  'Formal',
  'Minimalist',
  'Smart Casual',
  'Ethnic',
];

const COLOR_VIBES = [
  { label: 'Earthy Naturals', colors: ['#244D3C', '#D5C4A1', '#F8F7F4'] },
  { label: 'Monochrome Midnight', colors: ['#20211F', '#4A4C48', '#FFFFFF'] },
  { label: 'Nordic Sage', colors: ['#A6B6A3', '#E8EDE7', '#20211F'] },
  { label: 'Rich Burgundy & Navy', colors: ['#5C1D24', '#1B2A4A', '#D5C4A1'] },
];

export const StylistPage: React.FC = () => {
  const { profile, hasProfile, showToast } = useProfile();

  // Stylist Inputs
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('Office');
  const [selectedStyle, setSelectedStyle] = useState<StylePreference>(
    profile?.preferences.styles[0] || 'Minimalist'
  );
  const [selectedBudget, setSelectedBudget] = useState<BudgetTier>(
    profile?.preferences.budgetTier || 'contemporary'
  );
  const [selectedVibe, setSelectedVibe] = useState<string>('Earthy Naturals');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<OutfitLook[]>(MOCK_OUTFITS);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitLook | null>(null);
  const [modalTab, setModalTab] = useState<'breakdown' | 'twinPreview'>('breakdown');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Future Gemini API payload builder (ready for backend/edge function execution)
  const constructGeminiStylingPrompt = () => {
    return {
      systemInstruction:
        'You are an expert luxury editorial stylist and bespoke tailor. Recommend proportional garments matching Euclidean body measurements.',
      userContext: {
        bodyDimensions: profile?.measurements || {
          height: 175,
          shoulderWidth: 42,
          chest: 90,
          waist: 72,
          hip: 96,
        },
        occasion: selectedOccasion,
        aestheticStyle: selectedStyle,
        budgetTier: selectedBudget,
        paletteVibe: selectedVibe,
        customNotes: customPrompt,
      },
    };
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    // Simulate smart proportion-aware curation engine
    setTimeout(() => {
      // Prioritize outfits matching the selected occasion or style
      const matched = [...MOCK_OUTFITS].sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.occasion === selectedOccasion) scoreA += 4;
        if (b.occasion === selectedOccasion) scoreB += 4;
        if (a.style === selectedStyle) scoreA += 3;
        if (b.style === selectedStyle) scoreB += 3;
        if (a.budgetTier === selectedBudget) scoreA += 2;
        if (b.budgetTier === selectedBudget) scoreB += 2;
        return scoreB - scoreA;
      });

      setRecommendations(matched);
      setIsGenerating(false);
      showToast(`Generated personalized ensembles for ${selectedOccasion}.`);
    }, 1200);
  };

  const handlePreview = (outfit: OutfitLook) => {
    setSelectedOutfit(outfit);
    setModalTab('twinPreview');
    setIsModalOpen(true);
  };

  const handleDetails = (outfit: OutfitLook) => {
    setSelectedOutfit(outfit);
    setModalTab('breakdown');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#E7E5DF] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#244D3C] font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#244D3C]" />
            <span>Harmonic Proportions Engine</span>
          </div>
          <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
            Your Personal AI Stylist
          </h1>
          <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
            Tailoring complete garment ensembles based on occasion, drape mechanics, and your
            digital twin measurements.
          </p>
        </div>

        {/* Gemini Integration readiness badge */}
        <div className="flex items-center gap-2 bg-white border border-[#E7E5DF] px-3 py-1.5 text-xs text-[#20211F]/70">
          <Cpu className="w-3.5 h-3.5 text-[#244D3C]" />
          <span>Gemini Pro Styling Grounding Ready</span>
        </div>
      </div>

      {/* Stylist Selector Form Card */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 space-y-8">
        {/* 1. Occasion Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-3">
            Select Occasion
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {OCCASIONS.map(occ => {
              const isSelected = selectedOccasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setSelectedOccasion(occ)}
                  className={`py-3 px-3 text-xs uppercase tracking-wider font-medium border text-center transition-colors ${
                    isSelected
                      ? 'bg-[#244D3C] text-white border-[#244D3C] shadow-2xs'
                      : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Style & Budget row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#E7E5DF]">
          {/* Preferred Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-3">
              Preferred Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map(style => {
                const isSelected = selectedStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`py-2 px-3 text-xs uppercase tracking-wider font-medium border text-center transition-colors ${
                      isSelected
                        ? 'bg-[#20211F] text-white border-[#20211F]'
                        : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-3">
              Budget Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { tier: 'accessible', label: '$ Accessible' },
                  { tier: 'contemporary', label: '$$ Contemporary' },
                  { tier: 'luxury', label: '$$$ Designer' },
                ] as const
              ).map(b => {
                const isSelected = selectedBudget === b.tier;
                return (
                  <button
                    key={b.tier}
                    type="button"
                    onClick={() => setSelectedBudget(b.tier)}
                    className={`py-2 px-2 text-xs uppercase tracking-wider font-medium border text-center transition-colors ${
                      isSelected
                        ? 'bg-[#244D3C] text-white border-[#244D3C]'
                        : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Color Preference Vibe */}
        <div className="pt-4 border-t border-[#E7E5DF]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-3">
            Color Mood & Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLOR_VIBES.map(vibe => {
              const isSelected = selectedVibe === vibe.label;
              return (
                <button
                  key={vibe.label}
                  type="button"
                  onClick={() => setSelectedVibe(vibe.label)}
                  className={`p-3 border text-left transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#244D3C] bg-[#F8F7F4] shadow-2xs'
                      : 'border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                >
                  <span className="text-xs font-medium text-[#20211F] mb-2 block">
                    {vibe.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {vibe.colors.map(col => (
                      <span
                        key={col}
                        className="w-4 h-4 rounded-none border border-black/10"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Optional Custom Notes / Prompt */}
        <div className="pt-4 border-t border-[#E7E5DF]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-1.5">
            Specific Styling Directives (Optional)
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="e.g. Focus on breathable natural linen, sharp outerwear lapels, and comfortable leather shoes."
            className="w-full p-3 bg-[#F8F7F4] border border-[#E7E5DF] text-xs text-[#20211F] focus:outline-none focus:border-[#244D3C]"
          />
        </div>

        {/* Submit Generate Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#20211F]/60">
            {hasProfile ? (
              <span>
                Styling mapped to {profile?.displayName}&apos;s {profile?.measurements.height}cm
                frame.
              </span>
            ) : (
              <span>Standard 175cm base proportions used (Create profile for exact fit).</span>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Outfits...' : 'Generate Outfits'}</span>
          </button>
        </div>
      </div>

      {/* Generated Recommendations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-1">
              Curated Ensembles ({recommendations.length})
            </span>
            <h2 className="text-2xl font-editorial font-medium text-[#20211F]">
              Recommended Looks for {selectedOccasion}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(outfit => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onPreviewOnAvatar={handlePreview}
              onViewDetails={handleDetails}
            />
          ))}
        </div>
      </div>

      {/* Outfit Modal */}
      <OutfitModal
        outfit={selectedOutfit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
};
