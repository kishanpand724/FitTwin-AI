/**
 * High-Quality 3D Fashion Mannequin & Human Avatar Mesh Builder
 * Constructs a smooth, organically contoured digital fashion mannequin with natural human proportions,
 * sculpted facial contours, customizable hairstyle, skin complexion, and modular clothing layers.
 */

import * as THREE from 'three';
import { BodyMeasurements } from '../../types';
import {
  AvatarAppearanceConfig,
  AvatarLayersState,
  calculateAvatarCalibration,
} from '../../services/avatarEngine';

export interface AvatarBuilderResult {
  rootGroup: THREE.Group;
  bodyMeshGroup: THREE.Group;
  clothingGroup: THREE.Group;
  measurementGuidesGroup: THREE.Group;
  materials: {
    skin: THREE.MeshStandardMaterial;
    hair: THREE.MeshStandardMaterial;
    clothing: Record<string, THREE.MeshStandardMaterial>;
  };
  updateMeasurements: (measurements: BodyMeasurements) => void;
  updateAppearance: (appearance: AvatarAppearanceConfig) => void;
  updateLayers: (layers: AvatarLayersState) => void;
}

/**
 * Creates a continuous smooth torso geometry using lofted cross-sections.
 * This eliminates the crude "stacked cylinder" appearance and produces a seamless,
 * organic fashion silhouette with clavicles, chest contour, waist taper, and hip curves.
 */
function createSeamlessTorsoGeometry(
  heightScale: number,
  shoulderScale: number,
  chestScale: number,
  waistScale: number,
  hipScale: number
): THREE.BufferGeometry {
  const rings = 36;
  const segments = 36;
  const totalVertices = (rings + 1) * (segments + 1);

  const positions = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const indices: number[] = [];

  const torsoBottomY = 0.82 * heightScale;
  const torsoTopY = 1.48 * heightScale;
  const torsoHeight = torsoTopY - torsoBottomY;

  let vertexIndex = 0;
  let uvIndex = 0;

  for (let r = 0; r <= rings; r++) {
    const v = r / rings; // 0 at groin/pelvis bottom, 1 at neck/clavicle top
    const y = torsoBottomY + v * torsoHeight;

    // Physiological cross-section radiuses at height v
    let rx = 0.14; // half-width (left-right)
    let rz = 0.095; // half-depth (front-back)
    let zOffset = 0;

    if (v < 0.22) {
      // Pelvis / Hips
      const t = v / 0.22;
      rx = (0.155 + 0.025 * Math.sin(t * Math.PI)) * hipScale;
      rz = (0.11 + 0.015 * Math.cos(t * Math.PI * 0.5)) * hipScale;
      zOffset = -0.012 * (1 - t); // Gluteal curve
    } else if (v < 0.48) {
      // Waist indentation
      const t = (v - 0.22) / 0.26;
      const blend = 0.5 - 0.5 * Math.cos(t * Math.PI);
      const hipW = 0.17 * hipScale;
      const waistW = 0.125 * waistScale;
      rx = hipW + (waistW - hipW) * blend;
      rz = (0.115 - 0.03 * blend) * (0.5 * (hipScale + waistScale));
      zOffset = 0.008 * Math.sin(t * Math.PI); // Natural lumbar curve
    } else if (v < 0.78) {
      // Ribcage to Full Chest
      const t = (v - 0.48) / 0.3;
      const blend = 0.5 - 0.5 * Math.cos(t * Math.PI);
      const waistW = 0.125 * waistScale;
      const chestW = 0.165 * chestScale;
      rx = waistW + (chestW - waistW) * blend;
      rz = (0.088 + 0.042 * blend) * chestScale;
      zOffset = 0.016 * Math.sin(blend * Math.PI * 0.7); // Pectoral lift
    } else if (v < 0.92) {
      // Upper Chest to Shoulder girdle / Clavicles
      const t = (v - 0.78) / 0.14;
      const blend = Math.sin(t * Math.PI * 0.5);
      const chestW = 0.165 * chestScale;
      const shoulderW = 0.21 * shoulderScale;
      rx = chestW + (shoulderW - chestW) * blend;
      rz = (0.125 - 0.035 * blend) * chestScale;
      zOffset = -0.005 * blend;
    } else {
      // Trapezius and Neck root
      const t = (v - 0.92) / 0.08;
      const blend = t * t;
      const shoulderW = 0.21 * shoulderScale;
      const neckW = 0.06;
      rx = shoulderW + (neckW - shoulderW) * blend;
      rz = (0.09 - 0.032 * blend);
      zOffset = -0.008;
    }

    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const theta = u * Math.PI * 2;

      // Superellipse cross-section with natural anatomical contour
      // Squaring factor creates refined fashion silhouette rather than an awkward pipe
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Subtle front/back shaping modulation
      const frontModulation = sinT > 0 ? 1.05 : 0.96;
      const x = rx * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.85);
      let z = rz * Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.9) * frontModulation + zOffset;

      // Sculpted pectoral contour at upper chest
      if (v >= 0.62 && v <= 0.82 && sinT > 0.25) {
        const pecZone = Math.sin(((v - 0.62) / 0.2) * Math.PI);
        const lateralZone = Math.sin((Math.abs(x) / rx) * Math.PI);
        z += 0.02 * pecZone * lateralZone * chestScale;
      }

      // Sculpted shoulder taper at top sides
      if (v >= 0.82 && Math.abs(x) > 0.14) {
        // Natural drop towards shoulder tip
      }

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;
      positions[vertexIndex * 3 + 2] = z;

      uvs[uvIndex * 2] = u;
      uvs[uvIndex * 2 + 1] = v;

      vertexIndex++;
      uvIndex++;
    }
  }

  // Generate Indices
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const first = r * (segments + 1) + s;
      const second = first + segments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates an elegant, sculpted fashion-mannequin head with facial features:
 * contoured cranium, defined brow line, refined nose bridge, high cheekbones, sculpted jaw, and neutral lips.
 */
