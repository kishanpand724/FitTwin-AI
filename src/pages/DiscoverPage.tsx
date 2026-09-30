import React, { useMemo, useState } from 'react';
import { Search, X, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { MOCK_PRODUCTS } from '../services/mockData';
import { ProductCard } from '../components/outfits/ProductCard';
import { ProductItem } from '../types';

export const DiscoverPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const categories = ['All', 'Outerwear', 'Tops', 'Trousers', 'Footwear', 'Accessories'];
  const styles = ['All', 'Minimalist', 'Streetwear', 'Smart Casual', 'Formal', 'Casual', 'Ethnic'];
  const priceRanges = ['All', 'Under $150', '$150 - $300', '$300+'];

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesRetailer = product.retailer.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesStyle = product.style.toLowerCase().includes(query);
        if (!matchesName && !matchesRetailer && !matchesCategory && !matchesStyle) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Style
      if (selectedStyle !== 'All' && product.style !== selectedStyle) {
        return false;
      }

      // Price Range
      if (selectedPriceRange === 'Under $150' && product.price >= 150) {
        return false;
      }
      if (
        selectedPriceRange === '$150 - $300' &&
        (product.price < 150 || product.price > 300)
      ) {
        return false;
      }
      if (selectedPriceRange === '$300+' && product.price <= 300) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; // featured default
    });
  }, [searchQuery, selectedCategory, selectedStyle, selectedPriceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStyle('All');
    setSelectedPriceRange('All');
    setSortBy('featured');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E7E5DF] pb-6">
        <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-1">
          Catalog & Retail Partners
        </span>
        <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
          Discover Outfits & Garments
        </h1>
        <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
          Independent labels and established luxury houses calibrated for physical silhouette
          compatibility.
        </p>
      </div>

      {/* Search and Main Filters Bar */}
      <div className="bg-white border border-[#E7E5DF] p-4 lg:p-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#20211F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by garment title, label (COS, Lemaire, Totême), or silhouette..."
            className="w-full pl-10 pr-10 py-3 bg-[#F8F7F4] border border-[#E7E5DF] text-xs text-[#20211F] placeholder:text-[#20211F]/40 focus:outline-none focus:border-[#244D3C]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#20211F]/50 hover:text-[#20211F]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Category Tabs (Segmented control) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20211F]/50 mr-1.5 hidden sm:inline">
              Category
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#244D3C] text-white border-[#244D3C]'
                    : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20211F]/50">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              className="bg-[#F8F7F4] border border-[#E7E5DF] text-xs py-1.5 px-3 uppercase tracking-wider font-medium text-[#20211F] focus:outline-none focus:border-[#244D3C]"
            >
              <option value="featured">Featured Curation</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter: Style & Price Range */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#E7E5DF] text-xs">
          {/* Style Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20211F]/50">
              Style:
            </span>
            <select
              value={selectedStyle}
              onChange={e => setSelectedStyle(e.target.value)}
              className="bg-[#F8F7F4] border border-[#E7E5DF] text-xs py-1 px-2.5 text-[#20211F] focus:outline-none focus:border-[#244D3C]"
            >
              {styles.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20211F]/50">
              Price Range:
            </span>
            <select
              value={selectedPriceRange}
              onChange={e => setSelectedPriceRange(e.target.value)}
              className="bg-[#F8F7F4] border border-[#E7E5DF] text-xs py-1 px-2.5 text-[#20211F] focus:outline-none focus:border-[#244D3C]"
            >
              {priceRanges.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'All' ||
            selectedStyle !== 'All' ||
            selectedPriceRange !== 'All' ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#244D3C] hover:underline uppercase tracking-wider font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#20211F]/60">
        <span>
          Showing <span className="font-semibold text-[#20211F]">{filteredProducts.length}</span>{' '}
          curated items
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-[#E7E5DF] my-8">
          <p className="text-sm font-medium text-[#20211F] mb-1">
            No garments match your active filters.
          </p>
          <p className="text-xs text-[#20211F]/60 mb-4">
            Try adjusting your search terms or expanding your style and price criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#244D3C] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#19382C] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
