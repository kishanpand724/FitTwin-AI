import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Ruler,
  CheckCircle2,
  Compass,
  Shirt,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import heroImg from '../assets/images/hero_fashion_editorial_1790774634384.jpg';
import avatarImg from '../assets/images/avatar_digital_twin_1790774648245.jpg';
import { MOCK_OUTFITS } from '../services/mockData';
import { OutfitCard } from '../components/outfits/OutfitCard';
import { OutfitModal } from '../components/outfits/OutfitModal';
import { OutfitLook } from '../types';
import { useProfile } from '../context/ProfileContext';

export const LandingPage: React.FC = () => {
  const { hasProfile, loadDemoProfile } = useProfile();
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

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center border-b border-[#E7E5DF] overflow-hidden bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Quiet text kicker - zero pill discipline */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#244D3C] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#244D3C]" />
              <span>Next-Generation Fashion Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-medium tracking-tight text-[#20211F] leading-[1.08] text-balance">
              Meet the Future of Your Personal Style.
            </h1>

            <p className="text-base sm:text-lg text-[#20211F]/80 font-light leading-relaxed max-w-xl text-balance">
              Create your digital twin, discover outfits tailored to your preferences, and explore
              fashion in a whole new dimension.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/create-profile"
                className="px-6 py-3.5 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>Create My Digital Twin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={scrollToHowItWorks}
                className="px-6 py-3.5 bg-white border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] text-xs uppercase tracking-widest font-medium transition-colors text-center"
              >
                Explore How It Works
              </button>
            </div>

            {/* Subtle Quick Demo Action */}
            {!hasProfile && (
              <div className="pt-2 flex items-center gap-2 text-xs text-[#20211F]/60">
                <span>Want to see it with data right away?</span>
                <button
                  onClick={loadDemoProfile}
                  className="text-[#244D3C] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Load Sample Digital Twin</span>
                </button>
              </div>
            )}

            {/* Adjacent Proof Metrics */}
            <div className="pt-8 border-t border-[#E7E5DF] grid grid-cols-3 gap-6">
              <div>
                <span className="text-2xl font-editorial font-semibold text-[#20211F] block tabular-nums">
                  0.5 cm
                </span>
                <span className="text-xs text-[#20211F]/60">Contour Precision</span>
              </div>
              <div>
                <span className="text-2xl font-editorial font-semibold text-[#20211F] block tabular-nums">
                  98.4%
                </span>
                <span className="text-xs text-[#20211F]/60">Silhouette Accuracy</span>
              </div>
              <div>
                <span className="text-2xl font-editorial font-semibold text-[#20211F] block tabular-nums">
                  0%
                </span>
                <span className="text-xs text-[#20211F]/60">Sizing Guesswork</span>
              </div>
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/5 sm:aspect-16/11 lg:aspect-4/5 w-full max-w-lg mx-auto bg-[#F6F5F1] border border-[#E7E5DF] shadow-md overflow-hidden">
              <img
                src={heroImg}
                alt="FitTwin AI Fashion Editorial"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Floating contour metrics annotation */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs p-3 border border-[#E7E5DF] text-xs space-y-1 shadow-xs max-w-[200px]">
                <div className="flex items-center gap-1.5 text-[#244D3C] font-semibold text-[11px] uppercase tracking-wider">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Digital Calibration</span>
                </div>
                <div className="text-[11px] text-[#20211F]/80 flex justify-between">
                  <span>Shoulder:</span>
                  <span className="font-mono tabular-nums">42.0 cm</span>
                </div>
                <div className="text-[11px] text-[#20211F]/80 flex justify-between">
                  <span>Torso Rise:</span>
                  <span className="font-mono tabular-nums">72.0 cm</span>
                </div>
                <div className="text-[11px] text-[#20211F]/80 flex justify-between">
                  <span>Drape Index:</span>
                  <span className="font-mono tabular-nums text-[#244D3C]">Optimal</span>
                </div>
              </div>

              {/* Bottom Scrim Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#20211F]/90 backdrop-blur-xs text-white p-3.5 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#244D3C] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-medium block">Personal Stylist Matrix</span>
                    <span className="text-[10px] text-white/60">
                      Synchronized to body shape & style aesthetic
                    </span>
                  </div>
                </div>
                <Link
                  to="/stylist"
                  className="text-xs uppercase tracking-wider text-[#A6B6A3] hover:text-white font-medium"
                >
                  View Styling →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: 3 STEPS */}
      <section id="how-it-works" className="py-20 lg:py-24 border-b border-[#E7E5DF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-2">
              The Architecture of Personal Style
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial font-medium text-[#20211F] text-balance">
              How FitTwin AI Reinvents Your Wardrobe
            </h2>
            <p className="text-sm sm:text-base text-[#20211F]/70 mt-3 font-light leading-relaxed">
              Three simple steps from rough body estimations to a calibrated 3D digital presence
              and impeccably tailored outfit discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 border border-[#E7E5DF] bg-[#F8F7F4] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#244D3C] block mb-4">
                  STEP 01
                </span>
                <h3 className="text-xl font-editorial font-medium text-[#20211F] mb-3">
                  Create Your Digital Twin
                </h3>
                <p className="text-xs sm:text-sm text-[#20211F]/70 leading-relaxed mb-6">
                  Input key measurements—shoulder, chest, waist, hips, and inseam. Our parametric
                  engine generates a proportional 3D mannequin representing your true anatomical
                  silhouette.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                <span className="text-[#20211F]/60">5-Minute Calibration</span>
                <Link
                  to="/create-profile"
                  className="text-[#244D3C] font-semibold uppercase tracking-wider hover:underline"
                >
                  Start →
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 border border-[#E7E5DF] bg-[#F8F7F4] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#244D3C] block mb-4">
                  STEP 02
                </span>
                <h3 className="text-xl font-editorial font-medium text-[#20211F] mb-3">
                  Discover Your Style
                </h3>
                <p className="text-xs sm:text-sm text-[#20211F]/70 leading-relaxed mb-6">
                  Select your occasion, budget tier, and aesthetic preferences. Our AI stylist
                  curates complete ensembles composed of verified garments from renowned design
                  houses and independent labels.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                <span className="text-[#20211F]/60">Proportion-Aware Curation</span>
                <Link
                  to="/stylist"
                  className="text-[#244D3C] font-semibold uppercase tracking-wider hover:underline"
                >
                  Explore →
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 border border-[#E7E5DF] bg-[#F8F7F4] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#244D3C] block mb-4">
                  STEP 03
                </span>
                <h3 className="text-xl font-editorial font-medium text-[#20211F] mb-3">
                  Explore Your Look
                </h3>
                <p className="text-xs sm:text-sm text-[#20211F]/70 leading-relaxed mb-6">
                  Inspect every garment piece, analyze shoulder drop and hem break ratios on your
                  avatar, save high-confidence looks to your wardrobe, and acquire pieces with
                  absolute sizing confidence.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                <span className="text-[#20211F]/60">Zero Sizing Guesswork</span>
                <Link
                  to="/discover"
                  className="text-[#244D3C] font-semibold uppercase tracking-wider hover:underline"
                >
                  Browse →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED OUTFITS SECTION */}
      <section className="py-20 lg:py-24 border-b border-[#E7E5DF] bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-2">
                Curated Haute & Prêt-à-Porter
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-medium text-[#20211F]">
                Featured Outfit Formats
              </h2>
            </div>
            <Link
              to="/discover"
              className="text-xs uppercase tracking-widest text-[#244D3C] hover:text-[#19382C] font-medium flex items-center gap-1"
            >
              <span>Explore All Catalog Pieces</span>
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
      </section>

      {/* 4. BENEFITS SECTION */}
      <section className="py-20 lg:py-24 border-b border-[#E7E5DF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-2">
                Conscious Wardrobe Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-medium text-[#20211F] leading-tight mb-4 text-balance">
                Precision Over Plastic Vanity Sizing.
              </h2>
              <p className="text-sm text-[#20211F]/70 font-light leading-relaxed mb-6">
                Fashion returns account for millions of tons of landfill waste each year because
                clothing labels arbitrary define ‘Medium’ and ‘Size 6’. FitTwin AI roots every
                recommendation in physical Euclidean measurements.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#20211F]">
                      Proportional Harmony
                    </h4>
                    <p className="text-xs text-[#20211F]/70">
                      Algorithms analyze shoulder-to-waist and torso-to-leg proportions to recommend
                      garment cuts that genuinely flatter your posture.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#20211F]">
                      Zero Return Anxiety
                    </h4>
                    <p className="text-xs text-[#20211F]/70">
                      Know your exact ease allowance (tight, tailored, relaxed, oversized) before
                      purchasing from any luxury or independent retailer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#20211F]">
                      Total Aesthetic Freedom
                    </h4>
                    <p className="text-xs text-[#20211F]/70">
                      From minimalist Scandi tailoring to Japanese selvedge denim and modern ethnic
                      drapes, your twin learns your visual preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 border border-[#E7E5DF] bg-[#F8F7F4]">
                  <Ruler className="w-6 h-6 text-[#244D3C] mb-3 stroke-[1.5]" />
                  <h4 className="text-base font-editorial font-medium text-[#20211F] mb-1">
                    Exact Centimeter Fit
                  </h4>
                  <p className="text-xs text-[#20211F]/70 leading-relaxed">
                    Custom garment easing matched against your 7 key anatomical measurement anchors.
                  </p>
                </div>

                <div className="p-6 border border-[#E7E5DF] bg-[#F8F7F4]">
                  <Sparkles className="w-6 h-6 text-[#244D3C] mb-3 stroke-[1.5]" />
                  <h4 className="text-base font-editorial font-medium text-[#20211F] mb-1">
                    Occasion Context
                  </h4>
                  <p className="text-xs text-[#20211F]/70 leading-relaxed">
                    Styling tailored specifically for gala dinners, executive boardrooms, weekend
                    getaways, or everyday street style.
                  </p>
                </div>

                <div className="p-6 border border-[#E7E5DF] bg-[#F8F7F4]">
                  <Shirt className="w-6 h-6 text-[#244D3C] mb-3 stroke-[1.5]" />
                  <h4 className="text-base font-editorial font-medium text-[#20211F] mb-1">
                    Fabric Drape Metrics
                  </h4>
                  <p className="text-xs text-[#20211F]/70 leading-relaxed">
                    Evaluation of textile weight—from 280gsm heavyweight cotton to crisp raw silk
                    and barathea wool.
                  </p>
                </div>

                <div className="p-6 border border-[#E7E5DF] bg-[#F8F7F4]">
                  <ShieldCheck className="w-6 h-6 text-[#244D3C] mb-3 stroke-[1.5]" />
                  <h4 className="text-base font-editorial font-medium text-[#20211F] mb-1">
                    Private Local Data
                  </h4>
                  <p className="text-xs text-[#20211F]/70 leading-relaxed">
                    Your body dimensions remain stored securely on your device with complete export
                    and erasure rights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 lg:py-24 bg-[#244D3C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#A6B6A3] font-semibold block">
            Begin Your Digital Fit Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-editorial font-medium tracking-tight leading-tight text-balance">
            Your body. Your style. Your digital twin.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-light leading-relaxed">
            Calibration takes under five minutes. Experience the confidence of knowing how garments
            fall before you order.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create-profile"
              className="px-8 py-4 bg-white text-[#244D3C] hover:bg-[#F8F7F4] text-xs uppercase tracking-widest font-semibold transition-colors shadow-md"
            >
              Create My Digital Twin Now
            </Link>
            <Link
              to="/stylist"
              className="px-8 py-4 border border-white/30 hover:border-white text-white text-xs uppercase tracking-widest font-medium transition-colors"
            >
              Test Stylist Without Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Outfit Modal for breakdowns / preview */}
      <OutfitModal
        outfit={selectedOutfit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
};