function createSculptedHeadMesh(skinMaterial: THREE.Material): THREE.Group {
  const headGroup = new THREE.Group();

  // 1. Base Cranium & Facial Form (Lathe/Sphere with sculpted displacements)
  const sphereGeo = new THREE.SphereGeometry(0.118, 48, 48);
  const pos = sphereGeo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Elongate into refined fashion head proportions
    y *= 1.28;
    z *= 1.1;

    // Jawline taper: narrow from temples down to chin
    if (y < 0) {
      const taper = 1.0 + y * 2.2; // narrows toward bottom
      x *= Math.max(0.68, taper);

      // Chin projection
      if (y < -0.1 && z > 0) {
        z += 0.014 * (1.0 + y * 6.0);
      }
    }

    // Forehead and cranium sweep
    if (y > 0.05 && z < 0) {
      z *= 1.05; // graceful occipital fullness
    }

    // Cheekbones sculpting
    if (y > -0.04 && y < 0.05 && Math.abs(x) > 0.055 && z > 0) {
      x *= 1.06;
      z += 0.008;
    }

    // Nose bridge protrusion
    if (Math.abs(x) < 0.022 && y > -0.04 && y < 0.04 && z > 0.06) {
      z += 0.024 * (1.0 - Math.abs(y) / 0.04);
    }

    // Gentle eye socket indentation
    if (Math.abs(x) > 0.025 && Math.abs(x) < 0.065 && y > 0.01 && y < 0.06 && z > 0.06) {
      z -= 0.009;
    }

    pos.setXYZ(i, x, y, z);
  }

  sphereGeo.computeVertexNormals();
  const faceMesh = new THREE.Mesh(sphereGeo, skinMaterial);
  faceMesh.castShadow = true;
  faceMesh.receiveShadow = true;
  headGroup.add(faceMesh);

  // 2. Refined Sculpted Nose Feature
  const noseGeo = new THREE.ConeGeometry(0.015, 0.048, 16);
  noseGeo.rotateX(Math.PI * 0.12);
  const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
  noseMesh.position.set(0, 0.002, 0.122);
  noseMesh.scale.set(0.7, 1.0, 0.85);
  headGroup.add(noseMesh);

  // 3. Subtle Sculpted Lips
  const upperLipGeo = new THREE.TorusGeometry(0.016, 0.004, 12, 24, Math.PI * 0.9);
  upperLipGeo.rotateZ(Math.PI * 0.05);
  upperLipGeo.rotateX(Math.PI * 0.45);
  const upperLip = new THREE.Mesh(upperLipGeo, skinMaterial);
  upperLip.position.set(0, -0.045, 0.108);
  headGroup.add(upperLip);

  const lowerLipGeo = new THREE.TorusGeometry(0.014, 0.0045, 12, 24, Math.PI * 0.85);
  lowerLipGeo.rotateX(Math.PI * 0.52);
  const lowerLip = new THREE.Mesh(lowerLipGeo, skinMaterial);
  lowerLip.position.set(0, -0.056, 0.105);
  headGroup.add(lowerLip);

  // 4. Stylized Editorial Ears
  [-1, 1].forEach(side => {
    const earGeo = new THREE.TorusGeometry(0.024, 0.008, 12, 24, Math.PI * 1.3);
    earGeo.rotateZ(side * 0.2);
    earGeo.rotateY(side * 0.3);
    const ear = new THREE.Mesh(earGeo, skinMaterial);
    ear.position.set(side * 0.088, 0.005, -0.012);
    ear.scale.set(0.65, 1.15, 0.7);
    headGroup.add(ear);
  });

  return headGroup;
}

/**
 * Creates dynamic 3D hairstyle geometry matching the user's selected style and hair color.
 */
