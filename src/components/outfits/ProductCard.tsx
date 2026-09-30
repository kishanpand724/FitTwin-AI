import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { ProductItem } from '../../types';
import { useProfile } from '../../context/ProfileContext';

interface ProductCardProps {
  product: ProductItem;
  onOpenProduct?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenProduct }) => {
  const { isProductSaved, toggleSaveProduct } = useProfile();
  const saved = isProductSaved(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProduct(product);
  };

  const handleView = () => {
    if (onOpenProduct) {
      onOpenProduct(product);
    } else {
      window.open(product.productUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="group bg-white border border-[#E7E5DF] hover:border-[#20211F]/30 transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-4/5 w-full bg-[#F6F5F1] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {product.isNewArrival && (
            <span className="absolute top-3 left-3 bg-[#20211F] text-white text-[10px] font-mono uppercase tracking-widest px-2 py-0.5">
              New Arrival
            </span>
          )}

          {/* Save Button */}
          <button
            onClick={handleToggle}
            className={`absolute top-3 right-3 p-2 border transition-colors shadow-2xs ${
              saved
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white/90 backdrop-blur-xs text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
            title={saved ? 'Remove from saved' : 'Save item'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Metadata */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-[#20211F]/60 mb-1">
            <span className="uppercase tracking-wider text-[11px] font-medium text-[#244D3C]">
              {product.retailer}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.style}</span>
            </div>
          </div>

          <h4 className="text-sm font-medium text-[#20211F] line-clamp-1 group-hover:text-[#244D3C] transition-colors mb-2">
            {product.name}
          </h4>

          <span className="text-sm font-semibold text-[#20211F] tabular-nums block">
            ${product.price}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleView}
          className="w-full py-2 bg-[#F8F7F4] hover:bg-[#E8EDE7] border border-[#E7E5DF] hover:border-[#244D3C] text-[#20211F] hover:text-[#244D3C] text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View Product</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
