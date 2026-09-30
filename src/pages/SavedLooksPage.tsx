import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, ArrowUpRight, Shirt, Compass } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { ProductCard } from '../components/outfits/ProductCard';
import { OutfitModal } from '../components/outfits/OutfitModal';
import { EmptyState } from '../components/common/EmptyState';
import { OutfitLook } from '../types';

export const SavedLooksPage: React.FC = () => {
  const { savedLooks, savedProducts, removeLook } = useProfile();
  const [activeTab, setActiveTab] = useState<'outfits' | 'products'>('outfits');
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

  const hasAnySaved = savedLooks.length > 0 || savedProducts.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E7E5DF] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-1">
            Personal Collection
          </span>
          <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
            Saved Wardrobe & Looks
          </h1>
          <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
            Ensembles and garments bookmarking your physical fit and aesthetic intent.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white border border-[#E7E5DF] p-1 text-xs">
          <button
            onClick={() => setActiveTab('outfits')}
            className={`px-4 py-1.5 uppercase tracking-wider font-medium transition-colors ${
              activeTab === 'outfits'
                ? 'bg-[#244D3C] text-white shadow-2xs'
                : 'text-[#20211F]/70 hover:text-[#20211F]'
            }`}
          >
            Outfits ({savedLooks.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 uppercase tracking-wider font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-[#244D3C] text-white shadow-2xs'
                : 'text-[#20211F]/70 hover:text-[#20211F]'
            }`}
          >
            Garments ({savedProducts.length})
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === 'outfits' ? (
        savedLooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLooks.map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onPreviewOnAvatar={handlePreview}
                onViewDetails={handleDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No Saved Outfits Yet"
            description="Explore our AI Stylist to generate tailored ensembles matching your body silhouette, or browse the discover catalog to bookmark your favorite looks."
            actionText="Generate With AI Stylist"
            actionHref="/stylist"
            secondaryActionText="Browse Discover Catalog"
            onSecondaryAction={() => window.location.href = '/discover'}
          />
        )
      ) : savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Shirt}
          title="No Bookmarked Garments"
          description="Browse our curated collection of luxury ateliers and contemporary labels to save individual clothing items."
          actionText="Browse Garment Catalog"
          actionHref="/discover"
        />
      )}

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