function createHairstyleMesh(
  hairStyle: string,
  hairMaterial: THREE.MeshStandardMaterial
): THREE.Group {
  const hairGroup = new THREE.Group();

  switch (hairStyle) {
    case 'Sleek Bob': {
      // Geometric sharp bob curving along the jawline
      const bobCapGeo = new THREE.SphereGeometry(0.124, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.75);
      bobCapGeo.scale(1.04, 1.32, 1.14);
      const bobCap = new THREE.Mesh(bobCapGeo, hairMaterial);
      bobCap.position.set(0, 0.01, -0.005);
      hairGroup.add(bobCap);

      // Sides draping to jawline
      [-1, 1].forEach(side => {
        const sideGeo = new THREE.CylinderGeometry(0.055, 0.04, 0.18, 16, 1, true, 0, Math.PI);
        sideGeo.rotateY(side * Math.PI * 0.45);
        const sideMesh = new THREE.Mesh(sideGeo, hairMaterial);
        sideMesh.position.set(side * 0.088, -0.04, 0.01);
        sideMesh.scale.set(0.6, 1.0, 1.1);
        hairGroup.add(sideMesh);
      });
      break;
    }

    case 'Textured Waves': {
      // Crown volume with organic cascading waves
      const crownGeo = new THREE.SphereGeometry(0.128, 32, 24);
      crownGeo.scale(1.05, 1.32, 1.18);
      const crown = new THREE.Mesh(crownGeo, hairMaterial);
      crown.position.set(0, 0.02, -0.01);
      hairGroup.add(crown);

      // Wave clumps
      for (let i = 0; i < 7; i++) {
        const waveGeo = new THREE.TorusGeometry(0.05, 0.018, 12, 24, Math.PI * 1.1);
        const waveMesh = new THREE.Mesh(waveGeo, hairMaterial);
        const angle = (i / 7) * Math.PI * 1.8 - Math.PI * 0.9;
        waveMesh.position.set(Math.cos(angle) * 0.09, 0.04 + (i % 3) * 0.02, Math.sin(angle) * 0.09);
        waveMesh.rotation.set(0.2, angle, 0.3);
        hairGroup.add(waveMesh);
      }
      break;
    }

    case 'Long Layers': {
      // Flowing layers extending down behind the neck and shoulders
      const topGeo = new THREE.SphereGeometry(0.125, 32, 24);
      topGeo.scale(1.04, 1.3, 1.16);
      const topMesh = new THREE.Mesh(topGeo, hairMaterial);
      topMesh.position.set(0, 0.015, -0.008);
      hairGroup.add(topMesh);

      // Back cascade
      const backGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.34, 20, 1, true, 0, Math.PI);
      backGeo.rotateY(Math.PI * 0.5);
      const backMesh = new THREE.Mesh(backGeo, hairMaterial);
      backMesh.position.set(0, -0.15, -0.07);
      hairGroup.add(backMesh);
      break;
    }

    case 'Curly Afro': {
      // Volumetric cloud-like organic silhouette
      const afroGeo = new THREE.SphereGeometry(0.155, 36, 36);
      const afroPos = afroGeo.attributes.position;
      for (let i = 0; i < afroPos.count; i++) {
        const u = afroPos.getX(i);
        const v = afroPos.getY(i);
        const w = afroPos.getZ(i);
        const noise = 1.0 + 0.08 * Math.sin(u * 40) * Math.cos(v * 40);
        afroPos.setXYZ(i, u * noise * 1.02, v * noise * 1.25, w * noise * 1.15);
      }
      afroGeo.computeVertexNormals();
      const afroMesh = new THREE.Mesh(afroGeo, hairMaterial);
      afroMesh.position.set(0, 0.04, -0.01);
      hairGroup.add(afroMesh);
      break;
    }

    case 'Buzz Cut': {
      // Minimalist close-cropped velvet texture
      const buzzGeo = new THREE.SphereGeometry(0.121, 32, 32);
      buzzGeo.scale(1.02, 1.29, 1.12);
      const buzzMesh = new THREE.Mesh(buzzGeo, hairMaterial);
      buzzMesh.position.set(0, 0.005, -0.005);
      hairGroup.add(buzzMesh);
      break;
    }

    case 'Short Crop':
    default: {
      // Sculpted high-fashion tapered short crop with side sweep
      const cropGeo = new THREE.SphereGeometry(0.123, 32, 28);
      cropGeo.scale(1.03, 1.31, 1.14);
      const cropMesh = new THREE.Mesh(cropGeo, hairMaterial);
      cropMesh.position.set(0, 0.012, -0.006);
      hairGroup.add(cropMesh);

      // Swept front volume
      const sweepGeo = new THREE.CylinderGeometry(0.045, 0.06, 0.09, 16);
      sweepGeo.rotateZ(Math.PI * 0.45);
      sweepGeo.rotateX(Math.PI * 0.1);
      const sweepMesh = new THREE.Mesh(sweepGeo, hairMaterial);
      sweepMesh.position.set(-0.02, 0.11, 0.06);
      sweepMesh.scale.set(0.9, 1.2, 0.6);
      hairGroup.add(sweepMesh);
      break;
    }
  }

  hairGroup.castShadow = true;
  return hairGroup;
}

/**
 * Creates graceful, stylized fashion-mannequin arms and relaxed hands with fingers.
 */
