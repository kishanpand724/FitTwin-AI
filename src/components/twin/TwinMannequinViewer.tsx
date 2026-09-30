import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, ZoomIn, ZoomOut, Layers, Sparkles, RefreshCw, Sliders } from 'lucide-react';
import { BodyMeasurements } from '../../types';
import avatarPlaceholderImg from '../../assets/images/avatar_digital_twin_1790774648245.jpg';

interface TwinMannequinViewerProps {
  measurements?: BodyMeasurements;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

export const TwinMannequinViewer: React.FC<TwinMannequinViewerProps> = ({
  measurements,
  isRegenerating = false,
  onRegenerate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'editorial'>('3d');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showMeasurementsOverlay, setShowMeasurementsOverlay] = useState<boolean>(true);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'side' | 'back'>('front');

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Default measurements if not set
  const m = measurements || {
    height: 175,
    shoulderWidth: 42,
    chest: 90,
    waist: 72,
    hip: 96,
    armLength: 59,
    inseam: 80,
  };

  useEffect(() => {
    if (viewMode !== '3d' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf6f5f1);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 3.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ec, 1.2);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe4edf5, 0.6);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x244d3c, 0.4);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Subtle travertine ground disc
    const floorGeo = new THREE.CylinderGeometry(1.1, 1.15, 0.06, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xeeece4,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.03;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle circular grid on floor
    const grid = new THREE.PolarGridHelper(1.0, 12, 6, 48, 0x244d3c, 0xd4d0c5);
    grid.position.y = 0.002;
    scene.add(grid);

    // 5. Build Parametric Mannequin Body
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Scaling factors based on user measurements (normalized around 175cm base)
    const heightScale = Math.max(0.85, Math.min(1.2, m.height / 175));
    const shoulderScale = Math.max(0.8, Math.min(1.25, m.shoulderWidth / 42));
    const chestScale = Math.max(0.8, Math.min(1.3, m.chest / 90));
    const waistScale = Math.max(0.75, Math.min(1.3, m.waist / 72));
    const hipScale = Math.max(0.8, Math.min(1.3, m.hip / 96));

    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0xdfdad2,
      roughness: 0.45,
      metalness: 0.08,
      wireframe: isWireframe,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x244d3c,
      roughness: 0.3,
      metalness: 0.3,
      wireframe: isWireframe,
    });

    materialsRef.current = [mannequinMat, jointMat];

    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 24, 24);
    headGeo.scale(1, 1.25, 1.1);
    const head = new THREE.Mesh(headGeo, mannequinMat);
    head.position.y = 1.62 * heightScale;
    head.castShadow = true;
    modelGroup.add(head);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, mannequinMat);
    neck.position.y = 1.48 * heightScale;
    modelGroup.add(neck);

    // Chest & Upper Torso
    const chestGeo = new THREE.CylinderGeometry(
      0.17 * shoulderScale,
      0.14 * chestScale,
      0.28,
      20
    );
    chestGeo.scale(1, 1, 0.75 * chestScale);
    const chest = new THREE.Mesh(chestGeo, mannequinMat);
    chest.position.y = 1.32 * heightScale;
    chest.castShadow = true;
    modelGroup.add(chest);

    // Waist / Mid Torso
    const waistGeo = new THREE.CylinderGeometry(
      0.14 * chestScale,
      0.13 * waistScale,
      0.18,
      20
    );
    waistGeo.scale(1, 1, 0.72 * waistScale);
    const waist = new THREE.Mesh(waistGeo, mannequinMat);
    waist.position.y = 1.1 * heightScale;
    waist.castShadow = true;
    modelGroup.add(waist);

    // Hips / Pelvis
    const hipsGeo = new THREE.CylinderGeometry(
      0.13 * waistScale,
      0.16 * hipScale,
      0.2,
      20
    );
    hipsGeo.scale(1, 1, 0.8 * hipScale);
    const hips = new THREE.Mesh(hipsGeo, mannequinMat);
    hips.position.y = 0.92 * heightScale;
    hips.castShadow = true;
    modelGroup.add(hips);

    // Legs (Thigh + Calf)
    const legSpacing = 0.08 * hipScale;
    [-1, 1].forEach(side => {
      // Hip joint ball
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), jointMat);
      hipJoint.position.set(side * legSpacing, 0.82 * heightScale, 0);
      modelGroup.add(hipJoint);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.06 * hipScale, 0.045, 0.38, 16);
      const thigh = new THREE.Mesh(thighGeo, mannequinMat);
      thigh.position.set(side * legSpacing, 0.62 * heightScale, 0);
      thigh.castShadow = true;
      modelGroup.add(thigh);

      // Knee joint
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), jointMat);
      knee.position.set(side * legSpacing, 0.42 * heightScale, 0);
      modelGroup.add(knee);

      // Calf
      const calfGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.38, 16);
      const calf = new THREE.Mesh(calfGeo, mannequinMat);
      calf.position.set(side * legSpacing, 0.22 * heightScale, 0);
      calf.castShadow = true;
      modelGroup.add(calf);

      // Foot base
      const footGeo = new THREE.BoxGeometry(0.06, 0.03, 0.14);
      const foot = new THREE.Mesh(footGeo, jointMat);
      foot.position.set(side * legSpacing, 0.02, 0.02);
      foot.castShadow = true;
      modelGroup.add(foot);
    });

    // Arms & Shoulders
    const shoulderBreadth = 0.2 * shoulderScale;
    [-1, 1].forEach(side => {
      // Shoulder joint
      const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), jointMat);
      shoulderJoint.position.set(side * shoulderBreadth, 1.44 * heightScale, 0);
      modelGroup.add(shoulderJoint);

      // Upper arm
      const upperArmGeo = new THREE.CylinderGeometry(0.04, 0.032, 0.28, 14);
      const upperArm = new THREE.Mesh(upperArmGeo, mannequinMat);
      upperArm.position.set(side * (shoulderBreadth + 0.03), 1.28 * heightScale, 0);
      upperArm.rotation.z = side * -0.12;
      upperArm.castShadow = true;
      modelGroup.add(upperArm);

      // Elbow joint
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), jointMat);
      elbow.position.set(side * (shoulderBreadth + 0.06), 1.12 * heightScale, 0);
      modelGroup.add(elbow);

      // Forearm
      const forearmGeo = new THREE.CylinderGeometry(0.032, 0.026, 0.26, 14);
      const forearm = new THREE.Mesh(forearmGeo, mannequinMat);
      forearm.position.set(side * (shoulderBreadth + 0.07), 0.98 * heightScale, 0);
      forearm.rotation.z = side * -0.06;
      forearm.castShadow = true;
      modelGroup.add(forearm);
    });

    // Subtly position model in center
    modelGroup.position.y = 0;

    // 6. Interaction Event Listeners (Rotate on drag)
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      modelGroupRef.current.rotation.y += deltaX * 0.01;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      modelGroupRef.current.rotation.y += deltaX * 0.012;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Gentle idle sway if not dragging
      if (!isDraggingRef.current && modelGroupRef.current) {
        // very subtle floating ambient rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, m.height, m.shoulderWidth, m.chest, m.waist, m.hip, isWireframe]);

  // View angle snapping
  const snapToAngle = (angle: 'front' | 'side' | 'back') => {
    setCurrentAngle(angle);
    if (!modelGroupRef.current) return;
    let targetRotation = 0;
    if (angle === 'front') targetRotation = 0;
    if (angle === 'side') targetRotation = Math.PI / 2;
    if (angle === 'back') targetRotation = Math.PI;

    // Smooth step rotation
    modelGroupRef.current.rotation.y = targetRotation;
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -0.4 : 0.4;
    const newZ = cameraRef.current.position.z + delta;
    if (newZ >= 2.2 && newZ <= 5.5) {
      cameraRef.current.position.z = newZ;
    }
  };

  const toggleWireframe = () => {
    setIsWireframe(prev => !prev);
    materialsRef.current.forEach(mat => {
      mat.wireframe = !isWireframe;
      mat.needsUpdate = true;
    });
  };

  return (
    <div className="relative w-full h-[520px] md:h-[600px] bg-[#F6F5F1] border border-[#E7E5DF] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Overlay */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 bg-white/70 backdrop-blur-sm border-b border-[#E7E5DF]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#244D3C] animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#20211F]">
            Digital Twin 3D Viewport
          </span>
          <span className="text-xs text-[#20211F]/50">·</span>
          <span className="text-xs text-[#20211F]/70">
            {m.height}cm Height · {m.waist}cm Waist
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#EBE8E1] p-0.5 rounded-none text-xs">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === '3d'
                ? 'bg-white text-[#20211F] shadow-xs'
                : 'text-[#20211F]/70 hover:text-[#20211F]'
            }`}
          >
            3D Mannequin
          </button>
          <button
            onClick={() => setViewMode('editorial')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'editorial'
                ? 'bg-white text-[#20211F] shadow-xs'
                : 'text-[#20211F]/70 hover:text-[#20211F]'
            }`}
          >
            Avatar Preview
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {viewMode === '3d' ? (
          <>
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Click and drag to rotate mannequin in 3D"
            />

            {/* Measurement Line Overlay Annotation */}
            {showMeasurementsOverlay && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                <div className="flex justify-between items-start text-xs font-mono text-[#244D3C] opacity-80">
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    SHOULDER: {m.shoulderWidth} cm
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    CHEST: {m.chest} cm
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-[#244D3C] opacity-80">
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    WAIST: {m.waist} cm
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    HIPS: {m.hip} cm
                  </div>
                </div>
                <div className="flex justify-between items-end text-xs font-mono text-[#244D3C] opacity-80">
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    INSEAM: {m.inseam} cm
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-2 py-1 border border-[#E7E5DF]">
                    DRAG TO ROTATE 360°
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Editorial Avatar Placeholder */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#F8F7F4]">
            <div className="relative max-w-sm max-h-[440px] aspect-3/4 overflow-hidden border border-[#E7E5DF] shadow-sm bg-white">
              <img
                src={avatarPlaceholderImg}
                alt="Digital Twin Avatar Concept Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#20211F]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs uppercase tracking-widest text-[#A6B6A3] font-semibold mb-1">
                  Avatar preview coming soon
                </span>
                <p className="text-xs text-[#F8F7F4]/90 leading-relaxed">
                  High-fidelity generative 3D mesh rendering based on your specific contour metrics.
                  Full GLB/GLTF export pipeline integrated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regenerating overlay spinner */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#244D3C] animate-spin mb-3" />
            <h4 className="text-base font-editorial font-medium text-[#20211F]">
              Recalibrating Silhouette Coordinates...
            </h4>
            <p className="text-xs text-[#20211F]/70 mt-1">
              Recalculating volumetric proportions and drape anchors.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/90 backdrop-blur-sm border-t border-[#E7E5DF]">
        {/* Camera Angle Snap */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-[#20211F]/60 uppercase tracking-wider mr-2 hidden sm:inline">
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
            Side
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
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-2">
          {viewMode === '3d' && (
            <>
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
                title="Toggle Wireframe"
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
                title="Toggle Measurement Annotations"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Metrics</span>
              </button>
            </>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Avatar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
