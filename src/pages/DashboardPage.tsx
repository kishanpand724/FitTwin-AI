import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Ruler,
  Compass,
  Bookmark,
  User,
  ArrowRight,
  TrendingUp,
  Shirt,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { TwinMeasurementsCard } from '../components/twin/TwinMeasurementsCard';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { ProductCard } from '../components/outfits/ProductCard';
import { OutfitModal } from '../components/outfits/OutfitModal';
import { EmptyState } from '../components/common/EmptyState';
import { MOCK_OUTFITS, MOCK_PRODUCTS } from '../services/mockData';
import { OutfitLook, ProductItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { profile, hasProfile, savedLooks, savedProducts, loadDemoProfile } = useProfile();
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitLook | null>(null);
  const [modalTab, setModalTab] = useState<'breakdown' | 'twinPreview'>('breakdown');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // If user has not created a profile yet, show a proper empty state (per prompt instructions: "If the user has not created a profile, show a proper empty state encouraging them to create their digital twin. Do not display fabricated profile information.")
  if (!hasProfile || !profile) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
            Dashboard
          </h1>
          <p className="text-xs text-[#20211F]/60 mt-1 uppercase tracking-wider">
            Personal Wardrobe & Sizing Center
          </p>
        </div>

        <EmptyState
          icon={User}
          title="No Digital Twin Calibrated Yet"
          description="Create your digital twin by recording your key body measurements. Once calibrated, your dashboard will calculate exact silhouette ratios, recommend proportional looks, and monitor fit metrics."
          actionText="Create My Digital Twin"
          actionHref="/create-profile"
          secondaryActionText="Load Sample Demo Profile"
          onSecondaryAction={loadDemoProfile}
        />
      </div>
    );
  }

  // Calculate profile completion score based on filled fields
  let completionScore = 60; // base for having profile
  if (profile.measurements.weight) completionScore += 10;
  if (profile.appearance.hairStyle) completionScore += 10;
  if (profile.preferences.styles.length >= 2) completionScore += 10;
  if (profile.preferences.favoriteColors.length > 0) completionScore += 10;

  return (
    <div className="space-y-10">
      {/* 1. Header Greeting & Profile Completion Bar */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#244D3C] font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#244D3C]" />
            <span>Digital Twin Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-medium text-[#20211F]">
            Welcome back, {profile.displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
            Your silhouette metrics are synchronized. Discover looks curated for your proportions.
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-[#F8F7F4] border border-[#E7E5DF] p-4 min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#20211F] uppercase tracking-wider text-[11px]">
              Twin Calibration
            </span>
            <span className="font-mono text-[#244D3C] font-semibold tabular-nums">
              {completionScore}%
            </span>
          </div>
          <div className="w-full bg-[#E7E5DF] h-1.5 rounded-none overflow-hidden">
            <div
              className="bg-[#244D3C] h-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <span className="text-[10px] text-[#20211F]/60 block mt-1.5">
            {completionScore === 100
              ? 'Complete profile calibrated'
              : 'Add weight or reference photo for full calibration'}
          </span>
        </div>
      </div>

      {/* 2. Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/stylist"
          className="p-4 bg-white border border-[#E7E5DF] hover:border-[#244D3C] hover:bg-[#F8F7F4] transition-all flex flex-col justify-between group"
        >
          <Sparkles className="w-5 h-5 text-[#244D3C] mb-3 group-hover:scale-105 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#20211F] block">
              Generate Outfit
            </span>
            <span className="text-[11px] text-[#20211F]/60 block mt-0.5">
              Occasion styling
            </span>
          </div>
        </Link>

        <Link
          to="/digital-twin"
          className="p-4 bg-white border border-[#E7E5DF] hover:border-[#244D3C] hover:bg-[#F8F7F4] transition-all flex flex-col justify-between group"
        >
          <User className="w-5 h-5 text-[#244D3C] mb-3 group-hover:scale-105 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#20211F] block">
              3D Twin Viewport
            </span>
            <span className="text-[11px] text-[#20211F]/60 block mt-0.5">
              Inspect drape
            </span>
          </div>
        </Link>

        <Link
          to="/create-profile"
          className="p-4 bg-white border border-[#E7E5DF] hover:border-[#244D3C] hover:bg-[#F8F7F4] transition-all flex flex-col justify-between group"
        >
          <Ruler className="w-5 h-5 text-[#244D3C] mb-3 group-hover:scale-105 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#20211F] block">
              Edit Measurements
            </span>
            <span className="text-[11px] text-[#20211F]/60 block mt-0.5">
              Recalibrate metrics
            </span>
          </div>
        </Link>

        <Link
          to="/discover"
          className="p-4 bg-white border border-[#E7E5DF] hover:border-[#244D3C] hover:bg-[#F8F7F4] transition-all flex flex-col justify-between group"
        >
          <Compass className="w-5 h-5 text-[#244D3C] mb-3 group-hover:scale-105 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#20211F] block">
              Browse Catalog
            </span>
            <span className="text-[11px] text-[#20211F]/60 block mt-0.5">
              Filter by style
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Digital Twin Summary & Silhouette Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TwinMeasurementsCard
            measurements={profile.measurements}
            units={profile.units}
            onEditHref="/create-profile"
          />
        </div>

        {/* Style Persona Summary */}
        <div className="lg:col-span-5 bg-white border border-[#E7E5DF] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7E5DF]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                Aesthetic Persona
              </span>
              <Link
                to="/settings"
                className="text-xs text-[#244D3C] hover:underline uppercase tracking-wider"
              >
                Preferences
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#20211F]/50 block mb-1.5">
                  Target Aesthetics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferences.styles.map(style => (
                    <span
                      key={style}
                      className="px-2.5 py-1 bg-[#F8F7F4] border border-[#E7E5DF] text-xs font-medium text-[#20211F]"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#20211F]/50 block mb-1.5">
                  Preferred Color Spectrum
                </span>
                <div className="flex items-center gap-2">
                  {profile.preferences.favoriteColors.map(color => (
                    <div
                      key={color}
                      className="w-6 h-6 border border-[#E7E5DF]"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#20211F]/50 block mb-1">
                  Budget Profile
                </span>
                <span className="text-sm font-semibold capitalize text-[#244D3C]">
                  {profile.preferences.budgetTier} Tier
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E5DF] mt-6 flex items-center justify-between">
            <span className="text-xs text-[#20211F]/60">Need quick occasion advice?</span>
            <Link
              to="/stylist"
              className="text-xs font-medium text-[#244D3C] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>Consult Stylist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recommended Outfits Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-1">
              Precision Fit Matching
            </span>
            <h2 className="text-2xl font-editorial font-medium text-[#20211F]">
              Recommended for Your Proportions
            </h2>
          </div>
          <Link
            to="/stylist"
            className="text-xs uppercase tracking-wider text-[#244D3C] hover:text-[#19382C] font-semibold flex items-center gap-1"
          >
            <span>Full AI Stylist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_OUTFITS.slice(0, 3).map(outfit => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onPreviewOnAvatar={handlePreview}
              onViewDetails={handleDetails}
            />
          ))}
        </div>
      </div>

      {/* 5. Saved Looks Preview & Recently Viewed Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Saved Looks Summary */}
        <div className="lg:col-span-6 bg-white border border-[#E7E5DF] p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5DF]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#244D3C]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#20211F]">
                Saved Looks ({savedLooks.length})
              </h3>
            </div>
            <Link
              to="/saved"
              className="text-xs uppercase tracking-wider text-[#244D3C] hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          {savedLooks.length > 0 ? (
            <div className="space-y-3">
              {savedLooks.slice(0, 3).map(look => (
                <div
                  key={look.id}
                  onClick={() => handleDetails(look)}
                  className="p-3 border border-[#E7E5DF] hover:border-[#20211F]/30 cursor-pointer flex items-center justify-between gap-3 transition-colors bg-[#F8F7F4]/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={look.imageUrl}
                      alt={look.name}
                      className="w-12 h-14 object-cover border border-[#E7E5DF]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-[#20211F]">{look.name}</h4>
                      <span className="text-[11px] text-[#20211F]/60">
                        {look.occasion} · {look.items.length} items
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#20211F] tabular-nums">
                    ${look.totalPrice}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#20211F]/60">
              <p>No outfits saved to your wardrobe yet.</p>
              <Link
                to="/stylist"
                className="text-[#244D3C] font-semibold underline mt-2 inline-block uppercase tracking-wider text-[11px]"
              >
                Generate an ensemble
              </Link>
            </div>
          )}
        </div>

        {/* Recently Viewed Products */}
        <div className="lg:col-span-6 bg-white border border-[#E7E5DF] p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5DF]">
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#244D3C]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#20211F]">
                Curated Garments
              </h3>
            </div>
            <Link
              to="/discover"
              className="text-xs uppercase tracking-wider text-[#244D3C] hover:underline font-medium"
            >
              Catalog
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MOCK_PRODUCTS.slice(0, 2).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