function createArmAndHand(
  side: number, // -1 for left, 1 for right
  heightScale: number,
  shoulderScale: number,
  armScale: number,
  skinMaterial: THREE.Material
): THREE.Group {
  const armGroup = new THREE.Group();

  const shoulderX = side * 0.205 * shoulderScale;
  const shoulderY = 1.43 * heightScale;
  const upperArmLength = 0.29 * armScale;
  const forearmLength = 0.28 * armScale;

  // 1. Deltoid Shoulder Cap (blends into upper torso)
  const deltoidGeo = new THREE.SphereGeometry(0.052, 20, 20);
  deltoidGeo.scale(1.0, 1.35, 1.05);
  const deltoid = new THREE.Mesh(deltoidGeo, skinMaterial);
  deltoid.position.set(shoulderX, shoulderY, 0);
  deltoid.castShadow = true;
  armGroup.add(deltoid);

  // 2. Sculpted Upper Arm (bicep/tricep taper)
  const upperArmGeo = new THREE.CylinderGeometry(0.041, 0.033, upperArmLength, 20);
  const upperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
  // Natural slight relaxed angle outward
  upperArm.position.set(
    shoulderX + side * 0.028,
    shoulderY - upperArmLength * 0.5 - 0.02,
    -0.005
  );
  upperArm.rotation.z = side * -0.09;
  upperArm.castShadow = true;
  armGroup.add(upperArm);

  // 3. Subtle Elbow Definition
  const elbowY = shoulderY - upperArmLength - 0.025;
  const elbowX = shoulderX + side * 0.052;
  const elbowGeo = new THREE.SphereGeometry(0.033, 16, 16);
  const elbow = new THREE.Mesh(elbowGeo, skinMaterial);
  elbow.position.set(elbowX, elbowY, -0.01);
  armGroup.add(elbow);

  // 4. Contoured Forearm (tapering to wrist)
  const forearmGeo = new THREE.CylinderGeometry(0.033, 0.024, forearmLength, 20);
  const forearm = new THREE.Mesh(forearmGeo, skinMaterial);
  const forearmY = elbowY - forearmLength * 0.5 - 0.01;
  const forearmX = elbowX + side * 0.015;
  forearm.position.set(forearmX, forearmY, 0.005);
  forearm.rotation.z = side * -0.05;
  forearm.castShadow = true;
  armGroup.add(forearm);

  // 5. Stylized Fashion Hand with relaxed fingers
  const handGroup = new THREE.Group();
  const wristY = elbowY - forearmLength - 0.015;
  const wristX = forearmX + side * 0.008;

  // Palm base
  const palmGeo = new THREE.BoxGeometry(0.022, 0.065, 0.042);
  const palm = new THREE.Mesh(palmGeo, skinMaterial);
  palm.castShadow = true;
  handGroup.add(palm);

  // Thumb
  const thumbGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.038, 12);
  thumbGeo.rotateZ(side * 0.35);
  thumbGeo.rotateX(-0.25);
  const thumb = new THREE.Mesh(thumbGeo, skinMaterial);
  thumb.position.set(side * -0.012, 0.01, 0.018);
  thumb.castShadow = true;
  handGroup.add(thumb);

  // Relaxed individual finger cluster (index, middle, ring, pinky)
  const fingerConfigs = [
    { len: 0.046, rad: 0.0055, zOff: 0.012, xOff: 0.001 },
    { len: 0.052, rad: 0.0058, zOff: 0.002, xOff: 0.0 },
    { len: 0.048, rad: 0.0054, zOff: -0.008, xOff: -0.001 },
    { len: 0.039, rad: 0.0048, zOff: -0.017, xOff: -0.002 },
  ];

  fingerConfigs.forEach(fc => {
    const fingerGeo = new THREE.CylinderGeometry(fc.rad * 0.85, fc.rad, fc.len, 10);
    // Subtle inward curve for natural pose
    fingerGeo.rotateX(0.08);
    const finger = new THREE.Mesh(fingerGeo, skinMaterial);
    finger.position.set(fc.xOff, -0.032 - fc.len * 0.5, fc.zOff);
    finger.castShadow = true;
    handGroup.add(finger);
  });

  handGroup.position.set(wristX, wristY, 0.008);
  handGroup.rotation.y = side * -0.15;
  handGroup.rotation.z = side * 0.04;
  armGroup.add(handGroup);

  return armGroup;
}

/**
 * Creates anatomically contoured legs with quadriceps curve, defined knees,
 * gastrocnemius calves, slender ankles, and sculpted feet.
 */
function createLegAndFoot(
  side: number, // -1 for left, 1 for right
  heightScale: number,
  hipScale: number,
  inseamScale: number,
  skinMaterial: THREE.Material
): THREE.Group {
  const legGroup = new THREE.Group();

  const hipX = side * 0.088 * hipScale;
  const hipY = 0.82 * heightScale;
  const thighLength = 0.40 * inseamScale;
  const calfLength = 0.41 * inseamScale;

  // 1. Sculpted Thigh (quadriceps and hamstring contour)
  const thighGeo = new THREE.CylinderGeometry(
    0.068 * hipScale,
    0.048,
    thighLength,
    24
  );
  const thigh = new THREE.Mesh(thighGeo, skinMaterial);
  thigh.position.set(hipX, hipY - thighLength * 0.5, 0.005);
  thigh.castShadow = true;
  thigh.receiveShadow = true;
  legGroup.add(thigh);

  // 2. Sculpted Patella / Knee Joint
  const kneeY = hipY - thighLength;
  const kneeGeo = new THREE.SphereGeometry(0.046, 20, 20);
  kneeGeo.scale(1.0, 1.15, 1.12);
  const knee = new THREE.Mesh(kneeGeo, skinMaterial);
  knee.position.set(hipX, kneeY, 0.012);
  knee.castShadow = true;
  legGroup.add(knee);

  // 3. Contoured Calf (Gastrocnemius curvature to slender ankle)
  const calfGeo = new THREE.CylinderGeometry(0.047, 0.032, calfLength, 24);
  const calfPos = calfGeo.attributes.position;
  // Modulate rear calf muscle bulge
  for (let i = 0; i < calfPos.count; i++) {
    const yVal = calfPos.getY(i);
    const zVal = calfPos.getZ(i);
    // Upper-mid calf has graceful muscle volume in back
    if (yVal > 0 && zVal < 0) {
      calfPos.setZ(i, zVal * 1.25);
    }
  }
  calfGeo.computeVertexNormals();

  const calf = new THREE.Mesh(calfGeo, skinMaterial);
  const calfY = kneeY - calfLength * 0.5 - 0.01;
  calf.position.set(hipX, calfY, -0.005);
  calf.castShadow = true;
  calf.receiveShadow = true;
  legGroup.add(calf);

  // 4. Sculpted Fashion Mannequin Foot
  const footGroup = new THREE.Group();
  const ankleY = kneeY - calfLength - 0.015;

  // Ankle malleolus bones
  const ankleGeo = new THREE.SphereGeometry(0.032, 16, 16);
  ankleGeo.scale(1.15, 0.85, 0.95);
  const ankle = new THREE.Mesh(ankleGeo, skinMaterial);
  ankle.position.set(hipX, ankleY, 0);
  legGroup.add(ankle);

  // Foot body (arch, heel, instep)
  const footGeo = new THREE.BoxGeometry(0.065, 0.038, 0.165);
  const footMesh = new THREE.Mesh(footGeo, skinMaterial);
  footMesh.position.set(hipX, 0.019, 0.032);
  footMesh.castShadow = true;
  footMesh.receiveShadow = true;
  legGroup.add(footMesh);

  return legGroup;
}

