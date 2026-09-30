import React from 'react';
import { Bookmark, Sparkles, ArrowUpRight, Shirt } from 'lucide-react';
import { OutfitLook } from '../../types';
import { useProfile } from '../../context/ProfileContext';

interface OutfitCardProps {
  outfit: OutfitLook;
  onPreviewOnAvatar?: (outfit: OutfitLook) => void;
  onViewDetails?: (outfit: OutfitLook) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onPreviewOnAvatar,
  onViewDetails,
}) => {
  const { isLookSaved, saveLook, removeLook } = useProfile();
  const saved = isLookSaved(outfit.id);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeLook(outfit.id);
    } else {
      saveLook(outfit);
    }
  };

  return (
    <div className="group bg-white border border-[#E7E5DF] hover:border-[#20211F]/30 transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Image Container with measured overlay */}
        <div className="relative aspect-3/4 w-full bg-[#F6F5F1] overflow-hidden">
          <img
            src={outfit.imageUrl}
            alt={outfit.name}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Silhouette Match Tag */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] text-[11px] font-semibold text-[#244D3C] flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#244D3C]" />
            <span>{outfit.silhouetteMatchScore}% Match</span>
          </div>

          {/* Quick Save button */}
          <button
            onClick={handleSaveToggle}
            className={`absolute top-3 right-3 p-2 transition-colors border shadow-2xs ${
              saved
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white/90 backdrop-blur-xs text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
            title={saved ? 'Remove from saved' : 'Save look'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Item count tag */}
          <div className="absolute bottom-3 left-3 bg-[#20211F]/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-mono text-[#F8F7F4]">
            {outfit.items.length} PIECES
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5">
          {/* Metadata: clean unboxed text with dot separators */}
          <div className="flex items-center gap-1.5 text-xs text-[#20211F]/60 mb-2">
            <span>{outfit.occasion}</span>
            <span aria-hidden="true">·</span>
            <span>{outfit.style}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{outfit.budgetTier}</span>
          </div>

          <h3 className="text-lg font-editorial font-medium text-[#20211F] group-hover:text-[#244D3C] transition-colors leading-snug mb-2">
            {outfit.name}
          </h3>

          <p className="text-xs text-[#20211F]/70 line-clamp-2 leading-relaxed mb-4">
            {outfit.explanation}
          </p>

          {/* Pieces preview */}
          <div className="pt-3 border-t border-[#E7E5DF] space-y-1 mb-4">
            {outfit.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-[#20211F]/80 truncate pr-2">{item.name}</span>
                <span className="text-[#20211F]/50 tabular-nums shrink-0">
                  {item.currency}{item.price}
                </span>
              </div>
            ))}
            {outfit.items.length > 3 && (
              <span className="text-[11px] text-[#244D3C] font-medium block pt-0.5">
                +{outfit.items.length - 3} more items in look
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 border-t border-[#E7E5DF] mt-2 flex items-center justify-between gap-2 pt-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#20211F]/50 block">
            Est. Total
          </span>
          <span className="text-base font-semibold text-[#20211F] tabular-nums">
            ${outfit.totalPrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPreviewOnAvatar && (
            <button
              onClick={() => onPreviewOnAvatar(outfit)}
              className="px-3 py-1.5 bg-[#F8F7F4] hover:bg-[#E8EDE7] text-[#244D3C] border border-[#E7E5DF] hover:border-[#244D3C] text-xs font-medium uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(outfit)}
              className="p-1.5 border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] transition-colors"
              title="View full outfit details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
