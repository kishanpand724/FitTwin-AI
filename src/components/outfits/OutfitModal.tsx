import React, { useState } from 'react';
import { X, Bookmark, ExternalLink, Sparkles, Check, Shirt, Layers } from 'lucide-react';
import { OutfitLook } from '../../types';
import { useProfile } from '../../context/ProfileContext';
import avatarPreviewImg from '../../assets/images/avatar_digital_twin_1790774648245.jpg';

interface OutfitModalProps {
  outfit: OutfitLook | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'breakdown' | 'twinPreview';
}

export const OutfitModal: React.FC<OutfitModalProps> = ({
  outfit,
  isOpen,
  onClose,
  initialTab = 'breakdown',
}) => {
  const { isLookSaved, saveLook, removeLook, profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'twinPreview'>(initialTab);

  if (!isOpen || !outfit) return null;

  const saved = isLookSaved(outfit.id);

  const handleToggleSave = () => {
    if (saved) {
      removeLook(outfit.id);
    } else {
      saveLook(outfit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20211F]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-[#E7E5DF] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E5DF] bg-[#F8F7F4]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#20211F]/60 mb-1">
              <span>{outfit.occasion}</span>
              <span>·</span>
              <span>{outfit.style}</span>
              <span>·</span>
              <span>{outfit.silhouetteMatchScore}% Silhouette Fit</span>
            </div>
            <h2 className="text-xl md:text-2xl font-editorial font-medium text-[#20211F]">
              {outfit.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 border transition-colors ${
                saved
                  ? 'bg-[#244D3C] text-white border-[#244D3C]'
                  : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save Look'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E7E5DF] bg-white text-xs">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex-1 py-3 font-medium uppercase tracking-wider text-center transition-colors border-b-2 ${
              activeTab === 'breakdown'
                ? 'border-[#244D3C] text-[#244D3C]'
                : 'border-transparent text-[#20211F]/60 hover:text-[#20211F]'
            }`}
          >
            Outfit Pieces Breakdown ({outfit.items.length})
          </button>
          <button
            onClick={() => setActiveTab('twinPreview')}
            className={`flex-1 py-3 font-medium uppercase tracking-wider text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'twinPreview'
                ? 'border-[#244D3C] text-[#244D3C]'
                : 'border-transparent text-[#20211F]/60 hover:text-[#20211F]'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Digital Twin Fit Overlay</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'breakdown' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Big Look Image & Explanation */}
              <div className="md:col-span-5">
                <div className="aspect-3/4 w-full bg-[#F6F5F1] border border-[#E7E5DF] overflow-hidden mb-4">
                  <img
                    src={outfit.imageUrl}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-4 bg-[#F8F7F4] border border-[#E7E5DF]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#244D3C] uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Stylist Fit Rationale</span>
                  </div>
                  <p className="text-xs text-[#20211F]/80 leading-relaxed mb-3">
                    {outfit.explanation}
                  </p>
                  {outfit.matchReason && (
                    <p className="text-xs text-[#20211F]/60 italic border-t border-[#E7E5DF] pt-2">
                      “{outfit.matchReason}”
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Piece by piece items list */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#20211F]/60 font-semibold mb-3">
                    Curated Garment Pieces
                  </h4>

                  <div className="space-y-3">
                    {outfit.items.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 border border-[#E7E5DF] hover:border-[#20211F]/30 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-16 bg-[#F6F5F1] border border-[#E7E5DF] shrink-0 overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#244D3C] font-semibold block">
                              {item.category} · {item.brand}
                            </span>
                            <h5 className="text-sm font-medium text-[#20211F]">{item.name}</h5>
                            {item.color && (
                              <span className="text-xs text-[#20211F]/60 block mt-0.5">
                                Shade: {item.color}
                              </span>
                            )}
                            {item.fitDescription && (
                              <p className="text-[11px] text-[#20211F]/70 mt-1 max-w-sm">
                                {item.fitDescription}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E7E5DF] shrink-0">
                          <span className="text-sm font-semibold text-[#20211F] tabular-nums">
                            {item.currency}{item.price}
                          </span>
                          <a
                            href={item.retailerUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#244D3C] hover:text-[#19382C] flex items-center gap-1 mt-1 font-medium"
                          >
                            <span>Retailer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotal summary */}
                <div className="p-4 bg-[#F8F7F4] border border-[#E7E5DF] mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block">
                      Estimated Combined Ensemble Cost
                    </span>
                    <span className="text-xs text-[#20211F]/70">
                      Based on current verified brand stock
                    </span>
                  </div>
                  <span className="text-xl font-semibold text-[#20211F] tabular-nums">
                    ${outfit.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Digital Twin Fit Overlay simulation */
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative max-w-md w-full aspect-3/4 border border-[#E7E5DF] bg-[#F6F5F1] overflow-hidden">
                <img
                  src={avatarPreviewImg}
                  alt="Digital Twin Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay Silhouette Box */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#20211F]/90 via-[#20211F]/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#244D3C] text-[10px] font-mono uppercase tracking-widest text-[#F8F7F4]">
                      Virtual Fit Mapping
                    </span>
                    <span className="text-xs text-white/80">
                      {profile?.displayName || 'User'} (
                      {profile?.measurements.height || 175}cm)
                    </span>
                  </div>

                  <h3 className="text-lg font-editorial font-medium mb-1">
                    {outfit.name} draped on your Digital Twin
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    Shoulder drape aligned to {profile?.measurements.shoulderWidth || 42}cm span.
                    Waistline rise calculated at {profile?.measurements.waist || 72}cm baseline with
                    zero fabric distortion.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-white/50 block">CHEST TENSION</span>
                      <span className="font-semibold text-[#A6B6A3]">Optimal (0mm)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/50 block">HEM BREAK</span>
                      <span className="font-semibold text-[#A6B6A3]">Slight Break</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/50 block">SLEEVE DROP</span>
                      <span className="font-semibold text-[#A6B6A3]">Natural</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#20211F]/60 mt-4 text-center max-w-sm">
                * Note: Real-time dynamic fabric physics simulation and GLTF garment deformation
                pipeline is under active development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