/**
 * Creates modular clothing layer geometries that can be toggled independently:
 * Crewneck/T-Shirt, Tailored Button-Down, Tailored Trousers, Selvedge Denim, Blazer, and Boots.
 */
function createClothingLayers(
  heightScale: number,
  shoulderScale: number,
  chestScale: number,
  waistScale: number,
  hipScale: number,
  inseamScale: number,
  clothingMaterials: Record<string, THREE.MeshStandardMaterial>
): THREE.Group {
  const clothingGroup = new THREE.Group();

  // -------------------------------------------------------------
  // 1. Crewneck T-Shirt / Sweater (Tops)
  // -------------------------------------------------------------
  const crewneckGroup = new THREE.Group();
  crewneckGroup.name = 'top_crewneck';

  // Torso fabric shell with slight ease over the body
  const shirtTorsoGeo = new THREE.CylinderGeometry(
    0.175 * shoulderScale,
    0.155 * hipScale,
    0.46 * heightScale,
    28
  );
  shirtTorsoGeo.scale(1.04, 1.0, 0.82 * chestScale);
  const shirtTorso = new THREE.Mesh(shirtTorsoGeo, clothingMaterials.crewneck);
  shirtTorso.position.set(0, 1.23 * heightScale, 0);
  shirtTorso.castShadow = true;
  crewneckGroup.add(shirtTorso);

  // Ribbed Crewneck Collar
  const collarGeo = new THREE.TorusGeometry(0.066, 0.01, 16, 32);
  collarGeo.rotateX(Math.PI * 0.5);
  const collar = new THREE.Mesh(collarGeo, clothingMaterials.crewneck);
  collar.position.set(0, 1.46 * heightScale, -0.005);
  crewneckGroup.add(collar);

  // Short Sleeves
  [-1, 1].forEach(side => {
    const sleeveGeo = new THREE.CylinderGeometry(0.048, 0.044, 0.14, 20);
    sleeveGeo.rotateZ(side * -0.15);
    const sleeve = new THREE.Mesh(sleeveGeo, clothingMaterials.crewneck);
    sleeve.position.set(side * (0.21 * shoulderScale + 0.02), 1.38 * heightScale, 0);
    sleeve.castShadow = true;
    crewneckGroup.add(sleeve);
  });

  clothingGroup.add(crewneckGroup);

  // -------------------------------------------------------------
  // 2. Tailored Button-Down Shirt (Tops)
  // -------------------------------------------------------------
  const shirtGroup = new THREE.Group();
  shirtGroup.name = 'top_shirt';

  const bShirtGeo = new THREE.CylinderGeometry(
    0.178 * shoulderScale,
    0.15 * hipScale,
    0.48 * heightScale,
    28
  );
  bShirtGeo.scale(1.05, 1.0, 0.84 * chestScale);
  const bShirt = new THREE.Mesh(bShirtGeo, clothingMaterials.shirt);
  bShirt.position.set(0, 1.22 * heightScale, 0);
  shirtGroup.add(bShirt);

  // Structured collar stand
  const sCollarGeo = new THREE.CylinderGeometry(0.066, 0.07, 0.038, 24, 1, true);
  const sCollar = new THREE.Mesh(sCollarGeo, clothingMaterials.shirt);
  sCollar.position.set(0, 1.465 * heightScale, -0.005);
  shirtGroup.add(sCollar);

  // Front placket line
  const placketGeo = new THREE.BoxGeometry(0.018, 0.46 * heightScale, 0.008);
  const placket = new THREE.Mesh(placketGeo, clothingMaterials.shirt);
  placket.position.set(0, 1.23 * heightScale, 0.115 * chestScale);
  shirtGroup.add(placket);

  // Long Sleeves down to wrist
  [-1, 1].forEach(side => {
    const lSleeveGeo = new THREE.CylinderGeometry(0.046, 0.034, 0.45 * heightScale, 20);
    lSleeveGeo.rotateZ(side * -0.08);
    const lSleeve = new THREE.Mesh(lSleeveGeo, clothingMaterials.shirt);
    lSleeve.position.set(side * (0.23 * shoulderScale), 1.22 * heightScale, 0);
    lSleeve.castShadow = true;
    shirtGroup.add(lSleeve);
  });

  clothingGroup.add(shirtGroup);

  // -------------------------------------------------------------
  // 3. Tailored Wool Trousers (Bottoms)
  // -------------------------------------------------------------
  const trouserGroup = new THREE.Group();
  trouserGroup.name = 'bottom_trousers';

  // High-rise waistband & pelvic block
  const waistBandGeo = new THREE.CylinderGeometry(
    0.142 * waistScale,
    0.168 * hipScale,
    0.22 * heightScale,
    28
  );
  waistBandGeo.scale(1.02, 1.0, 0.88 * hipScale);
  const waistBand = new THREE.Mesh(waistBandGeo, clothingMaterials.trousers);
  waistBand.position.set(0, 0.92 * heightScale, 0);
  trouserGroup.add(waistBand);

  // Tailored Trouser Legs with sharp pressed crease
  [-1, 1].forEach(side => {
    const legGeo = new THREE.CylinderGeometry(
      0.072 * hipScale,
      0.048,
      0.78 * inseamScale,
      24
    );
    const trouserLeg = new THREE.Mesh(legGeo, clothingMaterials.trousers);
    trouserLeg.position.set(side * 0.088 * hipScale, 0.44 * inseamScale, 0.005);
    trouserLeg.castShadow = true;
    trouserGroup.add(trouserLeg);

    // Subtle front pressed crease line
    const creaseGeo = new THREE.BoxGeometry(0.004, 0.74 * inseamScale, 0.006);
    const crease = new THREE.Mesh(creaseGeo, clothingMaterials.trousers);
    crease.position.set(side * 0.088 * hipScale, 0.44 * inseamScale, 0.065);
    trouserGroup.add(crease);
  });

  clothingGroup.add(trouserGroup);

  // -------------------------------------------------------------
  // 4. Selvedge Raw Denim Jeans (Bottoms)
  // -------------------------------------------------------------
  const jeansGroup = new THREE.Group();
  jeansGroup.name = 'bottom_jeans';

  const jeansWaistGeo = new THREE.CylinderGeometry(
    0.144 * waistScale,
    0.169 * hipScale,
    0.21 * heightScale,
    28
  );
  jeansWaistGeo.scale(1.02, 1.0, 0.89 * hipScale);
  const jeansWaist = new THREE.Mesh(jeansWaistGeo, clothingMaterials.jeans);
  jeansWaist.position.set(0, 0.91 * heightScale, 0);
  jeansGroup.add(jeansWaist);

  [-1, 1].forEach(side => {
    const jLegGeo = new THREE.CylinderGeometry(
      0.071 * hipScale,
      0.046,
      0.78 * inseamScale,
      24
    );
    const jLeg = new THREE.Mesh(jLegGeo, clothingMaterials.jeans);
    jLeg.position.set(side * 0.088 * hipScale, 0.44 * inseamScale, 0.005);
    jLeg.castShadow = true;
    jeansGroup.add(jLeg);
  });

  clothingGroup.add(jeansGroup);

  // -------------------------------------------------------------
  // 5. Tailored Wool Blazer / Outerwear
  // -------------------------------------------------------------
  const blazerGroup = new THREE.Group();
  blazerGroup.name = 'outerwear_blazer';

  // Structured shoulder pads & body
  const blazerTorsoGeo = new THREE.CylinderGeometry(
    0.20 * shoulderScale,
    0.17 * hipScale,
    0.58 * heightScale,
    28
  );
  blazerTorsoGeo.scale(1.08, 1.0, 0.9 * chestScale);
  const blazerTorso = new THREE.Mesh(blazerTorsoGeo, clothingMaterials.blazer);
  blazerTorso.position.set(0, 1.2 * heightScale, 0);
  blazerTorso.castShadow = true;
  blazerGroup.add(blazerTorso);

  // Notched Lapels
  [-1, 1].forEach(side => {
    const lapelGeo = new THREE.BoxGeometry(0.045, 0.28, 0.012);
    lapelGeo.rotateZ(side * 0.22);
    const lapel = new THREE.Mesh(lapelGeo, clothingMaterials.blazer);
    lapel.position.set(side * 0.065, 1.34 * heightScale, 0.125 * chestScale);
    blazerGroup.add(lapel);
  });

  // Blazer Sleeves with tailored break
  [-1, 1].forEach(side => {
    const bSleeveGeo = new THREE.CylinderGeometry(0.052, 0.038, 0.48 * heightScale, 20);
    bSleeveGeo.rotateZ(side * -0.09);
    const bSleeve = new THREE.Mesh(bSleeveGeo, clothingMaterials.blazer);
    bSleeve.position.set(side * (0.24 * shoulderScale), 1.21 * heightScale, 0);
    bSleeve.castShadow = true;
    blazerGroup.add(bSleeve);
  });

  clothingGroup.add(blazerGroup);

  // -------------------------------------------------------------
  // 6. Footwear: Chelsea Boots & Minimal Sneakers
  // -------------------------------------------------------------
  const bootsGroup = new THREE.Group();
  bootsGroup.name = 'footwear_boots';

  [-1, 1].forEach(side => {
    // Boot shaft extending above ankle
    const shaftGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.11, 20);
    const shaft = new THREE.Mesh(shaftGeo, clothingMaterials.boots);
    shaft.position.set(side * 0.088 * hipScale, 0.07, 0.005);
    shaft.castShadow = true;
    bootsGroup.add(shaft);

    // Boot foot & chisel toe
    const bFootGeo = new THREE.BoxGeometry(0.07, 0.046, 0.18);
    const bFoot = new THREE.Mesh(bFootGeo, clothingMaterials.boots);
    bFoot.position.set(side * 0.088 * hipScale, 0.024, 0.036);
    bFoot.castShadow = true;
    bootsGroup.add(bFoot);
  });
  clothingGroup.add(bootsGroup);

  const sneakersGroup = new THREE.Group();
  sneakersGroup.name = 'footwear_sneakers';

  [-1, 1].forEach(side => {
    // Cupsole
    const soleGeo = new THREE.BoxGeometry(0.072, 0.022, 0.182);
    const sole = new THREE.Mesh(soleGeo, clothingMaterials.sneakersSole);
    sole.position.set(side * 0.088 * hipScale, 0.011, 0.034);
    sneakersGroup.add(sole);

    // Upper
    const upperGeo = new THREE.BoxGeometry(0.068, 0.038, 0.174);
    const upper = new THREE.Mesh(upperGeo, clothingMaterials.sneakersUpper);
    upper.position.set(side * 0.088 * hipScale, 0.036, 0.034);
    upper.castShadow = true;
    sneakersGroup.add(upper);
  });
  clothingGroup.add(sneakersGroup);

  return clothingGroup;
}

