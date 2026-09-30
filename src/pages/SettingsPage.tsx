import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  Trash2,
  RefreshCw,
  Ruler,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { UnitSystem } from '../types';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    hasProfile,
    saveProfile,
    clearAllData,
    loadDemoProfile,
    showToast,
  } = useProfile();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [cloudSyncConsent, setCloudSyncConsent] = useState(false);

  const handleUnitChange = (units: UnitSystem) => {
    if (!profile) return;
    saveProfile({
      ...profile,
      units,
      updatedAt: new Date().toISOString(),
    });
    showToast(`Preferred units switched to ${units === 'metric' ? 'Metric (cm/kg)' : 'Imperial (in/lbs)'}`);
  };

  const handleClearAll = () => {
    clearAllData();
    setConfirmClearOpen(false);
    navigate('/');
  };

  return (
    <div className="max-w-4xl space-y-10">
      {/* Header */}
      <div className="border-b border-[#E7E5DF] pb-6">
        <span className="text-xs uppercase tracking-widest text-[#244D3C] font-semibold block mb-1">
          Preferences & Governance
        </span>
        <h1 className="text-3xl font-editorial font-medium text-[#20211F]">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#20211F]/70 mt-1">
          Manage digital twin measurement units, style baselines, and local storage controls.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5DF]">
          <User className="w-4 h-4 text-[#244D3C]" />
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#20211F]">
            Profile Identity
          </h2>
        </div>

        {hasProfile && profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-[10px] text-[#20211F]/60 uppercase block mb-1">
                Display Name
              </span>
              <span className="text-sm font-semibold text-[#20211F]">
                {profile.displayName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#20211F]/60 uppercase block mb-1">
                Age Demographic
              </span>
              <span className="text-sm font-semibold text-[#20211F]">
                {profile.ageRange || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#20211F]/60 uppercase block mb-1">
                Calibrated At
              </span>
              <span className="text-sm font-mono text-[#20211F]">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-xs text-[#20211F]/70">
            <p>No profile identity configured yet.</p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => navigate('/create-profile')}
            className="px-4 py-2 border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] text-xs uppercase tracking-wider font-medium transition-colors"
          >
            {hasProfile ? 'Edit Profile & Measurements' : 'Create Profile Now'}
          </button>
        </div>
      </div>

      {/* 2. Measurement Unit Preferences */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5DF]">
          <Ruler className="w-4 h-4 text-[#244D3C]" />
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#20211F]">
            Measurement Units
          </h2>
        </div>

        <p className="text-xs text-[#20211F]/70">
          Select how bodily proportions and clothing dimensions are displayed across all views.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleUnitChange('metric')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-colors ${
              (profile?.units || 'metric') === 'metric'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            Metric (cm / kg)
          </button>
          <button
            onClick={() => handleUnitChange('imperial')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-colors ${
              profile?.units === 'imperial'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-[#F8F7F4] text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            Imperial (in / lbs)
          </button>
        </div>
      </div>

      {/* 3. Privacy & Biometric Consent */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5DF]">
          <Shield className="w-4 h-4 text-[#244D3C]" />
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#20211F]">
            Privacy & Physical Data Sovereign
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-[#20211F]">
                Local Storage Sandboxing (Active)
              </h4>
              <p className="text-[#20211F]/70 mt-0.5">
                All physical measurements and style preferences are stored strictly inside your
                browser&apos;s localStorage sandbox.
              </p>
            </div>
            <span className="text-[#244D3C] font-semibold shrink-0">Enforced ✓</span>
          </div>

          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#E7E5DF]">
            <div>
              <h4 className="font-semibold text-[#20211F]">
                Opt-in Anonymous Fit Telemetry
              </h4>
              <p className="text-[#20211F]/70 mt-0.5">
                Help improve garment ease algorithms by sending anonymized ratio distributions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={e => setAnalyticsConsent(e.target.checked)}
              className="accent-[#244D3C] w-4 h-4 cursor-pointer mt-1"
            />
          </div>

          <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#E7E5DF]">
            <div>
              <h4 className="font-semibold text-[#20211F]">
                Biometric Cloud Backup Sync
              </h4>
              <p className="text-[#20211F]/70 mt-0.5">
                Disabled in current local prototype version. End-to-end encryption keypair required.
              </p>
            </div>
            <span className="text-[#20211F]/50 font-mono text-[11px] shrink-0">OFFLINE</span>
          </div>
        </div>
      </div>

      {/* 4. Prototype Quick Actions & Data Reset */}
      <div className="bg-white border border-[#E7E5DF] p-6 lg:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5DF]">
          <RefreshCw className="w-4 h-4 text-[#244D3C]" />
          <h2 className="text-base font-semibold uppercase tracking-wider text-[#20211F]">
            Prototype Testing Utilities
          </h2>
        </div>

        <p className="text-xs text-[#20211F]/70">
          Utilities to load pre-calibrated sample fashion personas or purge local browser data for
          testing fresh onboarding.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={loadDemoProfile}
            className="px-4 py-2 bg-[#F8F7F4] hover:bg-[#E8EDE7] border border-[#E7E5DF] text-[#244D3C] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Curated Persona</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Prototype Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Data */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20211F]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white border border-[#E7E5DF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-semibold text-[#20211F]">
                Clear Local Prototype Data?
              </h3>
            </div>
            <p className="text-xs text-[#20211F]/70 leading-relaxed">
              This will erase all saved measurements, customized avatar configurations, and saved
              wardrobe looks from your browser&apos;s localStorage.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#20211F] hover:bg-[#F8F7F4] border border-[#E7E5DF]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
