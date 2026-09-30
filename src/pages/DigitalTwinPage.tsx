import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Ruler,
  Edit3,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  Box,
  Share2,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { TwinMannequinViewer } from '../components/twin/TwinMannequinViewer';
import { TwinMeasurementsCard } from '../components/twin/TwinMeasurementsCard';
import { EmptyState } from '../components/common/EmptyState';

export const DigitalTwinPage: React.FC = () => {
  const { profile, hasProfile, loadDemoProfile, showToast } = useProfile();
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      showToast('Avatar mannequin re-rendered with latest coordinate metrics.');
    }, 1800);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Digital Twin configuration link copied to clipboard.');
  };

  if (!hasProfile || !profile) {
    return (
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
            My Digital Twin
          </h1>
          <p className="text-xs text-[#20211F]/60 mt-1 uppercase tracking-wider">
            3D Anatomical Fit Space
          </p>
        </div>

        <EmptyState
          icon={User}
          title="Digital Twin Not Yet Configured"
          description="We need your physical body measurements (shoulder, chest, waist, hip, inseam) to build your 3D digital mannequin. Create your profile to view your twin."
          actionText="Calibrate My Measurements"
          actionHref="/create-profile"
          secondaryActionText="Load Sample Digital Twin"
          onSecondaryAction={loadDemoProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E5DF] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#244D3C] font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#244D3C]" />
            <span>Active Silhouette Calibration</span>
          </div>
          <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
            {profile.displayName}&apos;s Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
            Interactive Euclidean avatar model rendered to your exact millimeter dimensions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2 border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] bg-white transition-colors"
            title="Share or Export Dimensions"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <Link
            to="/create-profile"
            className="px-4 py-2 border border-[#E7E5DF] hover:border-[#20211F] bg-white text-[#20211F] text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Avatar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Viewport on Left, Measurement Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Central 3D Viewer Area */}
        <div className="lg:col-span-8 space-y-4">
          <TwinMannequinViewer
            measurements={profile.measurements}
            isRegenerating={isRegenerating}
            onRegenerate={handleRegenerate}
          />

          {/* Model Loader Note */}
          <div className="p-4 bg-white border border-[#E7E5DF] flex items-start gap-3">
            <Box className="w-5 h-5 text-[#244D3C] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#20211F]">
                Parametric Three.js Mannequin Engine
              </h4>
              <p className="text-xs text-[#20211F]/70 mt-0.5 leading-relaxed">
                Your 3D model dynamically rescales its torso, chest breadth, waist indentation, and
                leg stride to reflect your inputted measurements. Switch to the Editorial tab to view
                the upcoming neural avatar preview.
              </p>
            </div>
          </div>
        </div>

        {/* Measurement Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TwinMeasurementsCard
            measurements={profile.measurements}
            units={profile.units}
            onEditHref="/create-profile"
          />

          {/* Sizing Recommendations Box */}
          <div className="bg-white border border-[#E7E5DF] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#20211F] mb-4 pb-2 border-b border-[#E7E5DF]">
              Garment Sizing Translation
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#E7E5DF]">
                <span className="text-[#20211F]/70">Tailored Overcoat</span>
                <span className="font-semibold text-[#20211F]">
                  EU 48 / US 38R (Drop 6)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E7E5DF]">
                <span className="text-[#20211F]/70">Button-Down Shirts</span>
                <span className="font-semibold text-[#20211F]">Medium (Slim Fit)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#E7E5DF]">
                <span className="text-[#20211F]/70">Trousers Waist / Inseam</span>
                <span className="font-semibold text-[#20211F]">
                  W30 / L32 ({profile.measurements.inseam}cm)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#20211F]/70">Knitwear / Sweaters</span>
                <span className="font-semibold text-[#20211F]">Medium (Regular)</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E7E5DF]">
              <Link
                to="/stylist"
                className="w-full py-2.5 bg-[#F8F7F4] hover:bg-[#E8EDE7] text-[#244D3C] text-xs uppercase tracking-wider font-semibold border border-[#E7E5DF] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Outfits On This Twin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