/**
 * Creates visual measurement caliper rings at Chest, Waist, and Hip baselines
 * for holographic metric inspection.
 */
function createMeasurementGuides(
  heightScale: number,
  chestScale: number,
  waistScale: number,
  hipScale: number
): THREE.Group {
  const guidesGroup = new THREE.Group();

  const guideMat = new THREE.LineBasicMaterial({
    color: 0x244d3c,
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });

  // Chest Ring
  const chestCurve = new THREE.EllipseCurve(
    0, 0,
    0.18 * chestScale, 0.13 * chestScale,
    0, 2 * Math.PI,
    false, 0
  );
  const chestPoints = chestCurve.getPoints(50);
  const chestGeo = new THREE.BufferGeometry().setFromPoints(
    chestPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const chestRing = new THREE.Line(chestGeo, guideMat);
  chestRing.position.set(0, 1.32 * heightScale, 0);
  guidesGroup.add(chestRing);

  // Waist Ring
  const waistCurve = new THREE.EllipseCurve(
    0, 0,
    0.14 * waistScale, 0.105 * waistScale,
    0, 2 * Math.PI,
    false, 0
  );
  const waistPoints = waistCurve.getPoints(50);
  const waistGeo = new THREE.BufferGeometry().setFromPoints(
    waistPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const waistRing = new THREE.Line(waistGeo, guideMat);
  waistRing.position.set(0, 1.10 * heightScale, 0);
  guidesGroup.add(waistRing);

  // Hip Ring
  const hipCurve = new THREE.EllipseCurve(
    0, 0,
    0.175 * hipScale, 0.125 * hipScale,
    0, 2 * Math.PI,
    false, 0
  );
  const hipPoints = hipCurve.getPoints(50);
  const hipGeo = new THREE.BufferGeometry().setFromPoints(
    hipPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const hipRing = new THREE.Line(hipGeo, guideMat);
  hipRing.position.set(0, 0.90 * heightScale, 0);
  guidesGroup.add(hipRing);

  return guidesGroup;
}

/**
 * Main Builder Function: Builds the complete, high-quality 3D fashion avatar.
 */
export function buildHighQualityAvatar(
  measurements: BodyMeasurements,
  appearance: AvatarAppearanceConfig,
  initialLayers: AvatarLayersState = {
    top: 'none',
    bottom: 'none',
    outerwear: 'none',
    footwear: 'none',
  }
): AvatarBuilderResult {
  const rootGroup = new THREE.Group();
  const bodyMeshGroup = new THREE.Group();
  rootGroup.add(bodyMeshGroup);

  // 1. Setup Luxury Materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(appearance.skinTone || '#E0B594'),
    roughness: 0.38,
    metalness: 0.04,
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(appearance.hairColor || '#2B1E16'),
    roughness: 0.45,
    metalness: 0.15,
  });

  const clothingMaterials = {
    crewneck: new THREE.MeshStandardMaterial({
      color: 0xf4f1eb, // Crisp luxury ivory
      roughness: 0.82,
      metalness: 0.02,
    }),
    shirt: new THREE.MeshStandardMaterial({
      color: 0xffffff, // Pure white poplin
      roughness: 0.65,
      metalness: 0.02,
    }),
    trousers: new THREE.MeshStandardMaterial({
      color: 0x244d3c, // Forest Green bespoke wool
      roughness: 0.75,
      metalness: 0.05,
    }),
    jeans: new THREE.MeshStandardMaterial({
      color: 0x22364e, // Indigo raw selvedge denim
      roughness: 0.88,
      metalness: 0.02,
    }),
    blazer: new THREE.MeshStandardMaterial({
      color: 0x20211f, // Charcoal evening barathea
      roughness: 0.68,
      metalness: 0.06,
    }),
    boots: new THREE.MeshStandardMaterial({
      color: 0x181816, // Black burnished calfskin
      roughness: 0.28,
      metalness: 0.18,
    }),
    sneakersUpper: new THREE.MeshStandardMaterial({
      color: 0xf5f3ee, // Off-white nappa leather
      roughness: 0.45,
      metalness: 0.05,
    }),
    sneakersSole: new THREE.MeshStandardMaterial({
      color: 0xe6e3db, // Rubber cupsole
      roughness: 0.9,
      metalness: 0.0,
    }),
  };

  // 2. Compute Calibration Scaling
  const cal = calculateAvatarCalibration(measurements);

  // 3. Build Seamless Torso
  const torsoGeo = createSeamlessTorsoGeometry(
    cal.heightScale,
    cal.shoulderScale,
    cal.chestScale,
    cal.waistScale,
    cal.hipScale
  );
  const torsoMesh = new THREE.Mesh(torsoGeo, skinMaterial);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  bodyMeshGroup.add(torsoMesh);

  // 4. Build Neck
  const neckGeo = new THREE.CylinderGeometry(0.046, 0.056, 0.11 * cal.heightScale, 24);
  const neck = new THREE.Mesh(neckGeo, skinMaterial);
  neck.position.set(0, 1.51 * cal.heightScale, -0.008);
  neck.castShadow = true;
  bodyMeshGroup.add(neck);

  // 5. Build Sculpted Head & Face
  const headGroup = createSculptedHeadMesh(skinMaterial);
  headGroup.position.set(0, 1.66 * cal.heightScale, 0);
  bodyMeshGroup.add(headGroup);

  // 6. Build Hair Mesh
  let hairMeshGroup = createHairstyleMesh(appearance.hairStyle, hairMaterial);
  hairMeshGroup.position.set(0, 1.66 * cal.heightScale, 0);
  bodyMeshGroup.add(hairMeshGroup);

  // 7. Build Arms and Hands
  [-1, 1].forEach(side => {
    const arm = createArmAndHand(
      side,
      cal.heightScale,
      cal.shoulderScale,
      cal.armScale,
      skinMaterial
    );
    bodyMeshGroup.add(arm);
  });

  // 8. Build Legs and Feet
  [-1, 1].forEach(side => {
    const leg = createLegAndFoot(
      side,
      cal.heightScale,
      cal.hipScale,
      cal.inseamScale,
      skinMaterial
    );
    bodyMeshGroup.add(leg);
  });

  // 9. Build Modular Clothing Layers
  const clothingGroup = createClothingLayers(
    cal.heightScale,
    cal.shoulderScale,
    cal.chestScale,
    cal.waistScale,
    cal.hipScale,
    cal.inseamScale,
    clothingMaterials
  );
  rootGroup.add(clothingGroup);

  // 10. Build Holographic Measurement Guides
  const measurementGuidesGroup = createMeasurementGuides(
    cal.heightScale,
    cal.chestScale,
    cal.waistScale,
    cal.hipScale
  );
  rootGroup.add(measurementGuidesGroup);

  // Helper: Apply Layer Visibility
  const applyLayerVisibility = (layers: AvatarLayersState) => {
    clothingGroup.children.forEach(child => {
      if (child.name === 'top_crewneck') child.visible = layers.top === 'crewneck';
      if (child.name === 'top_shirt') child.visible = layers.top === 'shirt';
      if (child.name === 'bottom_trousers') child.visible = layers.bottom === 'trousers';
      if (child.name === 'bottom_jeans') child.visible = layers.bottom === 'jeans';
      if (child.name === 'outerwear_blazer') child.visible = layers.outerwear === 'blazer';
      if (child.name === 'footwear_boots') child.visible = layers.footwear === 'boots';
      if (child.name === 'footwear_sneakers') child.visible = layers.footwear === 'sneakers';
    });
  };
  applyLayerVisibility(initialLayers);

  return {
    rootGroup,
    bodyMeshGroup,
    clothingGroup,
    measurementGuidesGroup,
    materials: {
      skin: skinMaterial,
      hair: hairMaterial,
      clothing: clothingMaterials,
    },
    updateMeasurements: (newM: BodyMeasurements) => {
      // Re-trigger calibration on measurement update
      const newCal = calculateAvatarCalibration(newM);
      torsoMesh.geometry.dispose();
      torsoMesh.geometry = createSeamlessTorsoGeometry(
        newCal.heightScale,
        newCal.shoulderScale,
        newCal.chestScale,
        newCal.waistScale,
        newCal.hipScale
      );
    },
    updateAppearance: (newApp: AvatarAppearanceConfig) => {
      if (newApp.skinTone) {
        skinMaterial.color.set(newApp.skinTone);
      }
      if (newApp.hairColor) {
        hairMaterial.color.set(newApp.hairColor);
      }
      if (newApp.hairStyle) {
        bodyMeshGroup.remove(hairMeshGroup);
        hairMeshGroup = createHairstyleMesh(newApp.hairStyle, hairMaterial);
        hairMeshGroup.position.set(0, 1.66 * cal.heightScale, 0);
        bodyMeshGroup.add(hairMeshGroup);
      }
    },
    updateLayers: applyLayerVisibility,
  };
}
