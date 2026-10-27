import * as THREE from 'three';
import type { Player, Obstacle, Collectible, StageConfig, BusOption } from '../types/game';

// ============================================================================
// PROCEDURAL HIGH-RESOLUTION TEXTURE GENERATORS
// Guarantees 100% crisp textures, zero 404 image errors, instant loading
// ============================================================================

function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base asphalt dark charcoal tone
  ctx.fillStyle = '#23272d';
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro aggregate noise & asphalt speckles
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 36;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Tar repair crack lines and road seams
  ctx.strokeStyle = 'rgba(15, 17, 20, 0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.bezierCurveTo(180, 300, 90, 700, 210, 1024);
  ctx.moveTo(850, 0);
  ctx.bezierCurveTo(790, 400, 910, 650, 830, 1024);
  ctx.stroke();

  // Worn thermoplastic white dashed lane markings
  ctx.fillStyle = 'rgba(245, 245, 245, 0.92)';
  const dashWidth = 14;
  const dashHeight = 120;
  const spacing = 220;

  [341, 682].forEach((laneX) => {
    for (let y = 30; y < 1024; y += spacing) {
      ctx.fillRect(laneX - dashWidth / 2, y, dashWidth, dashHeight);
    }
  });

  // Road Edge Solid White Shoulder Lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(18, 0, 12, 1024);
  ctx.fillRect(1024 - 30, 0, 12, 1024);

  // Zebra Crossing stripes at bottom segment
  ctx.fillStyle = 'rgba(240, 240, 240, 0.75)';
  for (let zx = 50; zx < 980; zx += 42) {
    ctx.fillRect(zx, 940, 24, 65);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, 512, 512);

  // Concrete paver grid
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 3;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Yellow tactile blind paving strip (Dhaka modern sidewalk feature)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 200, 512, 50);
  ctx.fillStyle = '#d97706';
  for (let bx = 10; bx < 512; bx += 25) {
    for (let by = 208; by < 245; by += 16) {
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Alternating Dhaka Yellow and Dark Charcoal diagonal curb warning pattern
  const segW = 64;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#1f2937';
    ctx.fillRect(i * segW, 0, segW, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createShopBannerTexture(title: string, sub: string, bgColor: string, txtColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Background with glossy border
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 148);

  // Bengali Shop Title
  ctx.fillStyle = txtColor;
  ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 65);

  // Subtitle
  ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(sub, 256, 120);

  return new THREE.CanvasTexture(canvas);
}

function createBillboardTexture(brand: string, tagline: string, bgGradient: [string, string]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 768, 320);
  grad.addColorStop(0, bgGradient[0]);
  grad.addColorStop(1, bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 320);

  // Border & Glow
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 748, 300);

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(brand, 384, 120);

  // Tagline
  ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText(tagline, 384, 210);

  return new THREE.CanvasTexture(canvas);
}

function createRickshawArtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Traditional vibrant Dhaka Rickshaw Art back panel
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(0, 0, 512, 384);

  // Ornate geometric floral border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 488, 360);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.strokeRect(26, 26, 460, 332);

  // Peacock & Taj Mahal folk motif
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(256, 180, 100, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.ellipse(256, 190, 80, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ঢাকা মেট্রো', 256, 175);

  ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('বস স্পেশাল', 256, 220);

  return new THREE.CanvasTexture(canvas);
}

function createBusSignTexture(busName: string, destination: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 46px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${busName} • ${destination}`, 256, 64);

  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// MAIN REALISTIC 3D GRAPHICS ENGINE (ThreeGameScene)
// ============================================================================

export class ThreeGameScene {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Scene elements
  private playerGroup: THREE.Group;
  private playerRigs: {
    head: THREE.Group;
    torso: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    tie: THREE.Mesh;
    backpack: THREE.Group;
    umbrella: THREE.Group;
    teaAura: THREE.Mesh;
    shadow: THREE.Mesh;
  };

  private roadSegments: THREE.Group[] = [];
  private metroRailSegments: THREE.Group[] = [];
  private scenerySegments: THREE.Group[] = [];
  private obstaclesMap = new Map<number, THREE.Group>();
  private collectiblesMap = new Map<number, THREE.Group>();
  private busOptionsGroup = new THREE.Group();

  // Sky, clouds, sun
  private skyGroup: THREE.Group;
  private sunMesh!: THREE.Mesh;
  private clouds: THREE.Mesh[] = [];

  // Weather & Particles
  private rainSystem: THREE.Points | null = null;
  private particleGroup = new THREE.Group();
  private particleList: { mesh: THREE.Mesh; vy: number; vx: number; vz: number; life: number; maxLife: number }[] = [];

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private hemisphereLight: THREE.HemisphereLight;

  // Animation & time
  private animTimer: number = 0;
  private cameraShakeIntensity: number = 0;

  // Lane coordinates (3 distinct lanes across wide Dhaka road)
  public static readonly LANE_X = [-3.2, 0, 3.2];
  public static readonly ROAD_WIDTH = 11.0;
  public static readonly SEGMENT_LENGTH = 44;
  public static readonly NUM_SEGMENTS = 5;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Crisp morning Dhaka sky
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);

    // 2. Camera: True 3D third-person chase camera
    this.camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 260);
    this.camera.position.set(0, 4.2, 7.8);
    this.camera.lookAt(0, 1.4, -20);

    // 3. Renderer with high-end PBR visuals & soft shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Photorealistic Dhaka Lighting
    this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.65);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x7dd3fc, 0x475569, 0.6);
    this.scene.add(this.hemisphereLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    this.dirLight.position.set(22, 38, 25);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 110;
    const d = 22;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // 5. Initialize 3D Sky & Sun
    this.skyGroup = this.initSkyAndSun();
    this.scene.add(this.skyGroup);

    // 6. Initialize Infinite Procedural 3D World (Road, Metro Rail, Scenery)
    this.initWorld();

    // 7. Initialize Realistic 3D Player Character
    const { group, rigs } = this.createRealisticPlayer();
    this.playerGroup = group;
    this.playerRigs = rigs;
    this.scene.add(this.playerGroup);

    // 8. Bus options group
    this.scene.add(this.busOptionsGroup);

    // 9. Particle Systems & Weather
    this.scene.add(this.particleGroup);
    this.initWeatherSystems();
  }

  // =========================================================================
  // 1. SKY & CLOUDS
  // =========================================================================

  private initSkyAndSun(): THREE.Group {
    const sky = new THREE.Group();

    // Radiant Sun
    const sunGeo = new THREE.SphereGeometry(7, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3a1 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(38, 55, -140);
    sky.add(this.sunMesh);

    // Glowing Sun Corona Halo
    const haloGeo = new THREE.RingGeometry(7, 24, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(this.sunMesh.position);
    halo.lookAt(this.camera.position);
    sky.add(halo);

    // Fluffy 3D Clouds drifting in sky
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05
    });

    for (let c = 0; c < 12; c++) {
      const cloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puffGeo = new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(p * 3.5 - numPuffs * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 3);
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 180,
        35 + Math.random() * 25,
        -Math.random() * 200 + 20
      );
      this.clouds.push(cloud as any);
      sky.add(cloud);
    }

    return sky;
  }

  // =========================================================================
  // 2. PROCEDURAL WORLD CREATION
  // =========================================================================

  private initWorld() {
    for (let i = 0; i < ThreeGameScene.NUM_SEGMENTS; i++) {
      const segZ = -i * ThreeGameScene.SEGMENT_LENGTH;

      // 1. Road segment
      const roadSeg = this.createRoadSegment(segZ);
      this.roadSegments.push(roadSeg);
      this.scene.add(roadSeg);

      // 2. Elevated Dhaka Metro Rail (মেট্রোরেল লাইন ৬) viaduct on left
      const metroSeg = this.createMetroRailSegment(segZ, i);
      this.metroRailSegments.push(metroSeg);
      this.scene.add(metroSeg);

      // 3. Roadside Buildings, Overhead Cables, Trees & Street Furniture
      const scenerySeg = this.createScenerySegment(segZ, i);
      this.scenerySegments.push(scenerySeg);
      this.scene.add(scenerySeg);
    }
  }

  // Realistic Dhaka 3-Lane Asphalt Road with Curbs and Sidewalks
  private createRoadSegment(zPos: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zPos;

    // Asphalt Road Mesh with PBR Material
    const roadGeo = new THREE.PlaneGeometry(ThreeGameScene.ROAD_WIDTH, ThreeGameScene.SEGMENT_LENGTH);
    const roadTex = createAsphaltTexture();
    roadTex.repeat.set(1, 2);

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.12
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    group.add(road);

    // Sidewalks (Tiled concrete pavers)
    const walkTex = createSidewalkTexture();
    walkTex.repeat.set(1, 4);
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: walkTex,
      roughness: 0.85
    });

    // Curbs (Alternating Dhaka yellow/black hazard pattern)
    const curbTex = createCurbTexture();
    curbTex.repeat.set(8, 1);
    const curbMat = new THREE.MeshStandardMaterial({
      map: curbTex,
      roughness: 0.7
    });

    [-1, 1].forEach((side) => {
      const curbX = side * (ThreeGameScene.ROAD_WIDTH / 2 + 0.25);
      const walkX = side * (ThreeGameScene.ROAD_WIDTH / 2 + 2.5);

      // Curbs with chamfer
      const curbGeo = new THREE.BoxGeometry(0.5, 0.32, ThreeGameScene.SEGMENT_LENGTH);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(curbX, 0.16, 0);
      curb.receiveShadow = true;
      curb.castShadow = true;
      group.add(curb);

      // Paved Sidewalk
      const walkGeo = new THREE.BoxGeometry(4.0, 0.25, ThreeGameScene.SEGMENT_LENGTH);
      const walk = new THREE.Mesh(walkGeo, sidewalkMat);
      walk.position.set(walkX, 0.125, 0);
      walk.receiveShadow = true;
      group.add(walk);
    });

    // Continuous City Ground Plane (prevents any gaps between sidewalk and buildings)
    const groundGeo = new THREE.PlaneGeometry(160, ThreeGameScene.SEGMENT_LENGTH);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    group.add(ground);

    // Modern Double-arm Dhaka Streetlights
    [-ThreeGameScene.SEGMENT_LENGTH / 4, ThreeGameScene.SEGMENT_LENGTH / 4].forEach((lampZ) => {
      const lamp = this.createModernStreetLamp();
      lamp.position.set(ThreeGameScene.ROAD_WIDTH / 2 + 1.2, 0, lampZ);
      group.add(lamp);

      const lampLeft = this.createModernStreetLamp();
      lampLeft.position.set(-(ThreeGameScene.ROAD_WIDTH / 2 + 1.2), 0, lampZ);
      lampLeft.rotation.y = Math.PI;
      group.add(lampLeft);
    });

    return group;
  }

  // Elevated Dhaka Metro Rail (MRT Line 6) Viaduct with Concrete Piers
  private createMetroRailSegment(zPos: number, segIdx: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zPos;
    const metroX = -(ThreeGameScene.ROAD_WIDTH / 2 + 5.8);

    const concMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.75,
      metalness: 0.15
    });

    // Viaduct Box Girder Track Deck (spanning 44m)
    const deckGeo = new THREE.BoxGeometry(4.2, 1.4, ThreeGameScene.SEGMENT_LENGTH);
    const deck = new THREE.Mesh(deckGeo, concMat);
    deck.position.set(metroX, 8.5, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // Green sound barrier panels on track edge
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
    const barrierGeo = new THREE.BoxGeometry(0.2, 1.2, ThreeGameScene.SEGMENT_LENGTH);
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(metroX + 2.0, 9.8, 0);
    group.add(barrier);

    // Massive Concrete Piers (Pillars) supporting viaduct
    [-ThreeGameScene.SEGMENT_LENGTH / 4, ThreeGameScene.SEGMENT_LENGTH / 4].forEach((pz) => {
      const pierGeo = new THREE.CylinderGeometry(0.9, 1.1, 8.5, 12);
      const pier = new THREE.Mesh(pierGeo, concMat);
      pier.position.set(metroX, 4.25, pz);
      pier.castShadow = true;
      pier.receiveShadow = true;
      group.add(pier);

      // Pier crosshead hammerhead capital
      const capGeo = new THREE.BoxGeometry(4.4, 0.8, 1.8);
      const cap = new THREE.Mesh(capGeo, concMat);
      cap.position.set(metroX, 7.8, pz);
      cap.castShadow = true;
      group.add(cap);
    });

    // Dhaka Metro Rail Train (MRT Line 6) model rushing overhead on alternating segments!
    if (segIdx % 2 === 0) {
      const trainGroup = new THREE.Group();
      trainGroup.position.set(metroX, 9.9, 0);

      // Train car body (Silver with Green & Red Bangladesh ribbon)
      const carMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.7 });
      const trainBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 28), carMat);
      trainGroup.add(trainBody);

      // Iconic Green & Red Stripe
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x059669 });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.45, 28), stripeMat);
      stripe.position.y = 0.1;
      trainGroup.add(stripe);

      const redStripeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const redStripe = new THREE.Mesh(new THREE.BoxGeometry(3.26, 0.18, 28), redStripeMat);
      redStripe.position.y = -0.3;
      trainGroup.add(redStripe);

      // Train Windows
      const winMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
      const win = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.8, 26), winMat);
      win.position.y = 0.4;
      trainGroup.add(win);

      // Front Headlight (Emissive glowing LED)
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
      const fLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.2), lightMat);
      fLight.position.set(0, -0.4, -14.1);
      trainGroup.add(fLight);

      group.add(trainGroup);
    }

    return group;
  }

  // Roadside Buildings, Overhead Electric Cables, Flyovers, and Trees
  private createScenerySegment(zPos: number, segIdx: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zPos;

    // 1. Roadside Gulmohar & Banyan Trees in Sidewalk Planters
    [-ThreeGameScene.SEGMENT_LENGTH / 3, ThreeGameScene.SEGMENT_LENGTH / 3].forEach((tz) => {
      const tree = this.createRoadsideTree();
      tree.position.set(ThreeGameScene.ROAD_WIDTH / 2 + 3.2, 0, tz);
      group.add(tree);
    });

    // 2. Concrete Utility Poles with Tangled Dhaka Overhead Cables
    [-15, 15].forEach((pz) => {
      const pole = this.createUtilityPoleWithCables();
      pole.position.set(ThreeGameScene.ROAD_WIDTH / 2 + 1.8, 0, pz);
      group.add(pole);
    });

    // 3. Overhead Flyover Bridge spanning the roadway every 2 segments
    if (segIdx === 1) {
      const flyover = this.createOverheadFlyover();
      flyover.position.set(0, 7.8, 0);
      group.add(flyover);
    }

    // 4. Dhaka Multi-Story Commercial & Residential Buildings
    const bldgColors = [0xe2e8f0, 0xcbd5e1, 0x94a3b8, 0xfde047, 0x38bdf8, 0xf97316, 0x10b981];
    const shopList = [
      { title: 'ভাই ভাই ফার্মেসী', sub: 'ওষুধ ও সার্জিক্যাল', bg: '#047857', txt: '#ffffff' },
      { title: 'মা বাবার দোয়া টং', sub: 'স্পেশাল মালাই চা ও টোস্ট', bg: '#b45309', txt: '#fef08a' },
      { title: 'বিকাশ ও নগদ পয়েন্ট', sub: 'ক্যাশ ইন • ক্যাশ আউট', bg: '#be185d', txt: '#ffffff' },
      { title: 'হাজী বিরিয়ানি হাউজ', sub: 'খাঁটি সরিষার তেলের বিরিয়ানি', bg: '#b91c1c', txt: '#fef08a' },
      { title: 'বলাকা ট্রাভেলস', sub: 'এসি ও নন-এসি বাস টিকিট', bg: '#1d4ed8', txt: '#ffffff' },
      { title: 'ঢাকা চশমা ঘর', sub: 'আধুনিক ফ্রেম ও পাওয়ার গ্লাস', bg: '#4338ca', txt: '#ffffff' }
    ];

    [-1, 1].forEach((side) => {
      const bldgX = side * (ThreeGameScene.ROAD_WIDTH / 2 + (side < 0 ? 11.5 : 9.5));

      for (let b = 0; b < 2; b++) {
        const bZ = -b * 22 + 10;
        const bHeight = 16 + Math.random() * 14;
        const bWidth = 10;
        const bDepth = 18;
        const color = bldgColors[Math.floor(Math.random() * bldgColors.length)];

        // Building Main Block
        const bldgGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bldgMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(bldgX, bHeight / 2, bZ);
        bldg.castShadow = true;
        bldg.receiveShadow = true;
        group.add(bldg);

        // Windows with White Frames & Blue-Sky Glass Reflection
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
        const winGlassMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.15,
          metalness: 0.85
        });

        for (let wy = 3.5; wy < bHeight - 2; wy += 2.8) {
          for (let wz = -bDepth / 2 + 2.5; wz < bDepth / 2 - 2; wz += 3.6) {
            const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2.3), frameMat);
            winFrame.position.set(bldgX - side * (bWidth / 2 + 0.08), wy, bZ + wz);
            group.add(winFrame);

            const win = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.3, 2.1), winGlassMat);
            win.position.set(bldgX - side * (bWidth / 2 + 0.1), wy, bZ + wz);
            group.add(win);
          }
        }

        // Rooftop Water Tank (গাজী / আরএফএল পানির ট্যাংক)
        const tankGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 12);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.set(bldgX, bHeight + 1.1, bZ);
        tank.castShadow = true;
        group.add(tank);

        // Ground Floor Dhaka Shopfront Banner
        const shop = shopList[Math.floor(Math.random() * shopList.length)];
        const bannerTex = createShopBannerTexture(shop.title, shop.sub, shop.bg, shop.txt);
        const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
        const bannerGeo = new THREE.PlaneGeometry(7.2, 2.2);
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(bldgX - side * (bWidth / 2 + 0.15), 2.5, bZ);
        banner.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        group.add(banner);

        // Rooftop Mega Billboard on selected buildings
        if (Math.random() > 0.5) {
          const bbTex = createBillboardTexture('বিকাশ', 'সহজ ও নিরাপদ পেমেন্ট', ['#be185d', '#831843']);
          const bbMat = new THREE.MeshBasicMaterial({ map: bbTex });
          const bbMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.8), bbMat);
          bbMesh.position.set(bldgX - side * (bWidth / 2 + 0.1), bHeight + 2.4, bZ);
          bbMesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(bbMesh);
        }
      }
    });

    return group;
  }

  // Roadside Gulmohar / Banyan Tree with Foliage Clustered Canopy
  private createRoadsideTree(): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 4.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.1;
    trunk.castShadow = true;
    tree.add(trunk);

    // Tree Planter Box on Sidewalk
    const planterGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af });
    const planter = new THREE.Mesh(planterGeo, planterMat);
    planter.position.y = 0.2;
    tree.add(planter);

    // Leafy Clustered Canopy
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const leafClusters = [
      { x: 0, y: 4.8, z: 0, r: 1.8 },
      { x: -0.8, y: 4.2, z: 0.4, r: 1.3 },
      { x: 0.8, y: 4.4, z: -0.4, r: 1.4 },
      { x: 0.2, y: 5.6, z: 0.2, r: 1.2 }
    ];

    leafClusters.forEach((c) => {
      const geo = new THREE.SphereGeometry(c.r, 8, 8);
      const m = new THREE.Mesh(geo, leavesMat);
      m.position.set(c.x, c.y, c.z);
      m.castShadow = true;
      tree.add(m);
    });

    return tree;
  }

  // Utility Pole with Iconic Dhaka Tangled Overhead Cables
  private createUtilityPoleWithCables(): THREE.Group {
    const poleGroup = new THREE.Group();

    // Concrete utility pole
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.75;
    pole.castShadow = true;
    poleGroup.add(pole);

    // Crossarm
    const armGeo = new THREE.BoxGeometry(1.8, 0.12, 0.12);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.y = 7.0;
    poleGroup.add(arm);

    // Transformer cylinder
    const transGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 10);
    const transMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const trans = new THREE.Mesh(transGeo, transMat);
    trans.position.set(0.4, 5.8, 0);
    poleGroup.add(trans);

    return poleGroup;
  }

  // Overhead Flyover Bridge
  private createOverheadFlyover(): THREE.Group {
    const fly = new THREE.Group();

    const concMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    // Arching road deck
    const deckGeo = new THREE.BoxGeometry(ThreeGameScene.ROAD_WIDTH + 14, 1.2, 7.5);
    const deck = new THREE.Mesh(deckGeo, concMat);
    deck.castShadow = true;
    deck.receiveShadow = true;
    fly.add(deck);

    // Safety railings & Green highway signboards
    const signMat = new THREE.MeshBasicMaterial({ color: 0x059669 });
    const signGeo = new THREE.BoxGeometry(5.2, 1.4, 0.15);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.6, 3.8);
    fly.add(sign);

    return fly;
  }

  // Modern Dhaka Streetlamp with Glowing Light Fixture
  private createModernStreetLamp(): THREE.Group {
    const lamp = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });

    // Vertical steel pole
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 6.2, 8);
    const pole = new THREE.Mesh(poleGeo, metalMat);
    pole.position.y = 3.1;
    pole.castShadow = true;
    lamp.add(pole);

    // Curved mast arm extending over road
    const armGeo = new THREE.BoxGeometry(0.08, 0.08, 1.8);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.set(0, 6.1, -0.8);
    arm.rotation.x = -0.3;
    lamp.add(arm);

    // Glowing LED luminaire
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lumGeo = new THREE.BoxGeometry(0.3, 0.1, 0.6);
    const lum = new THREE.Mesh(lumGeo, glowMat);
    lum.position.set(0, 5.9, -1.6);
    lamp.add(lum);

    return lamp;
  }

  // =========================================================================
  // 3. ULTRA-REALISTIC 3D PLAYER CHARACTER (Bengali Executive Runner)
  // Camera is at +Z facing -Z. Character runs forward towards -Z.
  // Back faces +Z (towards player camera), Face faces -Z (forward).
  // =========================================================================

  private createRealisticPlayer(): { group: THREE.Group; rigs: any } {
    const group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdf9b64, // Authentic warm South Asian skin tone
      roughness: 0.55,
      metalness: 0.05
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5
    });
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Vivid red silk necktie
      roughness: 0.4
    });
    const pantMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Formal charcoal-navy trousers
      roughness: 0.7
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.4
    });
    const packMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Premium navy blue laptop backpack
      roughness: 0.6
    });

    // 1. Torso (Rounded executive white formal shirt)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.35;

    // Torso Body with natural shoulder taper
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.95, 12);
    torsoGeo.scale(1.0, 1.0, 0.68);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.castShadow = true;
    torsoGroup.add(torso);

    // Shirt Collar at top
    const collarGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.16, 12);
    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.position.y = 0.48;
    torsoGroup.add(collar);

    // Dynamic Fluttering Necktie:
    // Placed on chest (-Z) and extends backwards around side into view as wind whips it!
    const tieGeo = new THREE.BoxGeometry(0.12, 0.75, 0.05);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0.18, 0.05, -0.22); // Peeking over shoulder/chest in oncoming wind
    torsoGroup.add(tie);

    // Leather Belt & Chrome Buckle
    const beltGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 12);
    beltGeo.scale(1.02, 1.0, 0.7);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = -0.44;
    torsoGroup.add(belt);

    group.add(torsoGroup);

    // 2. Realistic Sculpted Head & Layered Hair
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.15;

    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    headGeo.scale(0.85, 1.0, 0.92);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Styled Layered Hair on back (+Z) and top
    const hairGeo = new THREE.SphereGeometry(0.34, 14, 14);
    hairGeo.scale(0.9, 0.88, 0.98);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.08, 0.02);
    headGroup.add(hair);

    // Modern Eyeglasses on face (-Z)
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.11, 0.11].forEach((gx) => {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.04), glassesMat);
      rim.position.set(gx, 0.04, -0.28);
      headGroup.add(rim);
    });

    group.add(headGroup);

    // 3. Legs & Oxford Dress Shoes
    const createLeg = (xOff: number): THREE.Group => {
      const legGroup = new THREE.Group();
      legGroup.position.set(xOff, 0.9, 0);

      // Tapered Dress Trouser Leg
      const legGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.95, 12);
      const leg = new THREE.Mesh(legGeo, pantMat);
      leg.position.y = -0.45;
      leg.castShadow = true;
      legGroup.add(leg);

      // Oxford Dress Shoe with defined heel & sole
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.88, 0);

      const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.52), shoeMat);
      shoeUpper.position.z = -0.06;
      shoeUpper.castShadow = true;
      shoeGroup.add(shoeUpper);

      // Brown Welt Sole
      const soleMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.54), soleMat);
      sole.position.set(0, -0.1, -0.06);
      shoeGroup.add(sole);

      legGroup.add(shoeGroup);
      return legGroup;
    };

    const leftLeg = createLeg(-0.22);
    const rightLeg = createLeg(0.22);
    group.add(leftLeg);
    group.add(rightLeg);

    // 4. Arms, Hands & Wristwatch
    const createArm = (xOff: number): THREE.Group => {
      const armGroup = new THREE.Group();
      armGroup.position.set(xOff, 1.72, 0);

      const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.72, 10);
      const arm = new THREE.Mesh(armGeo, shirtMat);
      arm.position.y = -0.36;
      arm.castShadow = true;
      armGroup.add(arm);

      // Wristwatch on left arm
      if (xOff < 0) {
        const watchMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
        const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), watchMat);
        watch.position.y = -0.68;
        armGroup.add(watch);
      }

      // Hand
      const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.y = -0.76;
      armGroup.add(hand);

      return armGroup;
    };

    const leftArm = createArm(-0.46);
    const rightArm = createArm(0.46);
    group.add(leftArm);
    group.add(rightArm);

    // 5. High-Detail Office Laptop Backpack ON BACK (+Z facing player camera)
    const packGroup = new THREE.Group();
    packGroup.position.set(0, 1.38, 0.26); // Mounted on back facing camera!

    // Main Backpack Body
    const packBodyGeo = new THREE.BoxGeometry(0.68, 0.82, 0.32);
    const packBody = new THREE.Mesh(packBodyGeo, packMat);
    packBody.castShadow = true;
    packGroup.add(packBody);

    // Front Zipper Pocket on backpack
    const pouchGeo = new THREE.BoxGeometry(0.56, 0.48, 0.12);
    const pouchMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 });
    const pouch = new THREE.Mesh(pouchGeo, pouchMat);
    pouch.position.set(0, -0.1, 0.18);
    packGroup.add(pouch);

    // Top Handle
    const handleGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 12, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 0.44, 0);
    packGroup.add(handle);

    // Padded Shoulder Straps wrapping over shoulders
    [-0.24, 0.24].forEach((sx) => {
      const strapGeo = new THREE.BoxGeometry(0.08, 0.82, 0.04);
      const strap = new THREE.Mesh(strapGeo, packMat);
      strap.position.set(sx, 0.02, -0.18);
      packGroup.add(strap);
    });

    group.add(packGroup);

    // 6. Umbrella Powerup Model
    const umbrellaGroup = new THREE.Group();
    umbrellaGroup.position.set(0.35, 2.7, 0);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.48, 16), canopyMat);
    canopy.position.y = 0.24;
    umbrellaGroup.add(canopy);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    );
    pole.position.y = -0.38;
    umbrellaGroup.add(pole);
    umbrellaGroup.visible = false;
    group.add(umbrellaGroup);

    // 7. Tea Boost Golden Aura
    const auraGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      wireframe: true
    });
    const teaAura = new THREE.Mesh(auraGeo, auraMat);
    teaAura.position.y = 1.3;
    teaAura.visible = false;
    group.add(teaAura);

    // 8. Ground Soft Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.4, 0.9);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    return {
      group,
      rigs: {
        head: headGroup,
        torso: torsoGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        tie,
        backpack: packGroup,
        umbrella: umbrellaGroup,
        teaAura,
        shadow
      }
    };
  }

  // =========================================================================
  // 4. REALISTIC 3D OBSTACLE MODELS (Dhaka Bus, Rickshaw, Green CNG, etc.)
  // =========================================================================

  public create3DObstacle(obs: Obstacle): THREE.Group {
    switch (obs.type) {
      case 'SLOW_BUS':
        return this.createRealisticDhakaBus('বলাকা', 'মতিঝিল');
      case 'RICKSHAW':
        return this.createRealisticRickshaw();
      case 'CNG':
        return this.createRealisticCNG();
      case 'POTHOLE':
        return this.createRealisticPothole();
      case 'MUD':
        return this.createRealisticMudPuddle();
      case 'BAMBOO':
        return this.createRealisticBambooHurdle();
      case 'TEA_STALL':
        return this.createRealisticTeaStall();
      default:
        return this.createRealisticPothole();
    }
  }

  // 1. Realistic Dhaka Local Bus ("বলাকা স্পেশাল" / "বিকল্প")
  public createRealisticDhakaBus(busName: string = 'বলাকা', dest: string = 'মতিঝিল'): THREE.Group {
    const bus = new THREE.Group();
    const busLen = 8.5;
    const busW = 2.8;
    const busH = 3.4;

    // Aerodynamic Curved Coachwork (Automotive Orange & Yellow)
    const bodyGeo = new THREE.BoxGeometry(busW, busH, busLen);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.35,
      metalness: 0.25
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = busH / 2 + 0.45;
    body.castShadow = true;
    body.receiveShadow = true;
    bus.add(body);

    // Chrome Heavy Duty Front & Rear Bumpers
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const bumperGeo = new THREE.BoxGeometry(busW + 0.1, 0.45, 0.35);
    const rBumper = new THREE.Mesh(bumperGeo, chromeMat);
    rBumper.position.set(0, 0.5, busLen / 2 + 0.12);
    bus.add(rBumper);

    // Chrome Grille on Front
    const fGrille = new THREE.Mesh(new THREE.BoxGeometry(busW * 0.7, 0.9, 0.2), chromeMat);
    fGrille.position.set(0, 1.2, -busLen / 2 - 0.08);
    bus.add(fGrille);

    // Racing Stripes (Cyan & Yellow Dhaka Transport Decals)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(busW + 0.06, 0.4, busLen - 0.2), stripeMat);
    stripe.position.y = 1.7;
    bus.add(stripe);

    const stripe2Mat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(busW + 0.07, 0.28, busLen - 0.2), stripe2Mat);
    stripe2.position.y = 2.2;
    bus.add(stripe2);

    // Glass Windows (Front Windshield, Rear Window, Side Windows)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.08,
      metalness: 0.95
    });
    // Rear Window
    const rearWin = new THREE.Mesh(new THREE.BoxGeometry(busW - 0.4, 1.2, 0.1), glassMat);
    rearWin.position.set(0, 2.6, busLen / 2 + 0.02);
    bus.add(rearWin);

    // Illuminated Rear Destination Board ("বলাকা • মতিঝিল")
    const signTex = createBusSignTexture(busName, dest);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.65), signMat);
    signMesh.position.set(0, 3.4, busLen / 2 + 0.03);
    bus.add(signMesh);

    // Glowing Dual Xenon Headlights + Taillights
    const headGlow = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.9, 0.9].forEach((hx) => {
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12), headGlow);
      head.rotation.x = Math.PI / 2;
      head.position.set(hx, 1.2, -busLen / 2 - 0.05);
      bus.add(head);
    });

    const tailGlow = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    [-1.0, 1.0].forEach((tx) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.1), tailGlow);
      tail.position.set(tx, 1.4, busLen / 2 + 0.03);
      bus.add(tail);
    });

    // 4 Realistic Rubber Bus Wheels with Chrome Rims
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.85 });

    [-1.35, 1.35].forEach((wx) => {
      [-2.4, 2.4].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, tireMat);
        wheel.position.set(wx, 0.55, wz);
        wheel.castShadow = true;

        // Chrome Hubcap
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.44, 12), chromeMat);
        hub.rotation.z = Math.PI / 2;
        wheel.add(hub);

        bus.add(wheel);
      });
    });

    // Roof Luggage Rack with Cargo & Trunks
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(busW - 0.4, 0.2, busLen - 2), rackMat);
    rack.position.set(0, busH + 0.55, 0);
    bus.add(rack);

    // Stored luggage boxes on roof
    const boxColors = [0x78350f, 0x1e3a8a, 0x065f46];
    [-1.2, 0.5, 2.0].forEach((bz, idx) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 1.2),
        new THREE.MeshStandardMaterial({ color: boxColors[idx % 3], roughness: 0.7 })
      );
      box.position.set((idx % 2 === 0 ? 0.3 : -0.3), busH + 0.95, bz);
      box.castShadow = true;
      bus.add(box);
    });

    // Animated Bus Helper (বাসের হেলপার) hanging onto the open rear door!
    const helperGroup = new THREE.Group();
    helperGroup.position.set(busW / 2 + 0.18, 1.9, busLen / 2 - 1.2);

    const helperBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.7, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x15803d })
    );
    helperGroup.add(helperBody);

    const helperHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xdf9b64 })
    );
    helperHead.position.y = 0.5;
    helperGroup.add(helperHead);

    // Waving Red Gamcha in Hand
    const gamcha = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.55, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    gamcha.position.set(0.28, 0.25, 0.2);
    helperGroup.add(gamcha);

    bus.add(helperGroup);

    return bus;
  }

  // 2. Realistic Dhaka Cycle Rickshaw with Traditional Painted Rickshaw Art
  public createRealisticRickshaw(): THREE.Group {
    const rickshaw = new THREE.Group();

    // Arched Hood with Painted Floral Rickshaw Art
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.45 });
    const hoodGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.4, 16, 1, false, 0, Math.PI);
    hoodGeo.rotateZ(Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 1.5, 0.4);
    hood.castShadow = true;
    rickshaw.add(hood);

    // Traditional Folk Painted Back Panel
    const artTex = createRickshawArtTexture();
    const artMat = new THREE.MeshBasicMaterial({ map: artTex });
    const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.95), artMat);
    artMesh.position.set(0, 1.3, 0.92);
    rickshaw.add(artMesh);

    // Upholstered Passenger Seat
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.6 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.75), seatMat);
    seat.position.set(0, 0.95, 0.4);
    rickshaw.add(seat);

    // Frame Chassis (Yellow & Chrome)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 2.0), frameMat);
    chassis.position.set(0, 0.65, -0.2);
    rickshaw.add(chassis);

    // Metallic Spoked Bicycle Wheels (2 Rear, 1 Front)
    const wheelGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.1, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });

    [-0.78, 0.78].forEach((wx) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.58, 0.4);
      w.castShadow = true;
      rickshaw.add(w);
    });

    const fWheel = new THREE.Mesh(wheelGeo, wheelMat);
    fWheel.position.set(0, 0.58, -1.3);
    fWheel.castShadow = true;
    rickshaw.add(fWheel);

    // Rickshaw Puller (রিকশাওয়ালা) in lungi & genji
    const pullerGroup = new THREE.Group();
    pullerGroup.position.set(0, 1.3, -0.45);

    const pullerTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.75, 0.36),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }) // White undershirt (genji)
    );
    pullerGroup.add(pullerTorso);

    const pullerLungi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.35, 0.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 }) // Blue checkered lungi
    );
    pullerLungi.position.y = -0.7;
    pullerGroup.add(pullerLungi);

    const pullerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xdf9b64 })
    );
    pullerHead.position.y = 0.52;
    pullerGroup.add(pullerHead);

    // Red Gamcha wrapped on shoulders
    const neckGamcha = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.08, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    neckGamcha.rotation.x = Math.PI / 2;
    neckGamcha.position.y = 0.38;
    pullerGroup.add(neckGamcha);

    rickshaw.add(pullerGroup);
    return rickshaw;
  }

  // 3. Realistic Green CNG Auto-Rickshaw (3-Wheeler)
  public createRealisticCNG(): THREE.Group {
    const cng = new THREE.Group();

    // Curved Green Body
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35, metalness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.5), greenMat);
    body.position.y = 1.1;
    body.castShadow = true;
    cng.add(body);

    // Black Vinyl Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.28, 2.6), roofMat);
    roof.position.y = 1.9;
    cng.add(roof);

    // Steel Safety Mesh Wire Grille (লোহার খাঁচা)
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 0.05), grillMat);
    grill.position.set(0, 1.25, 1.28);
    cng.add(grill);

    // Front Headlight & Spare Wheel on Rear
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    light.position.set(0, 0.9, -1.28);
    cng.add(light);

    const spare = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x171717 })
    );
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 1.0, 1.35);
    cng.add(spare);

    // 3 Wheels
    const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14);
    wGeo.rotateZ(Math.PI / 2);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x171717 });

    [-0.92, 0.92].forEach((wx) => {
      const wheel = new THREE.Mesh(wGeo, wMat);
      wheel.position.set(wx, 0.38, 0.65);
      cng.add(wheel);
    });

    const frontWheel = new THREE.Mesh(wGeo, wMat);
    frontWheel.position.set(0, 0.38, -1.05);
    cng.add(frontWheel);

    return cng;
  }

  // 4. Realistic Open Pothole / Manhole with Warning Red Brick
  private createRealisticPothole(): THREE.Group {
    const pot = new THREE.Group();

    // Dark recessed pit
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.06, 18), holeMat);
    hole.position.y = 0.02;
    pot.add(hole);

    // Broken asphalt rim with depth
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.95 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.1, 8, 18), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.04;
    pot.add(rim);

    // Warning Red Brick perched on rim (Dhaka iconic street warning!)
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 });
    const brick = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.58, 0.28), brickMat);
    brick.position.set(0, 0.3, 0);
    brick.rotation.z = 0.25;
    brick.castShadow = true;
    pot.add(brick);

    return pot;
  }

  // 5. Realistic Muddy Puddle with Wet Gloss
  private createRealisticMudPuddle(): THREE.Group {
    const mud = new THREE.Group();
    const mudMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.15, // Wet glossy reflection
      metalness: 0.3
    });
    const puddle = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.04, 18), mudMat);
    puddle.scale.set(1.3, 1, 0.9);
    puddle.position.y = 0.02;
    mud.add(puddle);
    return mud;
  }

  // 6. Bamboo Construction Hurdle (requires duck/slide)
  private createRealisticBambooHurdle(): THREE.Group {
    const hurdle = new THREE.Group();
    const bamMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });

    // Horizontal bamboo bar
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.0, 10), bamMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.5, 0);
    bar.castShadow = true;
    hurdle.add(bar);

    // Vertical bamboo poles
    [-1.35, 1.35].forEach((bx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 10), bamMat);
      pole.position.set(bx, 1.15, 0);
      pole.castShadow = true;
      hurdle.add(pole);
    });

    // Warning Red & Yellow Ribbon
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), flagMat);
    flag.position.set(0, 1.25, 0.01);
    hurdle.add(flag);

    return hurdle;
  }

  // 7. Roadside Tong Tea Stall (টংয়ের দোকান)
  private createRealisticTeaStall(): THREE.Group {
    const tong = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.85 });

    const table = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.95, 1.0), woodMat);
    table.position.y = 0.48;
    table.castShadow = true;
    tong.add(table);

    // Aluminium Kettle with Chrome Shine
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), kettleMat);
    kettle.position.set(0.25, 1.25, 0);
    kettle.castShadow = true;
    tong.add(kettle);

    // Hanging Ripe Bananas (কলার ছড়ি)
    const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
    const banana = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), bananaMat);
    banana.rotation.z = 0.4;
    banana.position.set(-0.6, 1.35, 0);
    tong.add(banana);

    return tong;
  }

  // =========================================================================
  // 5. REALISTIC 3D COLLECTIBLES (Embossed Taka Coin, Hot Tea, Umbrella)
  // =========================================================================

  public create3DCollectible(col: Collectible): THREE.Group {
    const group = new THREE.Group();

    if (col.type === 'COIN') {
      // 3D Embossed Gold Taka Coin
      const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 24);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.15
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.y = 1.1;
      coin.castShadow = true;
      group.add(coin);

      // Golden Halo Ring
      const haloGeo = new THREE.RingGeometry(0.65, 0.8, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 1.1;
      group.add(halo);
    } else if (col.type === 'TEA') {
      // Hot Glass of Dhaka Dudh Cha
      const teaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.55, 12), teaMat);
      cup.position.y = 1.1;
      group.add(cup);
    } else if (col.type === 'UMBRELLA') {
      // Floating Protective Umbrella
      const umbMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.38, 14), umbMat);
      canopy.position.y = 1.3;
      group.add(canopy);
    }

    return group;
  }

  // =========================================================================
  // 6. WEATHER & RAIN PARTICLES
  // =========================================================================

  private initWeatherSystems() {
    const rainCount = 1600;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 15;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.18,
      transparent: true,
      opacity: 0.65
    });

    this.rainSystem = new THREE.Points(rainGeo, rainMat);
    this.rainSystem.visible = false;
    this.scene.add(this.rainSystem);
  }

  // Spawn running dust / slide sparks / coin sparkles
  public spawnParticleEffect(x: number, y: number, z: number, color: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const pGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const pMat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.set(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.3);
      this.particleGroup.add(mesh);

      this.particleList.push({
        mesh,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        vz: 3 + Math.random() * 4,
        life: 0.45,
        maxLife: 0.45
      });
    }
  }

  // =========================================================================
  // 7. MAIN 60FPS UPDATE & RENDER LOOP
  // =========================================================================

  public update(
    player: Player,
    obstacles: Obstacle[],
    collectibles: Collectible[],
    busOptions: BusOption[] | null,
    currentStage: StageConfig,
    gameSpeed: number,
    dt: number
  ) {
    this.animTimer += dt;

    // 1. Move road, metro rail, and scenery segments infinitely forward
    const roadSpeed = gameSpeed * 0.12;
    const totalLength = ThreeGameScene.NUM_SEGMENTS * ThreeGameScene.SEGMENT_LENGTH;

    const moveSegments = (segments: THREE.Group[]) => {
      segments.forEach((seg) => {
        seg.position.z += roadSpeed * dt;
        if (seg.position.z > ThreeGameScene.SEGMENT_LENGTH) {
          seg.position.z -= totalLength;
        }
      });
    };

    moveSegments(this.roadSegments);
    moveSegments(this.metroRailSegments);
    moveSegments(this.scenerySegments);

    // Drifting 3D Clouds
    this.clouds.forEach((cloud) => {
      cloud.position.x += 1.2 * dt;
      if (cloud.position.x > 90) cloud.position.x = -90;
    });

    // 2. Smooth Player Movement with Lane Banking & Physics
    const targetX = ThreeGameScene.LANE_X[player.targetLane];
    const dx = targetX - this.playerGroup.position.x;
    this.playerGroup.position.x += dx * Math.min(dt * 13, 1);

    // Banking tilt when darting across lanes
    this.playerGroup.rotation.z = -dx * 0.18;
    this.playerGroup.rotation.y = -dx * 0.14;

    // Jump height in 3D world units
    const jumpHeight = player.jumpY * 0.024;
    this.playerGroup.position.y = jumpHeight;

    // 3. Realistic Character Animation Rigging
    const runCycle = Math.sin(this.animTimer * 18);
    const rigs = this.playerRigs;

    if (player.isSliding) {
      // Dynamic Knee Slide Pose: Leaned back, sparks flying
      this.playerGroup.scale.set(1, 0.46, 1.45);
      this.playerGroup.position.y = 0;
      rigs.leftLeg.rotation.x = 0;
      rigs.rightLeg.rotation.x = 0;
      rigs.leftArm.rotation.x = -1.2;
      rigs.rightArm.rotation.x = -1.2;
      rigs.tie.rotation.x = 1.0;

      // Slide sparks particle emission
      if (Math.random() > 0.4) {
        this.spawnParticleEffect(this.playerGroup.position.x, 0.1, 0.5, 0xfacc15, 2);
      }
    } else {
      this.playerGroup.scale.set(1, 1, 1);
      if (player.isJumping) {
        // Dynamic Athletic Hurdle Jump Pose
        rigs.leftLeg.rotation.x = 0.9;
        rigs.rightLeg.rotation.x = 0.4;
        rigs.leftArm.rotation.x = -1.1;
        rigs.rightArm.rotation.x = -1.1;
        rigs.tie.rotation.x = 0.7;
      } else {
        // Natural Human Running Gait
        rigs.leftLeg.rotation.x = runCycle * 0.95;
        rigs.rightLeg.rotation.x = -runCycle * 0.95;
        rigs.leftArm.rotation.x = -runCycle * 0.9;
        rigs.rightArm.rotation.x = runCycle * 0.9;

        // Rippling tie physics in oncoming wind
        rigs.tie.rotation.x = 0.45 + Math.sin(this.animTimer * 22) * 0.25;

        // Subtle head and spine bobbing
        rigs.torso.position.y = 1.35 + Math.abs(Math.sin(this.animTimer * 18)) * 0.06;

        // Running dust puffs
        if (Math.abs(runCycle) > 0.85 && Math.random() > 0.6) {
          this.spawnParticleEffect(this.playerGroup.position.x, 0.05, 0.2, 0x9ca3af, 1);
        }
      }
    }

    // Powerup Auras
    rigs.umbrella.visible = player.hasUmbrella;
    rigs.teaAura.visible = player.hasTeaBoost;
    if (player.hasTeaBoost) {
      rigs.teaAura.rotation.y += 0.08;
    }

    // 4. Cinematic Dynamic Third-Person Chase Camera
    const camTargetX = this.playerGroup.position.x * 0.4;
    this.camera.position.x += (camTargetX - this.camera.position.x) * Math.min(dt * 8, 1);
    this.camera.position.y = 4.1 + jumpHeight * 0.35;

    // Dynamic Speed FOV Expansion (high-speed rush feeling)
    const targetFOV = 54 + (currentStage.speedMultiplier - 1.0) * 12;
    this.camera.fov += (targetFOV - this.camera.fov) * Math.min(dt * 3, 1);
    this.camera.updateProjectionMatrix();

    // Camera shake on collision impact
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.8);
    }
    this.camera.lookAt(this.playerGroup.position.x * 0.6, 1.4, -20);

    // 5. Stage Day / Dusk / Rain / Night Lighting Transitions
    this.updateAtmosphericLighting(currentStage.id);

    // 6. Update Particle Systems
    this.updateParticles(dt);

    // 7. Synchronize 3D Obstacles
    this.syncObstacles(obstacles);

    // 8. Synchronize 3D Collectibles
    this.syncCollectibles(collectibles);

    // 9. Synchronize Bus Stop Choice Event
    this.syncBusStopEvent(busOptions);

    // 10. Weather effects (Monsoon Rain)
    if (this.rainSystem) {
      const isRain = currentStage.id === 4;
      this.rainSystem.visible = isRain;
      if (isRain) {
        const pos = this.rainSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= 36 * dt;
          if (pos[i] < 0) pos[i] = 30;
        }
        this.rainSystem.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 11. Render High-Quality 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  // Smooth Stage Lighting Transitions
  private updateAtmosphericLighting(stageId: number) {
    if (stageId === 3) {
      // Level 3: Golden Hour Dusk / Sunset
      this.scene.background = new THREE.Color(0xf97316);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0xf97316);
      }
      this.dirLight.color.setHex(0xfed7aa);
      this.dirLight.intensity = 1.4;
    } else if (stageId === 4) {
      // Level 4: Monsoon Rainy Storm
      this.scene.background = new THREE.Color(0x334155);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0x334155);
      }
      this.dirLight.color.setHex(0x94a3b8);
      this.dirLight.intensity = 0.9;
    } else if (stageId >= 5) {
      // Level 5 & 6: Dhaka Neon Night City
      this.scene.background = new THREE.Color(0x0f172a);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0x0f172a);
      }
      this.dirLight.color.setHex(0x60a5fa);
      this.dirLight.intensity = 0.8;
      this.ambientLight.intensity = 0.5;
    } else {
      // Level 1 & 2: Crisp Daylight
      this.scene.background = new THREE.Color(0x38bdf8);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0x38bdf8);
      }
      this.dirLight.color.setHex(0xfffbeb);
      this.dirLight.intensity = 1.8;
    }
  }

  // Update particle system
  private updateParticles(dt: number) {
    for (let i = this.particleList.length - 1; i >= 0; i--) {
      const p = this.particleList[i];
      p.life -= dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 9.8 * dt; // Gravity

      const scale = Math.max(0, p.life / p.maxLife);
      p.mesh.scale.set(scale, scale, scale);

      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.particleList.splice(i, 1);
      }
    }
  }

  public triggerImpactShake() {
    this.cameraShakeIntensity = 0.75;
  }

  // Synchronize 3D Obstacles
  private syncObstacles(obstacles: Obstacle[]) {
    const activeIds = new Set<number>();

    obstacles.forEach((obs) => {
      activeIds.add(obs.id);
      let group = this.obstaclesMap.get(obs.id);

      if (!group) {
        group = this.create3DObstacle(obs);
        this.scene.add(group);
        this.obstaclesMap.set(obs.id, group);
      }

      const zPos = (obs.y - 450) * 0.10;
      const xPos = ThreeGameScene.LANE_X[obs.lane];
      group.position.set(xPos, 0, zPos);
    });

    for (const [id, grp] of this.obstaclesMap.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(grp);
        this.obstaclesMap.delete(id);
      }
    }
  }

  // Synchronize 3D Collectibles
  private syncCollectibles(collectibles: Collectible[]) {
    const activeIds = new Set<number>();

    collectibles.forEach((col) => {
      if (col.collected) return;
      activeIds.add(col.id);
      let group = this.collectiblesMap.get(col.id);

      if (!group) {
        group = this.create3DCollectible(col);
        this.scene.add(group);
        this.collectiblesMap.set(col.id, group);
      }

      const zPos = (col.y - 450) * 0.10;
      const xPos = ThreeGameScene.LANE_X[col.lane];
      group.position.set(xPos, 0, zPos);
      group.rotation.y += 0.06; // Gleaming spin
    });

    for (const [id, grp] of this.collectiblesMap.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(grp);
        this.collectiblesMap.delete(id);
      }
    }
  }

  // Synchronize Bus Stop Choice Event
  private syncBusStopEvent(busOptions: BusOption[] | null) {
    if (!busOptions || busOptions.length === 0) {
      this.busOptionsGroup.clear();
      return;
    }

    if (this.busOptionsGroup.children.length === 0) {
      busOptions.forEach((bus) => {
        const busMesh = this.createRealisticDhakaBus(bus.busName, bus.destination);
        const xPos = ThreeGameScene.LANE_X[bus.lane];
        busMesh.position.set(xPos, 0, -32);
        this.busOptionsGroup.add(busMesh);
      });
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
