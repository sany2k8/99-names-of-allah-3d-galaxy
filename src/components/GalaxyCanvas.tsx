import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { NameOfAllah, namesOfAllah } from '../namesData';
import { audio } from '../audio';

interface GalaxyCanvasProps {
  selectedId: number | null;
  onSelectName: (name: NameOfAllah) => void;
  favorites: number[];
  completed: number[];
  searchQuery: string;
  selectedCategory: string;
  filterMode: 'all' | 'favorites' | 'completed';
  visualizationType: 'spiral' | 'nebula' | 'cluster' | 'wave' | 'supernova' | 'infinity' | 'galaxy' | 'pulsar' | 'aurora';
  theme: 'slate' | 'gold' | 'emerald' | 'rose' | 'ruby' | 'nebula' | 'sapphire' | 'amber' | 'amethyst';
  galaxyType: 'andromeda' | 'milkyway' | 'orion' | 'cosmicweb' | 'blackhole' | 'cluster' | 'pulsar' | 'supernova' | 'solarwind';
  starDensity?: number;
  constellationMode?: boolean;
  particleSize?: number;
}

export interface GalaxyCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const GalaxyCanvas = React.forwardRef<GalaxyCanvasRef, GalaxyCanvasProps>(({
  selectedId,
  onSelectName,
  favorites,
  completed,
  searchQuery,
  selectedCategory,
  filterMode,
  visualizationType,
  theme,
  galaxyType,
  starDensity = 9000,
  constellationMode = false,
  particleSize = 0.35,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  React.useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoom(0.8),
    zoomOut: () => handleZoom(1.25),
    resetZoom: handleResetZoom,
  }));

  // Keep refs of ThreeJS elements so we can dynamically animate camera/lookAt targets
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 30, 45));
  const cameraLookAtTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentCameraLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef<boolean>(false);
  const rotationAngle = useRef<number>(0);

  // We render the overlay labels statically via standard React state to keep DOM nodes stable,
  // then we update their styles/positions inside requestAnimationFrame directly on the DOM for 60fps performance and click-reliability.
  const [filteredNames, setFilteredNames] = useState<NameOfAllah[]>([]);
  const filteredNamesRef = useRef<NameOfAllah[]>([]);
  const selectedIdRef = useRef<number | null>(selectedId);
  const hoveredIdRef = useRef<number | null>(null);
  const themeRef = useRef<'slate' | 'gold' | 'emerald' | 'rose' | 'ruby' | 'nebula' | 'sapphire' | 'amber' | 'amethyst'>(theme);
  const searchQueryRef = useRef<string>(searchQuery);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Compute and cache the statically filtered list of names when search or filters update
  useEffect(() => {
    const list = namesOfAllah.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bengali.includes(searchQuery) ||
        item.name.includes(searchQuery);

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      const matchesFilterMode = filterMode === 'all' ||
        (filterMode === 'favorites' && favorites.includes(item.id)) ||
        (filterMode === 'completed' && completed.includes(item.id));

      return matchesSearch && matchesCategory && matchesFilterMode;
    });
    setFilteredNames(list);
    filteredNamesRef.current = list;
  }, [favorites, completed, searchQuery, selectedCategory, filterMode]);

  // We place names along a beautiful, expansive mathematical Golden Spiral within the galaxy
  const namePositions = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    // Generate positions based on active visualizationType
    const posList: THREE.Vector3[] = [];
    for (let i = 0; i < 99; i++) {
      if (visualizationType === 'spiral') {
        const theta = i * 2.39996;
        const r = 2.4 + Math.pow(i, 0.72) * 1.8;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        const y = Math.sin(r * 0.8) * 1.5 + (Math.random() - 0.5) * 0.4;
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'nebula') {
        const theta = (i / 99) * 2 * Math.PI * 4;
        const r = 12 + Math.sin(i * 0.3) * 2.5;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        const y = (Math.random() - 0.5) * 2.5 + Math.cos(theta * 1.5) * 1.2;
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'cluster') {
        const phi = Math.acos(-1 + (2 * i) / 99);
        const theta = Math.sqrt(99 * Math.PI) * phi;
        const r = 5 + Math.pow(Math.random(), 0.5) * 11;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'wave') {
        const theta = (i / 99) * 6 * Math.PI;
        const x = (i - 49.5) * 0.55;
        const y = Math.sin(theta) * 5;
        const z = Math.cos(theta) * 5;
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'supernova') {
        const phi = Math.acos(-1 + (2 * i) / 99);
        const theta = Math.sqrt(99 * Math.PI) * phi;
        const r = 9 + Math.sin(i * 0.5) * 1.8;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'infinity') {
        const t = (i / 99) * 2 * Math.PI;
        const scale = 14;
        const x = scale * Math.cos(t);
        const y = scale * Math.sin(2 * t) / 1.8;
        const z = Math.sin(t) * 4;
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'galaxy') {
        const arm = i % 2;
        const r = 2.0 + Math.pow(i, 0.72) * 1.5;
        const theta = r * 0.45 + (arm * Math.PI);
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        const y = (Math.random() - 0.5) * 0.4;
        posList.push(new THREE.Vector3(x, y, z));
      } else if (visualizationType === 'pulsar') {
        const isBeam = i % 5 === 0;
        if (isBeam) {
          const direction = i % 2 === 0 ? 1 : -1;
          const y = direction * (1 + (i / 99) * 12);
          const x = (Math.random() - 0.5) * 0.3;
          const z = (Math.random() - 0.5) * 0.3;
          posList.push(new THREE.Vector3(x, y, z));
        } else {
          const theta = (i / 99) * 2 * Math.PI * 3;
          const r = 3 + (i / 99) * 10;
          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          const y = (Math.random() - 0.5) * 0.5;
          posList.push(new THREE.Vector3(x, y, z));
        }
      } else if (visualizationType === 'aurora') {
        const t = (i / 99) * 2 * Math.PI * 2;
        const x = (i - 49.5) * 0.45;
        const y = Math.sin(t) * 3 + Math.cos(t * 0.5) * 1.5;
        const z = Math.sin(t * 0.5) * 6;
        posList.push(new THREE.Vector3(x, y, z));
      }
    }
    namePositions.current = posList;
  }, [visualizationType]);

  // Sync selectedId changes to fly the camera
  useEffect(() => {
    if (selectedId !== null) {
      const idx = selectedId - 1;
      const pos = namePositions.current[idx];
      if (pos) {
        // Fly camera to a nice viewpoint looking directly down at the node
        cameraTargetPos.current.set(pos.x + 3, pos.y + 4, pos.z + 5);
        cameraLookAtTarget.current.copy(pos);
      }
    } else {
      // Return to overall view
      if (visualizationType === 'wave') {
        cameraTargetPos.current.set(0, 15, 38);
      } else {
        cameraTargetPos.current.set(0, 32, 44);
      }
      cameraLookAtTarget.current.set(0, 0, 0);
    }
  }, [selectedId, visualizationType]);

  const handleZoom = (factor: number) => {
    if (!cameraTargetPos.current || !cameraLookAtTarget.current) return;
    const dir = new THREE.Vector3().subVectors(cameraTargetPos.current, cameraLookAtTarget.current);
    const currentDistance = dir.length();
    const newDistance = THREE.MathUtils.clamp(currentDistance * factor, 3, 100);
    dir.normalize().multiplyScalar(newDistance);
    cameraTargetPos.current.copy(cameraLookAtTarget.current).add(dir);
  };

  const handleResetZoom = () => {
    if (selectedId !== null) {
      const idx = selectedId - 1;
      const pos = namePositions.current[idx];
      if (pos) {
        cameraTargetPos.current.set(pos.x + 3, pos.y + 4, pos.z + 5);
        cameraLookAtTarget.current.copy(pos);
      }
    } else {
      if (visualizationType === 'wave') {
        cameraTargetPos.current.set(0, 15, 38);
      } else {
        cameraTargetPos.current.set(0, 32, 44);
      }
      cameraLookAtTarget.current.set(0, 0, 0);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || namePositions.current.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    let clearColorVal = 0x020205;
    if (theme === 'gold') clearColorVal = 0x0a0805;
    else if (theme === 'emerald') clearColorVal = 0x010704;
    else if (theme === 'rose') clearColorVal = 0x0a0208;
    else if (theme === 'ruby') clearColorVal = 0x0b0101;
    else if (theme === 'nebula') clearColorVal = 0x03020a;
    else if (theme === 'sapphire') clearColorVal = 0x010515;
    else if (theme === 'amber') clearColorVal = 0x0c0602;
    else if (theme === 'amethyst') clearColorVal = 0x08020c;

    scene.fog = new THREE.FogExp2(clearColorVal, 0.012);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 32, 44);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      alpha: true, // Allow transparent background for beautiful CSS backdrop color transitions
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(clearColorVal, 0); // 0 alpha makes background transparent, allowing CSS color transition
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLightIntensity = 
      theme === 'gold' ? 0.45 : 
      theme === 'emerald' ? 0.35 : 
      theme === 'rose' ? 0.35 : 
      theme === 'ruby' ? 0.35 : 
      theme === 'nebula' ? 0.38 : 
      theme === 'sapphire' ? 0.35 :
      theme === 'amber' ? 0.45 :
      theme === 'amethyst' ? 0.38 : 
      0.3;
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);

    let coreLightColor = 0xffb74d;
    if (theme === 'gold') coreLightColor = 0xffb300;
    else if (theme === 'emerald') coreLightColor = 0x2ecc71;
    else if (theme === 'rose') coreLightColor = 0xff75a0;
    else if (theme === 'ruby') coreLightColor = 0xef4444;
    else if (theme === 'nebula') coreLightColor = 0xd946ef;
    else if (theme === 'sapphire') coreLightColor = 0x3b82f6;
    else if (theme === 'amber') coreLightColor = 0xf97316;
    else if (theme === 'amethyst') coreLightColor = 0xa855f7;

    const coreLight = new THREE.PointLight(coreLightColor, 4, 30);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 5. Generate Galactic Starfield based on visualizationType
    const starCount = starDensity;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    // Dynamic star palette colors based on theme
    let colorCore = new THREE.Color(0xffe0b2);
    let colorArm1 = new THREE.Color(0x26c6da);
    let colorArm2 = new THREE.Color(0x7e57c2);
    let colorDust = new THREE.Color(0x0d47a1);
    let colorFlame = new THREE.Color(0xff7043);

    if (theme === 'gold') {
      colorCore = new THREE.Color(0xfff8e1);
      colorArm1 = new THREE.Color(0xffd54f);
      colorArm2 = new THREE.Color(0xffb300);
      colorDust = new THREE.Color(0x4e342e);
      colorFlame = new THREE.Color(0xffeb3b);
    } else if (theme === 'emerald') {
      colorCore = new THREE.Color(0xe8f8f5);
      colorArm1 = new THREE.Color(0x1abc9c);
      colorArm2 = new THREE.Color(0x27ae60);
      colorDust = new THREE.Color(0x0e3a2f);
      colorFlame = new THREE.Color(0xa3e4d7);
    } else if (theme === 'rose') {
      colorCore = new THREE.Color(0xfdf2f8);
      colorArm1 = new THREE.Color(0xf472b6);
      colorArm2 = new THREE.Color(0x8b5cf6);
      colorDust = new THREE.Color(0x310a24);
      colorFlame = new THREE.Color(0xec4899);
    } else if (theme === 'ruby') {
      colorCore = new THREE.Color(0xfef2f2);
      colorArm1 = new THREE.Color(0xf87171);
      colorArm2 = new THREE.Color(0xf59e0b);
      colorDust = new THREE.Color(0x450a0a);
      colorFlame = new THREE.Color(0xe11d48);
    } else if (theme === 'nebula') {
      colorCore = new THREE.Color(0xfae8ff);
      colorArm1 = new THREE.Color(0xec4899);
      colorArm2 = new THREE.Color(0x3b82f6);
      colorDust = new THREE.Color(0x1e1b4b);
      colorFlame = new THREE.Color(0x8b5cf6);
    } else if (theme === 'sapphire') {
      colorCore = new THREE.Color(0xe0f2fe);
      colorArm1 = new THREE.Color(0x38bdf8);
      colorArm2 = new THREE.Color(0x1d4ed8);
      colorDust = new THREE.Color(0x030712);
      colorFlame = new THREE.Color(0x60a5fa);
    } else if (theme === 'amber') {
      colorCore = new THREE.Color(0xfff7ed);
      colorArm1 = new THREE.Color(0xfb923c);
      colorArm2 = new THREE.Color(0xc2410c);
      colorDust = new THREE.Color(0x431407);
      colorFlame = new THREE.Color(0xfacc15);
    } else if (theme === 'amethyst') {
      colorCore = new THREE.Color(0xfaf5ff);
      colorArm1 = new THREE.Color(0xd8b4fe);
      colorArm2 = new THREE.Color(0x7e22ce);
      colorDust = new THREE.Color(0x1e1b4b);
      colorFlame = new THREE.Color(0xc084fc);
    }

    for (let i = 0; i < starCount; i++) {
      let x = 0, y = 0, z = 0;
      let mixColor = colorDust;

      if (galaxyType === 'andromeda') {
        const r = Math.pow(Math.random(), 2.2) * 35;
        const armIndex = i % 3;
        const armAngle = (armIndex * 2 * Math.PI) / 3;
        const theta = r * 0.45 + armAngle;
        const spreadX = (Math.random() - 0.5) * (1.5 + r * 0.15);
        const spreadY = (Math.random() - 0.5) * (0.8 + r * 0.08);
        const spreadZ = (Math.random() - 0.5) * (1.5 + r * 0.15);

        x = r * Math.cos(theta) + spreadX;
        y = (Math.sin(r * 0.8) * 0.8 + spreadY) * 0.7;
        z = r * Math.sin(theta) + spreadZ;

        if (r < 4) {
          mixColor = colorCore.clone().lerp(colorArm1, r / 4);
        } else if (armIndex === 0) {
          mixColor = colorArm1.clone().lerp(colorDust, (r - 4) / 31);
        } else if (armIndex === 1) {
          mixColor = colorArm2.clone().lerp(colorDust, (r - 4) / 31);
        } else {
          mixColor = colorDust.clone().lerp(colorCore, (r - 4) / 31);
        }
      } else if (galaxyType === 'orion') {
        const theta = Math.random() * 2 * Math.PI;
        const r = 12 + Math.pow(Math.random(), 0.5) * 6;
        const spreadY = (Math.random() - 0.5) * 4;
        const spreadR = (Math.random() - 0.5) * 1.5;

        x = (r + spreadR) * Math.cos(theta);
        z = (r + spreadR) * Math.sin(theta);
        y = spreadY + Math.sin(theta * 3) * 1.5;

        const ratio = (r - 12) / 6;
        if (Math.random() > 0.5) {
          mixColor = colorFlame.clone().lerp(colorArm2, ratio);
        } else {
          mixColor = colorArm2.clone().lerp(colorDust, ratio);
        }
      } else if (galaxyType === 'cluster') {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.pow(Math.random(), 2.0) * 22;

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        if (r < 5) {
          mixColor = colorCore.clone().lerp(colorFlame, r / 5);
        } else {
          mixColor = colorFlame.clone().lerp(colorDust, (r - 5) / 17);
        }
      } else if (galaxyType === 'blackhole') {
        const r = 3.5 + Math.pow(Math.random(), 2.0) * 16.5;
        const theta = Math.random() * 2 * Math.PI + (r * 0.8);
        const spreadY = (Math.random() - 0.5) * (0.05 * r);
        const spreadX = (Math.random() - 0.5) * 0.3;
        const spreadZ = (Math.random() - 0.5) * 0.3;

        x = r * Math.cos(theta) + spreadX;
        z = r * Math.sin(theta) + spreadZ;
        y = spreadY;

        if (r < 6) {
          mixColor = colorFlame.clone().lerp(colorCore, (r - 3.5) / 2.5);
        } else {
          mixColor = colorCore.clone().lerp(colorDust, (r - 6) / 14);
        }
      } else if (galaxyType === 'supernova') {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.pow(Math.random(), 2.5) * 38;
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        if (r < 6) {
          mixColor = colorCore.clone().lerp(colorFlame, r / 6);
        } else {
          mixColor = colorFlame.clone().lerp(colorDust, (r - 6) / 32);
        }
      } else if (galaxyType === 'cosmicweb') {
        const t = (i / starCount) * 2 * Math.PI * 8;
        const scale = 14 + (Math.random() - 0.5) * 2.5;
        x = scale * Math.cos(t) + (Math.random() - 0.5) * 1.2;
        y = (scale * Math.sin(2 * t) / 1.8) + (Math.random() - 0.5) * 1.2;
        z = (Math.sin(t) * 4) + (Math.random() - 0.5) * 1.2;

        const ratio = Math.abs(Math.sin(t));
        mixColor = colorArm1.clone().lerp(colorArm2, ratio);
      } else if (galaxyType === 'milkyway') {
        const r = Math.pow(Math.random(), 2.0) * 32;
        const armIndex = i % 2;
        const armAngle = armIndex * Math.PI;
        const theta = r * 0.45 + armAngle;
        const spreadX = (Math.random() - 0.5) * (1.2 + r * 0.1);
        const spreadY = (Math.random() - 0.5) * (0.5 + r * 0.05);
        const spreadZ = (Math.random() - 0.5) * (1.2 + r * 0.1);

        x = r * Math.cos(theta) + spreadX;
        y = spreadY;
        z = r * Math.sin(theta) + spreadZ;

        const ratio = r / 32;
        mixColor = colorCore.clone().lerp(colorArm1, ratio);
      } else if (galaxyType === 'pulsar') {
        const isBeam = i % 4 === 0;
        if (isBeam) {
          const direction = Math.random() > 0.5 ? 1 : -1;
          const r = Math.random() * 24;
          y = direction * r;
          x = (Math.random() - 0.5) * (0.3 + r * 0.04);
          z = (Math.random() - 0.5) * (0.3 + r * 0.04);
          mixColor = colorFlame.clone().lerp(colorCore, r / 24);
        } else {
          const theta = Math.random() * 2 * Math.PI;
          const r = Math.pow(Math.random(), 1.5) * 22;
          x = r * Math.cos(theta);
          z = r * Math.sin(theta);
          y = (Math.random() - 0.5) * (0.6 + r * 0.05);
          mixColor = colorArm2.clone().lerp(colorDust, r / 22);
        }
      } else if (galaxyType === 'solarwind') {
        const t = (i / starCount) * 4 * Math.PI * 2;
        const spreadX = (Math.random() - 0.5) * 1.5;
        const spreadY = (Math.random() - 0.5) * 3.5;
        const spreadZ = (Math.random() - 0.5) * 2.0;

        x = (t - 4 * Math.PI) * 2.2 + spreadX;
        y = Math.sin(t) * 3.5 + Math.cos(t * 0.5) * 2.0 + spreadY;
        z = Math.sin(t * 0.5) * 6.5 + spreadZ;

        const ratio = Math.abs(Math.sin(t));
        mixColor = colorArm1.clone().lerp(colorArm2, ratio);
      }

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      starColors[i * 3] = mixColor.r;
      starColors[i * 3 + 1] = mixColor.g;
      starColors[i * 3 + 2] = mixColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Star Material using a simple beautiful procedural circular star
    const canvasStar = document.createElement('canvas');
    canvasStar.width = 16;
    canvasStar.height = 16;
    const ctxStar = canvasStar.getContext('2d')!;
    const grad = ctxStar.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,240,220,0.8)');
    grad.addColorStop(0.5, 'rgba(100,200,255,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctxStar.fillStyle = grad;
    ctxStar.fillRect(0, 0, 16, 16);

    const starTexture = new THREE.CanvasTexture(canvasStar);
    const starMaterial = new THREE.PointsMaterial({
      size: particleSize,
      map: starTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starParticles = new THREE.Points(starGeometry, starMaterial);
    scene.add(starParticles);

    // 6. Generate interactive 99 Names stars
    const nameNodesGroup = new THREE.Group();
    const nameSpheres: THREE.Mesh[] = [];

    const sphereGeom = new THREE.SphereGeometry(0.35, 8, 8);

    namesOfAllah.forEach((item, idx) => {
      const pos = namePositions.current[idx];
      
      // Determine glow color based on favorite/completed state
      let colorVal = 0x90caf9; // default ethereal sky blue
      if (completed.includes(item.id)) {
        colorVal = 0x81c784; // bright emerald green for recitation completion
      } else if (favorites.includes(item.id)) {
        colorVal = 0xffb74d; // radiant gold for favorites
      }

      const sphereMat = new THREE.MeshBasicMaterial({
        color: colorVal,
        transparent: true,
        opacity: 0.85,
      });

      const mesh = new THREE.Mesh(sphereGeom, sphereMat);
      mesh.position.copy(pos);
      mesh.userData = { id: item.id, item };
      nameSpheres.push(mesh);
      nameNodesGroup.add(mesh);

      // Add a tiny halo ring around each name node
      const ringGeom = new THREE.RingGeometry(0.5, 0.55, 12);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorVal,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 10, 0); // Face upwards
      nameNodesGroup.add(ring);
    });

    // 6b. Build interactive 3D Category Constellation Lines on Completion
    const categoriesList = ['Mercy', 'Majesty', 'Wisdom', 'Power', 'Justice', 'Protection', 'Generosity'];
    const categoryColors: Record<string, number> = {
      Mercy: 0x81c784,      // Emerald Green
      Majesty: 0xffb74d,    // Warm Amber/Gold
      Wisdom: 0xa855f7,     // Velvet Purple
      Power: 0xef4444,      // Crimson Red
      Justice: 0xf97316,    // Vibrant Orange
      Protection: 0x06b6d4, // Bright Teal
      Generosity: 0xf59e0b, // Gold
    };

    categoriesList.forEach(cat => {
      const catNames = namesOfAllah.filter(n => n.category === cat);
      const allCompleted = catNames.length > 0 && catNames.every(n => completed.includes(n.id));
      if (allCompleted || constellationMode) {
        const points: THREE.Vector3[] = [];
        catNames.forEach(item => {
          const nameIdx = namesOfAllah.findIndex(n => n.id === item.id);
          const pos = namePositions.current[nameIdx];
          if (pos) {
            points.push(pos.clone());
          }
        });

        if (points.length > 1) {
          points.push(points[0].clone()); // Close the constellation ring

          const constellationGeom = new THREE.BufferGeometry().setFromPoints(points);
          
          // Ethereal core glowing constellation line
          // If allCompleted, make it very glowing, otherwise faint and ethereal
          const lineOpacity = allCompleted ? 0.8 : 0.22;
          const outerOpacity = allCompleted ? 0.25 : 0.06;

          const coreLineMat = new THREE.LineBasicMaterial({
            color: categoryColors[cat] || 0xffffff,
            transparent: true,
            opacity: lineOpacity,
            blending: THREE.AdditiveBlending,
          });
          const constellationLine = new THREE.Line(constellationGeom, coreLineMat);
          nameNodesGroup.add(constellationLine);

          // Ethereal outer halo glow line
          const outerLineMat = new THREE.LineBasicMaterial({
            color: categoryColors[cat] || 0xffffff,
            transparent: true,
            opacity: outerOpacity,
            blending: THREE.AdditiveBlending,
          });
          const outerConstellationLine = new THREE.Line(constellationGeom, outerLineMat);
          outerConstellationLine.scale.set(1.015, 1.015, 1.015);
          nameNodesGroup.add(outerConstellationLine);
        }
      }
    });

    scene.add(nameNodesGroup);

    // 7. Mouse Interact Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      // Get relative client positions
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      mouse2D.set(x, y);

      // Handle subtle general mouse tracking movement (sway camera slightly)
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      if (isDragging.current) {
        const deltaX = event.clientX - prevMousePos.current.x;
        rotationAngle.current += deltaX * 0.004;
        prevMousePos.current.x = event.clientX;

        // Track drag distance to differentiate click vs drag
        const dx = event.clientX - dragStart.current.x;
        const dy = event.clientY - dragStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 6) {
          hasDragged.current = true;
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      prevMousePos.current.x = event.clientX;
      dragStart.current = { x: event.clientX, y: event.clientY };
      hasDragged.current = false;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Mobile touch gestures
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging.current = true;
        prevMousePos.current.x = event.touches[0].clientX;
        dragStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        hasDragged.current = false;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isDragging.current && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - prevMousePos.current.x;
        rotationAngle.current += deltaX * 0.007;
        prevMousePos.current.x = event.touches[0].clientX;

        const dx = event.touches[0].clientX - dragStart.current.x;
        const dy = event.touches[0].clientY - dragStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 6) {
          hasDragged.current = true;
        }

        // update mouse coordinates for tooltips
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
        mouse2D.set(x, y);
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const handleClick = () => {
      if (hasDragged.current) {
        return; // Ignore clicks if dragging occurred
      }
      raycaster.setFromCamera(mouse2D, camera);
      const intersects = raycaster.intersectObjects(nameSpheres);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const item = hit.userData.item as NameOfAllah;
        onSelectName(item);
        audio.playSparkle('click');
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 1.08 : 0.92;
      handleZoom(factor);
    };

    // Attach listeners to canvas
    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousemove', handleMouseMove);
    canvasElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvasElem.addEventListener('click', handleClick);
    canvasElem.addEventListener('wheel', handleWheel, { passive: false });

    // Touch
    canvasElem.addEventListener('touchstart', handleTouchStart);
    canvasElem.addEventListener('touchmove', handleTouchMove);
    canvasElem.addEventListener('touchend', handleTouchEnd);

    // 8. Animation & Projection loop
    const tempV = new THREE.Vector3();
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Real-time audio reactive pulsing for stars
      const audioLevel = audio.getAudioLevel();
      starMaterial.size = 0.35 * (1.0 + audioLevel * 2.5);

      // Rotate galaxy and particles gently
      const rotationSpeed = 0.04;
      starParticles.rotation.y = rotationAngle.current + time * rotationSpeed;
      nameNodesGroup.rotation.y = rotationAngle.current + time * rotationSpeed;

      // Animate camera target smoothly (LERP)
      camera.position.lerp(cameraTargetPos.current, 0.04);
      currentCameraLookAt.current.lerp(cameraLookAtTarget.current, 0.04);
      camera.lookAt(currentCameraLookAt.current);

      // Subtle mouse tracking sway when not selecting specific ID
      if (selectedIdRef.current === null) {
        camera.position.x += (mouseRef.current.x * 4 - camera.position.x) * 0.01;
        camera.position.y += (mouseRef.current.y * 3 + 32 - camera.position.y) * 0.01;
      }

      // Check raycast intersections for tooltips & active glowing
      raycaster.setFromCamera(mouse2D, camera);
      const intersects = raycaster.intersectObjects(nameSpheres);
      let currentHovered: number | null = null;

      if (intersects.length > 0) {
        const hitObj = intersects[0].object as THREE.Mesh;
        currentHovered = hitObj.userData.id;
      }

      // Restore sizes and apply audio-reactive scaling
      nameSpheres.forEach(sphere => {
        const isHovered = sphere.userData.id === currentHovered;
        const isSelected = sphere.userData.id === selectedIdRef.current;

        if (!isHovered && !isSelected) {
          sphere.scale.set(1.0, 1.0, 1.0);
        } else if (isSelected) {
          // Selected name node pulses with audio
          const pulse = 1.6 + audioLevel * 0.8;
          sphere.scale.set(pulse, pulse, pulse);
        } else if (isHovered) {
          sphere.scale.set(1.4, 1.4, 1.4);
        }
      });

      if (currentHovered !== hoveredIdRef.current) {
        hoveredIdRef.current = currentHovered;
        if (currentHovered !== null && !isDragging.current) {
          audio.playSparkle('hover');
        }
      }

      // Direct DOM manipulation for name boxes: extremely high performance, no React re-render lag
      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const activeList = filteredNamesRef.current;

      namesOfAllah.forEach((item, idx) => {
        const el = containerRef.current?.querySelector(`[data-node-id="${item.id}"]`) as HTMLDivElement;
        if (!el) return;

        const isActive = activeList.some(filteredItem => filteredItem.id === item.id);
        if (!isActive) {
          el.style.display = 'none';
          return;
        }

        const originalPos = namePositions.current[idx];
        if (!originalPos) return;

        const rotatedPos = originalPos.clone();
        rotatedPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle.current + time * rotationSpeed);

        tempV.copy(rotatedPos);
        tempV.project(camera);

        const x = (tempV.x * widthHalf) + widthHalf;
        const y = -(tempV.y * heightHalf) + heightHalf;
        const inSight = tempV.z <= 1;

        const distToCenter = Math.sqrt(Math.pow(rotatedPos.x, 2) + Math.pow(rotatedPos.z, 2));
        const isCoreClose = distToCenter < 5.0;

        const isSelected = selectedIdRef.current === item.id;
        const isHovered = hoveredIdRef.current === item.id;

        const showLabel = inSight && (
          isHovered || 
          isSelected || 
          searchQueryRef.current !== '' || 
          (!isCoreClose && item.id % 2 === 0)
        );

        if (showLabel) {
          el.style.display = 'block';
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;

          const innerEl = el.firstElementChild as HTMLDivElement;
          if (innerEl) {
            if (isSelected) {
              innerEl.className = 'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-center border shadow-lg backdrop-blur-md transition-all duration-300 scale-110 bg-amber-500/25 border-amber-400 text-amber-200 shadow-amber-500/20 z-30';
            } else if (isHovered) {
              innerEl.className = 'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-center border shadow-lg backdrop-blur-md transition-all duration-300 scale-105 bg-sky-500/20 border-sky-400 text-sky-200 z-20';
            } else {
              innerEl.className = `flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-center border shadow-lg backdrop-blur-md transition-all duration-300 text-[10px] z-10 ${
                themeRef.current === 'gold' ? 'bg-[#0a0805]/50 border-amber-500/15 text-amber-200/80' :
                themeRef.current === 'emerald' ? 'bg-[#010704]/50 border-emerald-500/15 text-emerald-200/80' :
                themeRef.current === 'rose' ? 'bg-[#0a0208]/50 border-fuchsia-500/15 text-fuchsia-200/80' :
                themeRef.current === 'ruby' ? 'bg-[#0b0101]/50 border-red-500/15 text-red-200/80' :
                themeRef.current === 'nebula' ? 'bg-[#03020a]/50 border-violet-500/15 text-violet-200/80' :
                'bg-[#030712]/50 border-white/5 text-gray-300'
              }`;
            }
          }
        } else {
          el.style.display = 'none';
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Clean up on destroy
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      canvasElem.removeEventListener('mousemove', handleMouseMove);
      canvasElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasElem.removeEventListener('click', handleClick);
      canvasElem.removeEventListener('wheel', handleWheel);

      canvasElem.removeEventListener('touchstart', handleTouchStart);
      canvasElem.removeEventListener('touchmove', handleTouchMove);
      canvasElem.removeEventListener('touchend', handleTouchEnd);

      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      sphereGeom.dispose();
      starTexture.dispose();
    };
  }, [visualizationType, theme, completed, favorites, galaxyType, starDensity, constellationMode, particleSize]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Trail Star-Dust Particle Simulation
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxLife: number;
      life: number;
      color: string;
    }> = [];

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const colorsByTheme = {
      gold: ['rgba(245, 158, 11, 0.75)', 'rgba(251, 191, 36, 0.75)', 'rgba(255, 251, 235, 0.95)', 'rgba(217, 119, 6, 0.55)'],
      emerald: ['rgba(16, 185, 129, 0.75)', 'rgba(52, 211, 153, 0.75)', 'rgba(236, 253, 245, 0.95)', 'rgba(5, 150, 105, 0.55)'],
      rose: ['rgba(217, 70, 239, 0.75)', 'rgba(244, 114, 182, 0.75)', 'rgba(253, 242, 248, 0.95)', 'rgba(192, 38, 211, 0.55)'],
      ruby: ['rgba(239, 68, 68, 0.75)', 'rgba(248, 113, 113, 0.75)', 'rgba(254, 242, 242, 0.95)', 'rgba(220, 38, 38, 0.55)'],
      nebula: ['rgba(139, 92, 246, 0.75)', 'rgba(167, 139, 250, 0.75)', 'rgba(250, 232, 255, 0.95)', 'rgba(109, 40, 217, 0.55)'],
      slate: ['rgba(14, 165, 233, 0.75)', 'rgba(56, 189, 248, 0.75)', 'rgba(240, 249, 255, 0.95)', 'rgba(2, 132, 199, 0.55)'],
    };

    const getThemeColors = () => {
      const activeTheme = themeRef.current || 'slate';
      return colorsByTheme[activeTheme as keyof typeof colorsByTheme] || colorsByTheme.slate;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const themeColors = getThemeColors();
      // Emit dust particles on movement
      for (let i = 0; i < 3; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6 - 0.4, // float slightly upwards
          size: Math.random() * 3.2 + 0.8,
          maxLife: Math.random() * 35 + 20,
          life: 0,
          color: themeColors[Math.floor(Math.random() * themeColors.length)],
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      const themeColors = getThemeColors();
      for (let i = 0; i < 2; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6 - 0.4,
          size: Math.random() * 3.2 + 0.8,
          maxLife: Math.random() * 35 + 20,
          life: 0,
          color: themeColors[Math.floor(Math.random() * themeColors.length)],
        });
      }
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', onMouseMove);
      parent.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        
        const ratio = 1 - p.life / p.maxLife;
        const currentSize = p.size * ratio;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(updateAndDraw);
    };

    animationId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', onMouseMove);
        parent.removeEventListener('touchmove', onTouchMove);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  const themeBgClasses = {
    slate: 'bg-[#020205]',
    gold: 'bg-[#0a0805]',
    emerald: 'bg-[#010704]',
    rose: 'bg-[#0a0208]',
    ruby: 'bg-[#0b0101]',
    nebula: 'bg-[#03020a]',
  };

  return (
    <div id="galaxy-viewport" ref={containerRef} className={`relative w-full h-full ${themeBgClasses[theme] || 'bg-[#020205]'} transition-colors duration-1000 ease-in-out overflow-hidden select-none cursor-grab active:cursor-grabbing`}>
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-0" />
      <canvas ref={trailCanvasRef} className="w-full h-full absolute inset-0 z-[1] pointer-events-none" />

      {/* HTML Ambient Overlays to label Names on 3D Space */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {filteredNames.map(item => {
          return (
            <div
              key={item.id}
              data-node-id={item.id}
              style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                transform: 'translate(-50%, -100%)',
                display: 'none',
              }}
              className="transition-all duration-200 pointer-events-auto cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation();
                if (hasDragged.current) return;
                onSelectName(item);
              }}
              onMouseEnter={() => {
                if (!isDragging.current) {
                  hoveredIdRef.current = item.id;
                  audio.playSparkle('hover');
                }
              }}
              onMouseLeave={() => {
                hoveredIdRef.current = null;
              }}
            >
              <div
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-center border shadow-lg backdrop-blur-md transition-all duration-300 ${
                  theme === 'gold' ? 'bg-[#0a0805]/50 border-amber-500/15 text-amber-200/80 text-[10px]' :
                  theme === 'emerald' ? 'bg-[#010704]/50 border-emerald-500/15 text-emerald-200/80 text-[10px]' :
                  theme === 'rose' ? 'bg-[#0a0208]/50 border-fuchsia-500/15 text-fuchsia-200/80 text-[10px]' :
                  theme === 'ruby' ? 'bg-[#0b0101]/50 border-red-500/15 text-red-200/80 text-[10px]' :
                  theme === 'nebula' ? 'bg-[#03020a]/50 border-violet-500/15 text-violet-200/80 text-[10px]' :
                  'bg-[#030712]/50 border-white/5 text-gray-300 text-[10px]'
                }`}
              >
                <span className="font-arabic text-sm tracking-wide font-medium leading-relaxed pt-1.5 pb-0.5 block">
                  {item.name}
                </span>
                <span className="font-mono text-[9px] opacity-90 leading-tight">
                  {item.id}. {item.transliteration}
                </span>
              </div>
            </div>
          );
        })}
      </div>



      {/* Floating Space dust instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-slate-950/40 backdrop-blur-sm border border-white/5 rounded-full px-4 py-1 text-xs text-slate-400 font-mono tracking-wider flex items-center gap-2">
        <span>🖱️ Click + Drag to Rotate Galaxy</span>
        <span className="opacity-30">|</span>
        <span>✨ Select any Star to fly through</span>
      </div>
    </div>
  );
});
