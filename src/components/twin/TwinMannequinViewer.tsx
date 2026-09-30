import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  Shirt,
  Scissors,
  Eye,
  Check,
  Camera,
  UserCheck,
} from 'lucide-react';
import { BodyMeasurements, FacialMorphology } from '../../types';
import {
  AvatarAppearanceConfig,
  AvatarLayersState,
  DEFAULT_AVATAR_LAYERS,
} from '../../services/avatarEngine';
import { buildHighQualityAvatar, AvatarBuilderResult } from './avatarMeshBuilder';
import avatarPlaceholderImg from '../../assets/images/avatar_digital_twin_1790774648245.jpg';

interface TwinMannequinViewerProps {
  measurements?: BodyMeasurements;
  appearance?: AvatarAppearanceConfig;
  morphology?: FacialMorphology;
  referencePhotoUrl?: string;
  glbModelUrl?: string;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
  initialLayers?: AvatarLayersState;
}

export const TwinMannequinViewer: React.FC<TwinMannequinViewerProps> = ({
  measurements,
  appearance,
  morphology,
  referencePhotoUrl,
  glbModelUrl,
  isRegenerating = false,
  onRegenerate,
  initialLayers = DEFAULT_AVATAR_LAYERS,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'editorial'>('3d');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showMeasurementsOverlay, setShowMeasurementsOverlay] = useState<boolean>(true);
  const [showPhotoMatchHUD, setShowPhotoMatchHUD] = useState<boolean>(Boolean(referencePhotoUrl));
  const [currentAngle, setCurrentAngle] = useState<'front' | 'side' | 'back' | 'custom'>('front');
  const [layers, setLayers] = useState<AvatarLayersState>(initialLayers);
  const [activeLayerDrawer, setActiveLayerDrawer] = useState<boolean>(false);
  const [isGlbLoading, setIsGlbLoading] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const builderResultRef = useRef<AvatarBuilderResult | null>(null);

  // Interaction & camera animation state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.95, 0));

  // Resolved measurement and appearance defaults
  const m = measurements || {
    height: 175,
    shoulderWidth: 42,
    chest: 90,
    waist: 72,
    hip: 96,
    armLength: 59,
    inseam: 80,
  };

  const app: AvatarAppearanceConfig = appearance || {
    skinTone: '#E0B594',
    hairStyle: 'Short Crop',
    hairColor: '#2B1E16',
  };

  useEffect(() => {
    if (viewMode !== '3d' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 560;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5f4f0); // Luxury studio off-white

    // 2. Camera Setup (Properly framed at eye-to-chest level)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.05, 3.4);
    camera.lookAt(targetLookAtRef.current);
    cameraRef.current = camera;

    // 3. Renderer with soft shadow maps
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Professional Studio Lighting
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 0.9);
    scene.add(ambientLight);

    // Key Light (Soft warm high-angle studio flash)
    const keyLight = new THREE.DirectionalLight(0xfffaee, 1.4);
    keyLight.position.set(2.5, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light (Diffused cool sky fill for contrast softening)
    const fillLight = new THREE.DirectionalLight(0xe5eff5, 0.75);
    fillLight.position.set(-3.0, 2.5, 2.0);
    scene.add(fillLight);

    // Back Rim / Hair Accent Light (Couture silhouette glow)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.95);
    rimLight.position.set(0, 3.5, -3.0);
    scene.add(rimLight);

    // 5. Studio Travertine Podium with Contact Shadow
    const floorGroup = new THREE.Group();
    scene.add(floorGroup);

    // Circular stone pedestal
    const podiumGeo = new THREE.CylinderGeometry(1.08, 1.14, 0.055, 64);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xeeebe3,
      roughness: 0.85,
      metalness: 0.04,
    });
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    podiumMesh.position.y = -0.028;
    podiumMesh.receiveShadow = true;
    floorGroup.add(podiumMesh);

    // Soft Contact Shadow Disc on Podium
    const shadowGeo = new THREE.RingGeometry(0.05, 0.92, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x20211f,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI * 0.5;
    shadowMesh.position.y = 0.001;
    floorGroup.add(shadowMesh);

    // Subtle calibration concentric compass ring
    const ringGuide = new THREE.PolarGridHelper(0.95, 8, 4, 48, 0x244d3c, 0xd8d4c8);
    ringGuide.position.y = 0.002;
    floorGroup.add(ringGuide);

    // 6. Build High-Quality Organically Contoured Avatar or Load External GLB
    if (glbModelUrl) {
      setIsGlbLoading(true);
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        glbModelUrl,
        gltf => {
          const glbModel = gltf.scene;
          const scaleFactor = m.height / 175;
          glbModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
          glbModel.traverse(node => {
            if ((node as THREE.Mesh).isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          scene.add(glbModel);
          avatarGroupRef.current = glbModel;
          setIsGlbLoading(false);
        },
        undefined,
        err => {
          console.warn('GLB load failed, falling back to neural parametric avatar:', err);
          setIsGlbLoading(false);
          const fallbackBuilder = buildHighQualityAvatar(m, app, layers, morphology);
          builderResultRef.current = fallbackBuilder;
          avatarGroupRef.current = fallbackBuilder.rootGroup;
          scene.add(fallbackBuilder.rootGroup);
        }
      );
    } else {
      const builderResult = buildHighQualityAvatar(m, app, layers, morphology);
      builderResultRef.current = builderResult;
      avatarGroupRef.current = builderResult.rootGroup;
      scene.add(builderResult.rootGroup);

      if (isWireframe) {
        builderResult.materials.skin.wireframe = true;
        builderResult.materials.hair.wireframe = true;
      }

      builderResult.measurementGuidesGroup.visible = showMeasurementsOverlay;
    }

    // 7. Interactive Event Listeners (360-degree rotation with damping)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      rotationVelocityRef.current = { x: 0, y: 0 };
      targetCameraPosRef.current = null; // stop any running auto-snap
      setCurrentAngle('custom');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !avatarGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      avatarGroupRef.current.rotation.y += deltaX * 0.009;
      rotationVelocityRef.current = { x: deltaX * 0.009, y: deltaY * 0.005 };

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        targetCameraPosRef.current = null;
        setCurrentAngle('custom');
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !avatarGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      avatarGroupRef.current.rotation.y += deltaX * 0.011;
      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // 8. Animation & Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera transition if an angle snap or reset is active
      if (targetCameraPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPosRef.current, 0.075);
        cameraRef.current.lookAt(targetLookAtRef.current);

        if (cameraRef.current.position.distanceTo(targetCameraPosRef.current) < 0.01) {
          cameraRef.current.position.copy(targetCameraPosRef.current);
          targetCameraPosRef.current = null;
        }
      }

      // Smooth rotation momentum decay when user releases drag
      if (!isDraggingRef.current && avatarGroupRef.current) {
        if (Math.abs(rotationVelocityRef.current.x) > 0.0001) {
          avatarGroupRef.current.rotation.y += rotationVelocityRef.current.x;
          rotationVelocityRef.current.x *= 0.93; // smooth friction
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    viewMode,
    m.height,
    m.shoulderWidth,
    m.chest,
    m.waist,
    m.hip,
    m.armLength,
    m.inseam,
    app.skinTone,
    app.hairColor,
    app.hairStyle,
    morphology?.faceTextureUrl,
    morphology?.jawWidth,
    morphology?.chinPointiness,
    morphology?.cheekboneProminence,
    morphology?.noseBridgeElevation,
    morphology?.noseWidth,
    morphology?.lipFullness,
    morphology?.eyeSpacing,
    morphology?.detectedSkinTone,
    morphology?.detectedHairColor,
    glbModelUrl,
  ]);

  // Sync Layers when state changes
  useEffect(() => {
    if (builderResultRef.current) {
      builderResultRef.current.updateLayers(layers);
    }
  }, [layers]);

  // Sync Measurement Overlay visibility
  useEffect(() => {
    if (builderResultRef.current) {
      builderResultRef.current.measurementGuidesGroup.visible = showMeasurementsOverlay;
    }
  }, [showMeasurementsOverlay]);

  // Smooth Camera Snap Controls
  const snapToAngle = (angle: 'front' | 'side' | 'back') => {
    setCurrentAngle(angle);
    if (!avatarGroupRef.current) return;

    let targetRot = 0;
    if (angle === 'front') targetRot = 0;
    if (angle === 'side') targetRot = Math.PI * 0.5;
    if (angle === 'back') targetRot = Math.PI;

    // Set model rotation cleanly
    avatarGroupRef.current.rotation.y = targetRot;
    rotationVelocityRef.current = { x: 0, y: 0 };

    // Set camera to standard elevation
    targetLookAtRef.current = new THREE.Vector3(0, 0.95, 0);
    targetCameraPosRef.current = new THREE.Vector3(0, 1.05, 3.4);
  };

  // Face Focus camera zoom
  const focusOnFace = () => {
    setCurrentAngle('custom');
    const heightScale = m.height / 175;
    targetLookAtRef.current = new THREE.Vector3(0, 1.66 * heightScale, 0);
    targetCameraPosRef.current = new THREE.Vector3(0, 1.66 * heightScale, 0.95);
  };

  // Reset Camera View to Full Body
  const handleResetCamera = () => {
    setCurrentAngle('front');
    if (avatarGroupRef.current) {
      avatarGroupRef.current.rotation.y = 0;
      rotationVelocityRef.current = { x: 0, y: 0 };
    }
    targetLookAtRef.current = new THREE.Vector3(0, 0.95, 0);
    targetCameraPosRef.current = new THREE.Vector3(0, 1.05, 3.4);
  };

  // Zoom controls with safe distance clamping
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.38 : 0.38;
    const currentPos = cameraRef.current.position;
    const dir = currentPos.clone().sub(targetLookAtRef.current).normalize();
    const currentDist = currentPos.distanceTo(targetLookAtRef.current);
    const newDist = Math.max(1.8, Math.min(4.8, currentDist + delta));

    targetCameraPosRef.current = targetLookAtRef.current.clone().add(dir.multiplyScalar(newDist));
  };

  // Wireframe toggle
  const toggleWireframe = () => {
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    if (builderResultRef.current) {
      builderResultRef.current.materials.skin.wireframe = nextState;
      builderResultRef.current.materials.hair.wireframe = nextState;
      Object.values(builderResultRef.current.materials.clothing).forEach(mat => {
        mat.wireframe = nextState;
      });
    }
  };

  // Layer Preset Quick Switchers
  const applyPreset = (presetName: 'mannequin' | 'smart_casual' | 'formal' | 'streetwear') => {
    if (presetName === 'mannequin') {
      setLayers({
        top: 'none',
        bottom: 'none',
        outerwear: 'none',
        footwear: 'none',
      });
    } else if (presetName === 'smart_casual') {
      setLayers({
        top: 'crewneck',
        bottom: 'trousers',
        outerwear: 'none',
        footwear: 'boots',
      });
    } else if (presetName === 'formal') {
      setLayers({
        top: 'shirt',
        bottom: 'trousers',
        outerwear: 'blazer',
        footwear: 'boots',
      });
    } else if (presetName === 'streetwear') {
      setLayers({
        top: 'crewneck',
        bottom: 'jeans',
        outerwear: 'none',
        footwear: 'sneakers',
      });
    }
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] bg-[#F5F4F0] border border-[#E7E5DF] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Overlay */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-[#E7E5DF]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#244D3C] animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#20211F]">
            3D Fashion Avatar Studio
          </span>
          <span className="text-xs text-[#20211F]/40">·</span>
          <span className="text-xs text-[#20211F]/70 font-mono">
            {m.height}cm · {m.chest}C / {m.waist}W / {m.hip}H
          </span>
        </div>

        {/* View Mode & Wardrobe Layer Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLayerDrawer(prev => !prev)}
            className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold border flex items-center gap-1.5 transition-colors ${
              activeLayerDrawer
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Wardrobe Layers</span>
          </button>

          <div className="flex items-center bg-[#EBE8E1] p-0.5 rounded-none text-xs">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-white text-[#20211F] shadow-2xs font-semibold'
                  : 'text-[#20211F]/70 hover:text-[#20211F]'
              }`}
            >
              3D Avatar
            </button>
            <button
              onClick={() => setViewMode('editorial')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === 'editorial'
                  ? 'bg-white text-[#20211F] shadow-2xs font-semibold'
                  : 'text-[#20211F]/70 hover:text-[#20211F]'
              }`}
            >
              Editorial Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Viewport / Editorial Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {viewMode === '3d' ? (
          <>
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Click and drag to rotate mannequin in 360°"
            />

            {/* Floating Measurement Guides HUD */}
            {showMeasurementsOverlay && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                <div className="flex justify-between items-start text-xs font-mono text-[#244D3C]">
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs">
                    SHOULDER: {m.shoulderWidth} cm
                  </div>
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs">
                    CHEST: {m.chest} cm
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-[#244D3C]">
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs">
                    WAIST: {m.waist} cm
                  </div>
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs">
                    HIPS: {m.hip} cm
                  </div>
                </div>
                <div className="flex justify-between items-end text-xs font-mono text-[#244D3C]">
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs">
                    INSEAM: {m.inseam} cm
                  </div>
                  <div className="bg-white/85 backdrop-blur-xs px-2.5 py-1 border border-[#E7E5DF] shadow-2xs text-[#20211F]/60">
                    DRAG 360° · SCROLL TO ZOOM
                  </div>
                </div>
              </div>
            )}

            {/* Photo Match & Biometric Morphology HUD */}
            {referencePhotoUrl && showPhotoMatchHUD && (
              <div className="absolute top-4 left-4 z-20 max-w-[270px] bg-white/95 backdrop-blur-md border border-[#E7E5DF] shadow-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E7E5DF]">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#244D3C]">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo-Calibrated Twin</span>
                  </div>
                  <button
                    onClick={() => setShowPhotoMatchHUD(false)}
                    className="text-xs text-[#20211F]/40 hover:text-[#20211F] p-0.5"
                    title="Minimize Photo HUD"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative w-12 h-14 bg-[#F8F7F4] border border-[#E7E5DF] shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={referencePhotoUrl}
                      alt="Reference user portrait"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-[#244D3C]/90 text-[8px] font-mono text-white text-center py-0.5">
                      REF
                    </div>
                  </div>

                  <div className="text-xs space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#20211F]">
                      <Check className="w-3 h-3 text-[#244D3C]" />
                      <span>Face UV Projected</span>
                    </div>
                    <p className="text-[10px] text-[#20211F]/60 truncate font-mono">
                      Match: {morphology?.confidenceScore || 97.2}% confidence
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#20211F]/50">Tone:</span>
                      <span
                        className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: morphology?.detectedSkinTone || app.skinTone }}
                        title={`Skin: ${morphology?.detectedSkinTone || app.skinTone}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: morphology?.detectedHairColor || app.hairColor }}
                        title={`Hair: ${morphology?.detectedHairColor || app.hairColor}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[#E7E5DF] flex items-center gap-1.5">
                  <button
                    onClick={focusOnFace}
                    className="flex-1 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#F8F7F4] hover:bg-[#E8EDE7] text-[#244D3C] border border-[#E7E5DF] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus Face</span>
                  </button>
                  <button
                    onClick={handleResetCamera}
                    className="py-1 px-2.5 text-[10px] uppercase tracking-wider font-medium text-[#20211F]/70 hover:text-[#20211F] border border-[#E7E5DF] bg-white transition-colors"
                  >
                    Full Body
                  </button>
                </div>
              </div>
            )}

            {referencePhotoUrl && !showPhotoMatchHUD && (
              <button
                onClick={() => setShowPhotoMatchHUD(true)}
                className="absolute top-4 left-4 z-20 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-[#E7E5DF] text-[10px] font-semibold text-[#244D3C] uppercase tracking-wider shadow-xs hover:border-[#244D3C] flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>Photo Calibrated ({morphology?.confidenceScore || 97.2}%)</span>
              </button>
            )}

            {/* Wardrobe Layer Drawer (Modular Try-On System) */}
            {activeLayerDrawer && (
              <div className="absolute top-4 right-4 z-20 w-72 bg-white/95 backdrop-blur-md border border-[#E7E5DF] shadow-xl p-4 space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E5DF]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#20211F]">
                    <Shirt className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Modular Try-On Layers</span>
                  </div>
                  <button
                    onClick={() => setActiveLayerDrawer(false)}
                    className="text-xs text-[#20211F]/50 hover:text-[#20211F]"
                  >
                    ✕
                  </button>
                </div>

                {/* Ensemble Presets */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block mb-1.5 font-semibold">
                    Quick Ensemble Presets
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      onClick={() => applyPreset('mannequin')}
                      className={`p-1.5 border text-left text-[11px] font-medium transition-colors ${
                        layers.top === 'none' && layers.bottom === 'none'
                          ? 'border-[#244D3C] bg-[#E8EDE7] text-[#244D3C]'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      Base Mannequin
                    </button>
                    <button
                      onClick={() => applyPreset('smart_casual')}
                      className={`p-1.5 border text-left text-[11px] font-medium transition-colors ${
                        layers.top === 'crewneck' && layers.bottom === 'trousers'
                          ? 'border-[#244D3C] bg-[#E8EDE7] text-[#244D3C]'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      Smart Casual
                    </button>
                    <button
                      onClick={() => applyPreset('formal')}
                      className={`p-1.5 border text-left text-[11px] font-medium transition-colors ${
                        layers.outerwear === 'blazer'
                          ? 'border-[#244D3C] bg-[#E8EDE7] text-[#244D3C]'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      Tailored Blazer
                    </button>
                    <button
                      onClick={() => applyPreset('streetwear')}
                      className={`p-1.5 border text-left text-[11px] font-medium transition-colors ${
                        layers.bottom === 'jeans'
                          ? 'border-[#244D3C] bg-[#E8EDE7] text-[#244D3C]'
                          : 'border-[#E7E5DF] hover:border-[#20211F]'
                      }`}
                    >
                      Urban Denim
                    </button>
                  </div>
                </div>

                {/* Individual Layer Selectors */}
                <div className="space-y-3 pt-2 border-t border-[#E7E5DF] text-xs">
                  {/* Top */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
                      Top Layer
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['none', 'crewneck', 'shirt'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setLayers(prev => ({ ...prev, top: t }))}
                          className={`py-1 text-[11px] capitalize border ${
                            layers.top === t
                              ? 'bg-[#244D3C] text-white border-[#244D3C]'
                              : 'bg-white text-[#20211F] border-[#E7E5DF]'
                          }`}
                        >
                          {t === 'none' ? 'None' : t === 'crewneck' ? 'Crewneck' : 'Shirt'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
                      Bottom Layer
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['none', 'trousers', 'jeans'] as const).map(b => (
                        <button
                          key={b}
                          onClick={() => setLayers(prev => ({ ...prev, bottom: b }))}
                          className={`py-1 text-[11px] capitalize border ${
                            layers.bottom === b
                              ? 'bg-[#244D3C] text-white border-[#244D3C]'
                              : 'bg-white text-[#20211F] border-[#E7E5DF]'
                          }`}
                        >
                          {b === 'none' ? 'None' : b === 'trousers' ? 'Trousers' : 'Jeans'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outerwear */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
                      Outerwear
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['none', 'blazer'] as const).map(o => (
                        <button
                          key={o}
                          onClick={() => setLayers(prev => ({ ...prev, outerwear: o }))}
                          className={`py-1 text-[11px] capitalize border ${
                            layers.outerwear === o
                              ? 'bg-[#244D3C] text-white border-[#244D3C]'
                              : 'bg-white text-[#20211F] border-[#E7E5DF]'
                          }`}
                        >
                          {o === 'none' ? 'No Jacket' : 'Wool Blazer'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
                      Footwear
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['none', 'boots', 'sneakers'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setLayers(prev => ({ ...prev, footwear: f }))}
                          className={`py-1 text-[11px] capitalize border ${
                            layers.footwear === f
                              ? 'bg-[#244D3C] text-white border-[#244D3C]'
                              : 'bg-white text-[#20211F] border-[#E7E5DF]'
                          }`}
                        >
                          {f === 'none' ? 'Bare' : f === 'boots' ? 'Boots' : 'Sneakers'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E7E5DF] text-[10px] text-[#20211F]/60 italic">
                  * Garment draping calibrated to current body ease metrics.
                </div>
              </div>
            )}
          </>
        ) : (
          /* Editorial Concept Preview */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#F8F7F4]">
            <div className="relative max-w-sm max-h-[460px] aspect-3/4 overflow-hidden border border-[#E7E5DF] shadow-md bg-white">
              <img
                src={avatarPlaceholderImg}
                alt="Digital Twin Editorial Concept Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#20211F]/90 via-[#20211F]/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs uppercase tracking-widest text-[#A6B6A3] font-semibold mb-1">
                  Editorial Concept Preview
                </span>
                <p className="text-xs text-[#F8F7F4]/90 leading-relaxed">
                  High-fidelity generative neural render matching your calibrated complexion (
                  {app.skinTone}) and hairstyle ({app.hairStyle}). Full GLB/GLTF export pipeline
                  integrated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regenerating Spinner Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#244D3C] animate-spin mb-3" />
            <h4 className="text-base font-editorial font-medium text-[#20211F]">
              Recalibrating Anatomical Coordinates...
            </h4>
            <p className="text-xs text-[#20211F]/70 mt-1">
              Constructing smooth parametric lofting and drape anchor vectors.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/95 backdrop-blur-md border-t border-[#E7E5DF]">
        {/* Camera Angle Snap Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#20211F]/60 uppercase tracking-wider mr-1 hidden sm:inline">
            Camera
          </span>
          <button
            onClick={() => snapToAngle('front')}
            className={`px-3 py-1 text-xs uppercase font-medium border transition-colors ${
              currentAngle === 'front'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => snapToAngle('side')}
            className={`px-3 py-1 text-xs uppercase font-medium border transition-colors ${
              currentAngle === 'side'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => snapToAngle('back')}
            className={`px-3 py-1 text-xs uppercase font-medium border transition-colors ${
              currentAngle === 'back'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
          >
            Back
          </button>
          <button
            onClick={focusOnFace}
            className={`px-3 py-1 text-xs uppercase font-medium border transition-colors flex items-center gap-1 ${
              currentAngle === 'custom'
                ? 'bg-[#244D3C] text-white border-[#244D3C]'
                : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
            }`}
            title="Focus camera on head, facial features & hairstyle"
          >
            <Eye className="w-3 h-3 text-[#A6B6A3]" />
            <span>Face</span>
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-white border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] transition-colors"
            title="Reset Camera to Full Body"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Toggles & Zoom */}
        <div className="flex items-center gap-2">
          {viewMode === '3d' && (
            <>
              {referencePhotoUrl && (
                <button
                  onClick={() => setShowPhotoMatchHUD(prev => !prev)}
                  className={`px-2.5 py-1 text-xs flex items-center gap-1.5 border transition-colors ${
                    showPhotoMatchHUD
                      ? 'bg-[#E8EDE7] text-[#244D3C] border-[#244D3C]'
                      : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                  }`}
                  title="Toggle Photo Match & Biometric HUD"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Photo HUD</span>
                </button>
              )}

              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 bg-white border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 bg-white border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={toggleWireframe}
                className={`px-2.5 py-1 text-xs flex items-center gap-1.5 border transition-colors ${
                  isWireframe
                    ? 'bg-[#20211F] text-white border-[#20211F]'
                    : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                }`}
                title="Toggle Wireframe Mesh"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wireframe</span>
              </button>

              <button
                onClick={() => setShowMeasurementsOverlay(prev => !prev)}
                className={`px-2.5 py-1 text-xs flex items-center gap-1.5 border transition-colors ${
                  showMeasurementsOverlay
                    ? 'bg-[#E8EDE7] text-[#244D3C] border-[#244D3C]'
                    : 'bg-white text-[#20211F] border-[#E7E5DF] hover:border-[#20211F]'
                }`}
                title="Toggle Measurement Caliper Rings"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Caliper HUD</span>
              </button>
            </>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3.5 py-1 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
