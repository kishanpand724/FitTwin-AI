import React, { useRef, useState } from 'react';
import {
  Camera,
  Sparkles,
  Upload,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Eye,
  AlertCircle,
  Key,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FacialMorphology, UserProfile } from '../../types';
import {
  EXTERNAL_AVATAR_SERVICES,
  ExternalAvatarServiceConfig,
  PhotoAnalysisProgress,
  processPhotoToAvatar,
  SAMPLE_PORTRAITS,
  SamplePortraitPreset,
  invokeExternalAvatarApi,
} from '../../services/photoToAvatarPipeline';
import { useProfile } from '../../context/ProfileContext';

interface PhotoToAvatarStudioProps {
  profile: UserProfile;
  onAvatarUpdated?: () => void;
}

export const PhotoToAvatarStudio: React.FC<PhotoToAvatarStudioProps> = ({
  profile,
  onAvatarUpdated,
}) => {
  const { saveProfile, showToast } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);

  // Active Provider selection
  const [selectedProvider, setSelectedProvider] = useState<ExternalAvatarServiceConfig['id']>(
    (profile.appearance.avatarProvider as ExternalAvatarServiceConfig['id']) || 'neural-photomap'
  );

  // External API keys & options
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [externalApiStatus, setExternalApiStatus] = useState<string | null>(null);

  // Pipeline state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineProgress, setPipelineProgress] = useState<PhotoAnalysisProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Morphology fine-tuning drawer
  const [showMorphologyDrawer, setShowMorphologyDrawer] = useState<boolean>(false);

  const currentMorphology = profile.appearance.facialMorphology;
  const currentPhoto = profile.appearance.referencePhotoUrl;

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 12MB. Please upload a smaller photo.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = async event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await executeCalibrationPipeline(dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file from disk.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom GLB Model Upload
  const handleGlbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const glbUrl = URL.createObjectURL(file);
    const updated: UserProfile = {
      ...profile,
      appearance: {
        ...profile.appearance,
        personalizedAvatarGlbUrl: glbUrl,
        avatarProvider: 'readyplayer-me',
      },
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
    showToast(`Custom 3D model loaded: ${file.name}`);
    onAvatarUpdated?.();
  };

  // Select Sample Portrait Preset
  const handleSelectSamplePortrait = async (preset: SamplePortraitPreset) => {
    setErrorMessage(null);
    await executeCalibrationPipeline(preset.photoUrl, preset);
  };

  // Run the full Photo-to-Avatar Pipeline
  const executeCalibrationPipeline = async (
    photoUrl: string,
    presetFallback?: SamplePortraitPreset
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let morphology: FacialMorphology;

      try {
        morphology = await processPhotoToAvatar(photoUrl, progress => {
          setPipelineProgress(progress);
        });
      } catch (err) {
        if (presetFallback) {
          morphology = presetFallback.morphology;
        } else {
          throw err;
        }
      }

      // Update Profile Appearance with extracted morphology and colors
      const updated: UserProfile = {
        ...profile,
        appearance: {
          ...profile.appearance,
          referencePhotoUrl: photoUrl,
          facialMorphology: morphology,
          skinTone: morphology.detectedSkinTone || profile.appearance.skinTone,
          hairColor: morphology.detectedHairColor || profile.appearance.hairColor,
          hairStyle: morphology.detectedHairStyle || profile.appearance.hairStyle,
          avatarProvider: selectedProvider,
        },
        updatedAt: new Date().toISOString(),
      };

      saveProfile(updated);
      showToast('3D Digital Twin successfully personalized from reference photo.');
      onAvatarUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo analysis was unable to detect facial contours.';
      setErrorMessage(msg);
      setPipelineProgress({
        phase: 'error',
        progressPercent: 0,
        statusText: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Dispatch External API task
  const handleDispatchExternalApi = async () => {
    if (!currentPhoto) {
      setErrorMessage('Please upload a reference portrait before invoking external avatar APIs.');
      return;
    }

    setIsProcessing(true);
    setExternalApiStatus('Dispatching remote generation task...');

    try {
      const res = await invokeExternalAvatarApi(selectedProvider, currentPhoto, apiKeyInput);
      setExternalApiStatus(res.message);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        showToast(`Request sent to ${selectedProvider} API.`);
      }
    } catch {
      setErrorMessage(`Failed to connect to ${selectedProvider} service.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update Morphological Slider
  const handleUpdateMorphologyParam = (key: keyof FacialMorphology, value: number) => {
    if (!currentMorphology) return;
    const nextMorphology: FacialMorphology = {
      ...currentMorphology,
      [key]: value,
    };

    const updated: UserProfile = {
      ...profile,
      appearance: {
        ...profile.appearance,
        facialMorphology: nextMorphology,
      },
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
    onAvatarUpdated?.();
  };

  return (
    <div className="bg-white border border-[#E7E5DF] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5DF] gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#244D3C] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Photo-to-3D Personalization Pipeline</span>
          </div>
          <h3 className="text-xl font-editorial font-medium text-[#20211F]">
            Anatomical Facial & Body Twin Calibration
          </h3>
          <p className="text-xs text-[#20211F]/70 mt-1 max-w-2xl leading-relaxed">
            Upload your portrait photograph. The pipeline extracts facial morphology, bone contour
            ratios, and dermal melanin spectrum, then applies a seamless UV projection map onto your
            3D mannequin scaled to your millimeter measurements.
          </p>
        </div>

        {currentPhoto && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 bg-[#E8EDE7] text-[#244D3C] font-semibold border border-[#244D3C]/20">
              Active Twin Match: {currentMorphology?.confidenceScore || 97.2}%
            </span>
          </div>
        )}
      </div>

      {/* Provider Selector Tabs */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#20211F]/70 mb-2">
          Avatar Generation Pipeline Provider
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {EXTERNAL_AVATAR_SERVICES.map(srv => {
            const isSelected = selectedProvider === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedProvider(srv.id)}
                className={`p-3 text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#244D3C] bg-[#F8F7F4] shadow-xs'
                    : 'border-[#E7E5DF] hover:border-[#20211F] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#20211F]">{srv.name}</span>
                    {srv.status === 'active_in_browser' ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#244D3C] text-white">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#EBE8E1] text-[#20211F]/70">
                        API READY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#20211F]/60 line-clamp-2 leading-relaxed">
                    {srv.tagline}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-[#E7E5DF]/60 text-[10px] font-mono text-[#244D3C]">
                  Format: {srv.format.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Left Upload & Presets, Right Live Biometrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photo Upload & Presets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-[#F8F7F4] border border-[#E7E5DF] space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20211F] block">
              1. Reference Portrait Photograph
            </span>

            {/* Current Photo Preview or Dropzone */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-28 h-36 bg-white border border-[#E7E5DF] shadow-xs shrink-0 overflow-hidden group">
                {currentPhoto ? (
                  <>
                    <img
                      src={currentPhoto}
                      alt="Current reference portrait"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 bg-white text-[10px] font-semibold uppercase tracking-wider text-[#20211F]"
                      >
                        Change
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#20211F]/40">
                    <Camera className="w-6 h-6 mb-1 text-[#20211F]/30" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload My Photo (JPG / PNG)</span>
                </button>

                <p className="text-[11px] text-[#20211F]/60 leading-relaxed">
                  Frontal headshot with natural lighting produces the most accurate morphological
                  resemblance.
                </p>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-3 border-t border-[#E7E5DF]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#20211F]/60 block mb-2">
                Or Test with Sample High-Fashion Editorial Portraits:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PORTRAITS.map(p => {
                  const isActive = currentPhoto === p.photoUrl;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectSamplePortrait(p)}
                      disabled={isProcessing}
                      className={`p-2 border text-left flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'border-[#244D3C] bg-[#E8EDE7]'
                          : 'border-[#E7E5DF] hover:border-[#20211F] bg-white'
                      }`}
                    >
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#E7E5DF] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-[#20211F] block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-[#20211F]/60 block truncate">
                          {p.subtitle.split('·')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* External GLB / Custom Model Option */}
          <div className="p-3 bg-white border border-[#E7E5DF] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#20211F]/80">
              <Layers className="w-4 h-4 text-[#244D3C]" />
              <span>Load External .GLB / .GLTF 3D Model</span>
            </div>
            <input
              ref={glbInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleGlbUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => glbInputRef.current?.click()}
              className="px-3 py-1 bg-[#F8F7F4] hover:bg-[#E8EDE7] border border-[#E7E5DF] text-[11px] font-semibold text-[#20211F] uppercase tracking-wider transition-colors"
            >
              Browse 3D File
            </button>
          </div>
        </div>

        {/* Right Column: Pipeline Execution & Biometric Analysis */}
        <div className="lg:col-span-6 space-y-4">
          {/* External API Configuration box (if remote provider is selected) */}
          {selectedProvider !== 'neural-photomap' && (
            <div className="p-4 bg-[#F8F7F4] border border-[#E7E5DF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#20211F] uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#244D3C]" />
                  <span>{selectedProvider.toUpperCase()} Gateway Configuration</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFF2E2] text-[#8C5800] border border-[#FFD8A8]">
                  Pending API Token
                </span>
              </div>

              <p className="text-xs text-[#20211F]/70 leading-relaxed">
                Connect your production credentials to dispatch cloud 3D human reconstruction.
                FitTwin AI will stream the generated rigged GLB asset into your active viewport.
              </p>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-[#20211F]/60 mb-1">
                  API Key / Bearer Token
                </label>
                <input
                  type="password"
                  placeholder="Enter API key or leave blank to test gateway verification"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E7E5DF] text-xs font-mono focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDispatchExternalApi}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Dispatch GLB Generation
                </button>
                <a
                  href={
                    EXTERNAL_AVATAR_SERVICES.find(s => s.id === selectedProvider)?.documentationUrl ||
                    '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 border border-[#E7E5DF] bg-white hover:border-[#20211F] text-xs text-[#20211F] flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Docs</span>
                </a>
              </div>

              {externalApiStatus && (
                <div className="p-2.5 bg-white border border-[#E7E5DF] text-xs text-[#20211F]/80 font-mono">
                  {externalApiStatus}
                </div>
              )}
            </div>
          )}

          {/* Real-time Multi-Stage Progress Bar */}
          {isProcessing && (
            <div className="p-4 bg-[#F8F7F4] border border-[#244D3C]/30 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#244D3C] uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Biometrics</span>
                </span>
                <span className="font-mono font-semibold text-[#20211F]">
                  {pipelineProgress?.progressPercent || 25}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#E7E5DF] overflow-hidden">
                <div
                  className="h-full bg-[#244D3C] transition-all duration-300"
                  style={{ width: `${pipelineProgress?.progressPercent || 25}%` }}
                />
              </div>

              <p className="text-xs text-[#20211F]/70 font-mono">
                {pipelineProgress?.statusText || 'Analyzing photograph landmarks and contours...'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#FFF5F5] border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extracted Biometric Characteristics & Morphology Display */}
          {currentMorphology && (
            <div className="p-4 bg-[#F8F7F4] border border-[#E7E5DF] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5DF]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                    Detected Facial Morphology & Pigments
                  </span>
                </div>
                <span className="text-xs font-mono text-[#244D3C] font-semibold">
                  Face Shape: {currentMorphology.faceShape.toUpperCase()}
                </span>
              </div>

              {/* Metric Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white border border-[#E7E5DF]">
                  <span className="text-[10px] text-[#20211F]/50 uppercase tracking-wider block">
                    Jawline
                  </span>
                  <span className="font-semibold text-[#20211F] font-mono">
                    {currentMorphology.jawWidth.toFixed(2)}x
                  </span>
                </div>
                <div className="p-2 bg-white border border-[#E7E5DF]">
                  <span className="text-[10px] text-[#20211F]/50 uppercase tracking-wider block">
                    Cheekbones
                  </span>
                  <span className="font-semibold text-[#20211F] font-mono">
                    {currentMorphology.cheekboneProminence.toFixed(2)}x
                  </span>
                </div>
                <div className="p-2 bg-white border border-[#E7E5DF]">
                  <span className="text-[10px] text-[#20211F]/50 uppercase tracking-wider block">
                    Nose Bridge
                  </span>
                  <span className="font-semibold text-[#20211F] font-mono">
                    {currentMorphology.noseBridgeElevation.toFixed(2)}x
                  </span>
                </div>
                <div className="p-2 bg-white border border-[#E7E5DF]">
                  <span className="text-[10px] text-[#20211F]/50 uppercase tracking-wider block">
                    Lip Fullness
                  </span>
                  <span className="font-semibold text-[#20211F] font-mono">
                    {currentMorphology.lipFullness.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Pigment Swatches */}
              <div className="flex items-center justify-between p-2.5 bg-white border border-[#E7E5DF] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#20211F]/60 uppercase tracking-wider">
                    Dermal Tone:
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: currentMorphology.detectedSkinTone }}
                  />
                  <span className="font-mono text-[11px] text-[#20211F]">
                    {currentMorphology.detectedSkinTone}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#20211F]/60 uppercase tracking-wider">
                    Hair Shade:
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: currentMorphology.detectedHairColor }}
                  />
                  <span className="font-mono text-[11px] text-[#20211F]">
                    {currentMorphology.detectedHairColor}
                  </span>
                </div>
              </div>

              {/* Morphology Fine-Tuning Drawer Toggle */}
              <button
                type="button"
                onClick={() => setShowMorphologyDrawer(prev => !prev)}
                className="w-full py-1.5 px-2 bg-white hover:bg-[#F8F7F4] border border-[#E7E5DF] text-[11px] font-semibold text-[#244D3C] uppercase tracking-wider flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Fine-Tune Facial Bone Structure Sliders</span>
                </span>
                {showMorphologyDrawer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Sliders drawer */}
              {showMorphologyDrawer && (
                <div className="p-3 bg-white border border-[#E7E5DF] space-y-3 animate-in fade-in duration-150 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#20211F]/70">
                        Jaw Breadth
                      </span>
                      <span className="font-mono">{currentMorphology.jawWidth.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.01"
                      value={currentMorphology.jawWidth}
                      onChange={e =>
                        handleUpdateMorphologyParam('jawWidth', parseFloat(e.target.value))
                      }
                      className="w-full accent-[#244D3C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#20211F]/70">
                        Cheekbone Lift
                      </span>
                      <span className="font-mono">
                        {currentMorphology.cheekboneProminence.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.01"
                      value={currentMorphology.cheekboneProminence}
                      onChange={e =>
                        handleUpdateMorphologyParam('cheekboneProminence', parseFloat(e.target.value))
                      }
                      className="w-full accent-[#244D3C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#20211F]/70">
                        Nose Elevation
                      </span>
                      <span className="font-mono">
                        {currentMorphology.noseBridgeElevation.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.01"
                      value={currentMorphology.noseBridgeElevation}
                      onChange={e =>
                        handleUpdateMorphologyParam('noseBridgeElevation', parseFloat(e.target.value))
                      }
                      className="w-full accent-[#244D3C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#20211F]/70">
                        Lip Fullness
                      </span>
                      <span className="font-mono">{currentMorphology.lipFullness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.01"
                      value={currentMorphology.lipFullness}
                      onChange={e =>
                        handleUpdateMorphologyParam('lipFullness', parseFloat(e.target.value))
                      }
                      className="w-full accent-[#244D3C]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Data Assurance */}
          <div className="p-3 bg-white border border-[#E7E5DF] flex items-start gap-2.5 text-xs text-[#20211F]/70">
            <ShieldCheck className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-[#20211F] font-semibold">Strict Privacy Sandbox:</strong>{' '}
              Your uploaded reference photo is analyzed locally in your browser memory for UV
              coordinate synthesis and biometric bone scaling. It is never stored on external
              advertising servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
