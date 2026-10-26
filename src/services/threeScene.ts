import * as THREE from 'three';
import type { Player, Obstacle, Collectible, StageConfig, BusOption } from '../types/game';

export class ThreeGameScene {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Scene elements
  private playerGroup: THREE.Group;
  private playerMeshMap: {
    head: THREE.Mesh;
    torso: THREE.Mesh;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    tie: THREE.Mesh;
    backpack: THREE.Mesh;
    glasses: THREE.Group;
    umbrella: THREE.Group;
    shadow: THREE.Mesh;
  };

  private roadSegments: THREE.Group[] = [];
  private buildingSegments: THREE.Group[] = [];
  private obstaclesMap = new Map<number, THREE.Group>();
  private collectiblesMap = new Map<number, THREE.Group>();
  private busOptionsGroup = new THREE.Group();
  private rainParticles: THREE.Points | null = null;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  // Animation & time
  private animTimer: number = 0;
  private cameraShakeIntensity: number = 0;

  // Lane coordinates (Z goes negative into the screen)
  public static readonly LANE_X = [-3.0, 0, 3.0];
  public static readonly ROAD_WIDTH = 10.5;
  public static readonly SEGMENT_LENGTH = 40;
  public static readonly NUM_SEGMENTS = 4;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2634);
    this.scene.fog = new THREE.FogExp2(0x1a2634, 0.015);

    // 2. Camera: True 3D third-person perspective behind player
    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 180);
    this.camera.position.set(0, 3.8, 7.5);
    this.camera.lookAt(0, 1.2, -18);

    // 3. Renderer with soft shadows and high visual quality
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Dhaka warm sunlight)
    this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffecd2, 1.6);
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    const d = 16;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // 5. Initialize Procedural 3D World (Road, Sidewalks, Buildings, Lampposts)
    this.initWorld();

    // 6. Initialize 3D Player Character
    const { group, meshMap } = this.createPlayerCharacter();
    this.playerGroup = group;
    this.playerMeshMap = meshMap;
    this.scene.add(this.playerGroup);

    // 7. Bus options group
    this.scene.add(this.busOptionsGroup);

    // 8. Rain Particle System (for Monsoon stage)
    this.initWeatherSystems();
  }

  // Build the endless tiled 3D road, sidewalks, streetlights, and Dhaka buildings
  private initWorld() {
    for (let i = 0; i < ThreeGameScene.NUM_SEGMENTS; i++) {
      const segZ = -i * ThreeGameScene.SEGMENT_LENGTH;
      const roadSeg = this.createRoadSegment(segZ);
      this.roadSegments.push(roadSeg);
      this.scene.add(roadSeg);

      const bldgSeg = this.createBuildingSegment(segZ);
      this.buildingSegments.push(bldgSeg);
      this.scene.add(bldgSeg);
    }
  }

  // Create a 40m long 3D Road Segment with lanes, curbs, and street elements
  private createRoadSegment(zPos: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zPos;

    // Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(ThreeGameScene.ROAD_WIDTH, ThreeGameScene.SEGMENT_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x24282f,
      roughness: 0.85,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    group.add(road);

    // White dashed lane markings
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const numDashes = 8;
    const dashLen = 2.4;
    const spacing = ThreeGameScene.SEGMENT_LENGTH / numDashes;

    [-1.5, 1.5].forEach((laneDividerX) => {
      for (let i = 0; i < numDashes; i++) {
        const dashGeo = new THREE.PlaneGeometry(0.18, dashLen);
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(laneDividerX, 0.01, -i * spacing + ThreeGameScene.SEGMENT_LENGTH / 2 - dashLen / 2);
        group.add(dash);
      }
    });

    // Sidewalks (Left and Right with Dhaka yellow/black curb stones)
    const curbMat1 = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.7 });
    const curbMat2 = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.8 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 });

    [-1, 1].forEach((side) => {
      const curbX = side * (ThreeGameScene.ROAD_WIDTH / 2 + 0.3);
      const walkX = side * (ThreeGameScene.ROAD_WIDTH / 2 + 2.2);

      // Paved sidewalk
      const walkGeo = new THREE.BoxGeometry(3.5, 0.25, ThreeGameScene.SEGMENT_LENGTH);
      const walk = new THREE.Mesh(walkGeo, sidewalkMat);
      walk.position.set(walkX, 0.12, 0);
      walk.receiveShadow = true;
      group.add(walk);

      // Alternating Dhaka Kerbstones
      const curbCount = 16;
      const curbLen = ThreeGameScene.SEGMENT_LENGTH / curbCount;
      for (let c = 0; c < curbCount; c++) {
        const curbGeo = new THREE.BoxGeometry(0.35, 0.3, curbLen);
        const curb = new THREE.Mesh(curbGeo, c % 2 === 0 ? curbMat1 : curbMat2);
        curb.position.set(curbX, 0.15, -c * curbLen + ThreeGameScene.SEGMENT_LENGTH / 2 - curbLen / 2);
        curb.receiveShadow = true;
        group.add(curb);
      }

      // Street lamps every 20m
      [-10, 10].forEach((lampZ) => {
        const lamp = this.createStreetLamp();
        lamp.position.set(side * (ThreeGameScene.ROAD_WIDTH / 2 + 1.2), 0, lampZ);
        if (side < 0) lamp.rotation.y = Math.PI;
        group.add(lamp);
      });
    });

    return group;
  }

  // Realistic Dhaka Street Lamp
  private createStreetLamp(): THREE.Group {
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8, roughness: 0.3 });
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.5, 8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.75;
    pole.castShadow = true;
    lamp.add(pole);

    // Lamp Arm
    const armGeo = new THREE.BoxGeometry(0.06, 0.06, 1.2);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0, 5.4, -0.5);
    arm.rotation.x = -0.3;
    lamp.add(arm);

    // Glowing Lantern head
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    const bulbGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const bulb = new THREE.Mesh(bulbGeo, glowMat);
    bulb.position.set(0, 5.2, -1.0);
    lamp.add(bulb);

    return lamp;
  }

  // Create roadside buildings with Bengali shopfronts, balconies, and signboards
  private createBuildingSegment(zPos: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zPos;

    const bldgColors = [0x95a5a6, 0xbdc3c7, 0xe67e22, 0x3498db, 0x1abc9c, 0xf39c12, 0xd35400];
    const shopNames = [
      'দেশ জেনারেল স্টোর',
      'চায়ের টং ও নাস্তা',
      'বিকাশ ও নগদ পয়েন্ট',
      'ঢাকা ফার্মেসী',
      'রিকশা গ্যারেজ',
      'বসের চা কর্নার'
    ];

    [-1, 1].forEach((side) => {
      const bldgX = side * 11.5;
      for (let b = 0; b < 3; b++) {
        const bZ = -b * 13 + 12;
        const bHeight = 8 + Math.random() * 8;
        const bWidth = 8;
        const bDepth = 11;
        const color = bldgColors[Math.floor(Math.random() * bldgColors.length)];

        const bldgGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bldgMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(bldgX, bHeight / 2, bZ);
        bldg.castShadow = true;
        bldg.receiveShadow = true;
        group.add(bldg);

        // Windows rows
        const winMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.2, metalness: 0.8 });
        for (let wy = 2.5; wy < bHeight - 1; wy += 1.8) {
          for (let wz = -bDepth / 2 + 2; wz < bDepth / 2 - 1; wz += 2.5) {
            const winGeo = new THREE.BoxGeometry(0.1, 1.0, 1.4);
            const win = new THREE.Mesh(winGeo, winMat);
            win.position.set(bldgX - side * (bWidth / 2 + 0.05), wy, bZ + wz);
            group.add(win);
          }
        }

        // Bengali Ground Floor Shop Banner
        const shopCanvas = document.createElement('canvas');
        shopCanvas.width = 512;
        shopCanvas.height = 128;
        const sctx = shopCanvas.getContext('2d');
        if (sctx) {
          sctx.fillStyle = '#c0392b';
          sctx.fillRect(0, 0, 512, 128);
          sctx.strokeStyle = '#f1c40f';
          sctx.lineWidth = 10;
          sctx.strokeRect(5, 5, 502, 118);
          sctx.fillStyle = '#ffffff';
          sctx.font = 'bold 44px sans-serif';
          sctx.textAlign = 'center';
          sctx.textBaseline = 'middle';
          const name = shopNames[Math.floor(Math.random() * shopNames.length)];
          sctx.fillText(name, 256, 64);
        }

        const bannerTex = new THREE.CanvasTexture(shopCanvas);
        const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
        const bannerGeo = new THREE.PlaneGeometry(5.5, 1.4);
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(bldgX - side * (bWidth / 2 + 0.15), 2.2, bZ);
        banner.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        group.add(banner);
      }
    });

    return group;
  }

  // 3D Animated Bengali Office Worker Character
  private createPlayerCharacter(): { group: THREE.Group; meshMap: any } {
    const group = new THREE.Group();

    // 1. Torso (Crisp white office shirt)
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const torsoGeo = new THREE.BoxGeometry(0.75, 0.95, 0.45);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // 2. Fluttering Red Necktie
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 });
    const tieGeo = new THREE.BoxGeometry(0.12, 0.65, 0.05);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.3, 0.24);
    group.add(tie);

    // 3. Head & Glasses
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cd79, roughness: 0.65 });
    const headGeo = new THREE.BoxGeometry(0.55, 0.58, 0.5);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.15;
    head.castShadow = true;
    group.add(head);

    // Black Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const hairGeo = new THREE.BoxGeometry(0.58, 0.22, 0.54);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.38, 0);
    group.add(hair);

    // Glasses
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    [-0.14, 0.14].forEach((gx) => {
      const gBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), frameMat);
      gBox.position.set(gx, 2.15, 0.27);
      glassesGroup.add(gBox);
    });
    group.add(glassesGroup);

    // 4. Blue Backpack
    const packMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.7 });
    const packGeo = new THREE.BoxGeometry(0.65, 0.75, 0.35);
    const backpack = new THREE.Mesh(packGeo, packMat);
    backpack.position.set(0, 1.4, -0.32);
    backpack.castShadow = true;
    group.add(backpack);

    // 5. Legs (Dark trousers & shoes)
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });

    const createLeg = (xOff: number): THREE.Group => {
      const legGroup = new THREE.Group();
      legGroup.position.set(xOff, 0.9, 0);

      const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.26), pantMat);
      legMesh.position.y = -0.45;
      legMesh.castShadow = true;
      legGroup.add(legMesh);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.42), shoeMat);
      shoe.position.set(0, -0.85, 0.08);
      shoe.castShadow = true;
      legGroup.add(shoe);

      return legGroup;
    };

    const leftLeg = createLeg(-0.22);
    const rightLeg = createLeg(0.22);
    group.add(leftLeg);
    group.add(rightLeg);

    // 6. Arms (White shirt sleeves)
    const createArm = (xOff: number): THREE.Group => {
      const armGroup = new THREE.Group();
      armGroup.position.set(xOff, 1.7, 0);

      const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.22), shirtMat);
      armMesh.position.y = -0.35;
      armMesh.castShadow = true;
      armGroup.add(armMesh);

      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), skinMat);
      hand.position.y = -0.75;
      armGroup.add(hand);

      return armGroup;
    };

    const leftArm = createArm(-0.48);
    const rightArm = createArm(0.48);
    group.add(leftArm);
    group.add(rightArm);

    // 7. Umbrella (shield powerup)
    const umbrellaGroup = new THREE.Group();
    umbrellaGroup.position.set(0.3, 2.7, 0);
    const umbCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 })
    );
    umbCanopy.position.y = 0.2;
    umbrellaGroup.add(umbCanopy);
    const umbPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x2c3e50 })
    );
    umbPole.position.y = -0.35;
    umbrellaGroup.add(umbPole);
    umbrellaGroup.visible = false;
    group.add(umbrellaGroup);

    // 8. Ground Shadow
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.8);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    return {
      group,
      meshMap: {
        head,
        torso,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        tie,
        backpack,
        glasses: glassesGroup,
        umbrella: umbrellaGroup,
        shadow
      }
    };
  }

  // 3D Weather System (Rain Particles)
  private initWeatherSystems() {
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  // =========================================================================
  // 3D OBSTACLE MODELS (Dhaka Bus, Cycle Rickshaw, Green CNG, Pothole, Mud)
  // =========================================================================

  public create3DObstacle(obs: Obstacle): THREE.Group {
    switch (obs.type) {
      case 'SLOW_BUS':
        return this.create3DLocalBus();
      case 'RICKSHAW':
        return this.create3DRickshaw();
      case 'CNG':
        return this.create3DCNG();
      case 'POTHOLE':
        return this.create3DPothole();
      case 'MUD':
        return this.create3DMudPuddle();
      case 'BAMBOO':
        return this.create3DBambooBarrier();
      case 'TEA_STALL':
        return this.create3DTeaStall();
      default:
        return this.create3DPothole();
    }
  }

  // 1. Realistic Dhaka Local Bus (বলাকা / বিকল্প পরিবহন)
  private create3DLocalBus(): THREE.Group {
    const bus = new THREE.Group();

    const busLen = 7.8;
    const busW = 2.6;
    const busH = 3.2;

    // Bus Body (Vibrant Dhaka Transport Orange)
    const bodyGeo = new THREE.BoxGeometry(busW, busH, busLen);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5, metalness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = busH / 2 + 0.45;
    body.castShadow = true;
    body.receiveShadow = true;
    bus.add(body);

    // Colorful Transport Stripes (Blue & Yellow)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.4 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(busW + 0.05, 0.4, busLen - 0.2), stripeMat);
    stripe.position.y = 1.6;
    bus.add(stripe);

    const stripe2Mat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.4 });
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(busW + 0.06, 0.3, busLen - 0.2), stripe2Mat);
    stripe2.position.y = 2.1;
    bus.add(stripe2);

    // Windows (Rear and side glass panels)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
    const rearWin = new THREE.Mesh(new THREE.BoxGeometry(busW - 0.5, 1.1, 0.1), glassMat);
    rearWin.position.set(0, 2.4, busLen / 2 + 0.01);
    bus.add(rearWin);

    // Giant Bengali Destination Signboard on Rear
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    if (sctx) {
      sctx.fillStyle = '#f1c40f';
      sctx.fillRect(0, 0, 512, 128);
      sctx.strokeStyle = '#2c3e50';
      sctx.lineWidth = 10;
      sctx.strokeRect(5, 5, 502, 118);
      sctx.fillStyle = '#1e272e';
      sctx.font = 'bold 50px sans-serif';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText('বলাকা • মতিঝিল', 256, 64);
    }
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.65), signMat);
    signMesh.position.set(0, 3.1, busLen / 2 + 0.02);
    bus.add(signMesh);

    // Wheels (4 big spinning wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.38, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    wheelGeo.rotateZ(Math.PI / 2);

    [-1.25, 1.25].forEach((wx) => {
      [-2.2, 2.2].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, 0.48, wz);
        wheel.castShadow = true;
        bus.add(wheel);
      });
    });

    // Helper model leaning out the back door!
    const helperGroup = new THREE.Group();
    helperGroup.position.set(busW / 2 + 0.15, 1.8, busLen / 2 - 1.2);

    const helperBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.6, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x27ae60 })
    );
    helperGroup.add(helperBody);
    const helperHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5cd79 })
    );
    helperHead.position.y = 0.42;
    helperGroup.add(helperHead);

    // Gamcha in hand
    const gamcha = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.45, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xe74c3c })
    );
    gamcha.position.set(0.2, 0.2, 0.2);
    helperGroup.add(gamcha);
    bus.add(helperGroup);

    return bus;
  }

  // 2. Realistic Dhaka Cycle Rickshaw
  private create3DRickshaw(): THREE.Group {
    const rickshaw = new THREE.Group();

    // Hood (Painted floral rickshaw art arch)
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 });
    const hoodGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.3, 12, 1, false, 0, Math.PI);
    hoodGeo.rotateZ(Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 1.45, 0.35);
    hood.castShadow = true;
    rickshaw.add(hood);

    // Seat
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.6 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.45, 0.7), seatMat);
    seat.position.set(0, 0.95, 0.35);
    rickshaw.add(seat);

    // Frame (Yellow & Blue)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.4, metalness: 0.7 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.15, 1.8), frameMat);
    chassis.position.set(0, 0.65, -0.2);
    rickshaw.add(chassis);

    // 2 Big Rear Spoked Wheels
    const rWheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16);
    rWheelGeo.rotateZ(Math.PI / 2);
    const rWheelMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });

    [-0.72, 0.72].forEach((wx) => {
      const w = new THREE.Mesh(rWheelGeo, rWheelMat);
      w.position.set(wx, 0.55, 0.35);
      w.castShadow = true;
      rickshaw.add(w);
    });

    // Front Wheel
    const fWheel = new THREE.Mesh(rWheelGeo, rWheelMat);
    fWheel.position.set(0, 0.55, -1.2);
    fWheel.castShadow = true;
    rickshaw.add(fWheel);

    // Rickshaw Puller (Back view)
    const pullerGroup = new THREE.Group();
    pullerGroup.position.set(0, 1.25, -0.4);
    const pullerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.75, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xd35400 })
    );
    pullerGroup.add(pullerBody);
    const pullerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5cd79 })
    );
    pullerHead.position.y = 0.5;
    pullerGroup.add(pullerHead);
    rickshaw.add(pullerGroup);

    return rickshaw;
  }

  // 3. Realistic Green CNG Auto-Rickshaw
  private create3DCNG(): THREE.Group {
    const cng = new THREE.Group();

    // Green Body
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.4, metalness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.35, 2.4), greenMat);
    body.position.y = 1.05;
    body.castShadow = true;
    cng.add(body);

    // Black Curved Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.7 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.25, 2.5), roofMat);
    roof.position.y = 1.8;
    cng.add(roof);

    // Wire Mesh Rear Grill
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.5, metalness: 0.8 });
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.05), grillMat);
    grill.position.set(0, 1.2, 1.22);
    cng.add(grill);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 14);
    wGeo.rotateZ(Math.PI / 2);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    [-0.88, 0.88].forEach((wx) => {
      const wheel = new THREE.Mesh(wGeo, wMat);
      wheel.position.set(wx, 0.35, 0.6);
      cng.add(wheel);
    });

    const frontWheel = new THREE.Mesh(wGeo, wMat);
    frontWheel.position.set(0, 0.35, -1.0);
    cng.add(frontWheel);

    return cng;
  }

  // 4. 3D Pothole (ম্যানহোল / গর্ত) with red warning brick!
  private create3DPothole(): THREE.Group {
    const pot = new THREE.Group();

    // Dark recessed hole on tarmac
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.05, 16), holeMat);
    hole.position.y = 0.02;
    pot.add(hole);

    // Broken rim
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.08, 6, 16), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.04;
    pot.add(rim);

    // Classic Dhaka Warning Red Brick perched in hole!
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.8 });
    const brick = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.25), brickMat);
    brick.position.set(0, 0.28, 0);
    brick.rotation.z = 0.2;
    brick.castShadow = true;
    pot.add(brick);

    return pot;
  }

  // 5. 3D Muddy Puddle (কাদার গর্ত)
  private create3DMudPuddle(): THREE.Group {
    const mud = new THREE.Group();

    const mudMat = new THREE.MeshStandardMaterial({
      color: 0x4e342e,
      roughness: 0.3, // Glossy wet shine
      metalness: 0.2
    });
    const puddle = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.03, 16), mudMat);
    puddle.scale.set(1.2, 1, 0.85);
    puddle.position.y = 0.02;
    mud.add(puddle);

    return mud;
  }

  // 6. Bamboo Construction Hurdle (requires duck/slide)
  private create3DBambooBarrier(): THREE.Group {
    const bamboo = new THREE.Group();

    const bamMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.7 });
    // Horizontal crossbar
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), bamMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.5, 0);
    bar.castShadow = true;
    bamboo.add(bar);

    // Vertical support poles
    [-1.3, 1.3].forEach((bx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), bamMat);
      pole.position.set(bx, 1.1, 0);
      pole.castShadow = true;
      bamboo.add(pole);
    });

    // Warning Red Cloth
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), flagMat);
    flag.position.set(0, 1.25, 0.01);
    bamboo.add(flag);

    return bamboo;
  }

  // 7. Roadside Tea Stall (টং)
  private create3DTeaStall(): THREE.Group {
    const tong = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.8 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.9), woodMat);
    table.position.y = 0.45;
    table.castShadow = true;
    tong.add(table);

    // Giant Aluminium Kettle
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9, roughness: 0.2 });
    const kettle = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), kettleMat);
    kettle.position.set(0.2, 1.15, 0);
    kettle.castShadow = true;
    tong.add(kettle);

    return tong;
  }

  // =========================================================================
  // 3D COLLECTIBLES (Golden Taka Coin, Hot Tea, Umbrella)
  // =========================================================================

  public create3DCollectible(col: Collectible): THREE.Group {
    const group = new THREE.Group();

    if (col.type === 'COIN') {
      // 3D Extruded Golden Taka Coin
      const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xf1c40f,
        metalness: 0.85,
        roughness: 0.2
      });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.y = 1.0;
      coin.castShadow = true;
      group.add(coin);
    } else if (col.type === 'TEA') {
      // 3D Hot Tea Glass
      const teaMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.3 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.5, 12), teaMat);
      cup.position.y = 1.0;
      group.add(cup);
    } else if (col.type === 'UMBRELLA') {
      // 3D Umbrella
      const umbMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 });
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 12), umbMat);
      canopy.position.y = 1.2;
      group.add(canopy);
    }

    return group;
  }

  // =========================================================================
  // MAIN 3D UPDATE & RENDER LOOP
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

    // 1. Tile road segments forward (infinite runner feeling)
    const roadSpeed = gameSpeed * 0.12;
    this.roadSegments.forEach((seg) => {
      seg.position.z += roadSpeed * dt;
      if (seg.position.z > ThreeGameScene.SEGMENT_LENGTH) {
        seg.position.z -= ThreeGameScene.NUM_SEGMENTS * ThreeGameScene.SEGMENT_LENGTH;
      }
    });

    this.buildingSegments.forEach((seg) => {
      seg.position.z += roadSpeed * dt;
      if (seg.position.z > ThreeGameScene.SEGMENT_LENGTH) {
        seg.position.z -= ThreeGameScene.NUM_SEGMENTS * ThreeGameScene.SEGMENT_LENGTH;
      }
    });

    // 2. Update 3D Player Position and Animations
    const targetX = ThreeGameScene.LANE_X[player.targetLane];
    this.playerGroup.position.x += (targetX - this.playerGroup.position.x) * Math.min(dt * 12, 1);

    // Jump height in 3D units
    const jumpHeight = player.jumpY * 0.025;
    this.playerGroup.position.y = jumpHeight;

    // Player running limb animations
    const runCycle = Math.sin(this.animTimer * 16);
    if (player.isSliding) {
      // Slide crouch
      this.playerGroup.scale.set(1, 0.45, 1.4);
      this.playerGroup.position.y = 0;
      this.playerMeshMap.leftLeg.rotation.x = 0;
      this.playerMeshMap.rightLeg.rotation.x = 0;
    } else {
      this.playerGroup.scale.set(1, 1, 1);
      if (player.isJumping) {
        // Airborne jump pose
        this.playerMeshMap.leftLeg.rotation.x = 0.8;
        this.playerMeshMap.rightLeg.rotation.x = 0.5;
        this.playerMeshMap.leftArm.rotation.x = -0.9;
        this.playerMeshMap.rightArm.rotation.x = -0.9;
      } else {
        // Natural 3D running gait
        this.playerMeshMap.leftLeg.rotation.x = runCycle * 0.9;
        this.playerMeshMap.rightLeg.rotation.x = -runCycle * 0.9;
        this.playerMeshMap.leftArm.rotation.x = -runCycle * 0.85;
        this.playerMeshMap.rightArm.rotation.x = runCycle * 0.85;
        this.playerMeshMap.tie.rotation.x = 0.4 + Math.sin(this.animTimer * 20) * 0.2;
      }
    }

    // Shield status
    this.playerMeshMap.umbrella.visible = player.hasUmbrella;

    // 3. Update Camera Position (smooth third-person follow)
    const camTargetX = this.playerGroup.position.x * 0.45;
    this.camera.position.x += (camTargetX - this.camera.position.x) * Math.min(dt * 8, 1);
    this.camera.position.y = 3.6 + jumpHeight * 0.4;

    // Camera shake on impact
    if (this.cameraShakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 3);
    }
    this.camera.lookAt(this.playerGroup.position.x * 0.7, 1.3, -18);

    // 4. Synchronize 3D Obstacles
    this.syncObstacles(obstacles);

    // 5. Synchronize 3D Collectibles
    this.syncCollectibles(collectibles);

    // 6. Bus Stop Choice Event in 3D
    this.syncBusStopEvent(busOptions);

    // 7. Weather effects (Stage 4 Rain)
    if (this.rainParticles) {
      const isRain = currentStage.id === 4;
      this.rainParticles.visible = isRain;
      if (isRain) {
        const pos = this.rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= 32 * dt;
          if (pos[i] < 0) pos[i] = 25;
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 8. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public triggerImpactShake() {
    this.cameraShakeIntensity = 0.5;
  }

  // Synchronize 2D game state obstacles into 3D world space
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

      // Convert 2D Y to 3D Z: screen top is negative Z (distant), bottom is positive Z
      const zPos = -(obs.y - 450) * 0.12;
      const xPos = ThreeGameScene.LANE_X[obs.lane];
      group.position.set(xPos, 0, zPos);
    });

    // Cleanup despawned obstacles
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

      const zPos = -(col.y - 450) * 0.12;
      const xPos = ThreeGameScene.LANE_X[col.lane];
      group.position.set(xPos, 0, zPos);
      group.rotation.y += 0.05; // Spinning animation
    });

    for (const [id, grp] of this.collectiblesMap.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(grp);
        this.collectiblesMap.delete(id);
      }
    }
  }

  // Bus Stop Selection Event (Level 3): 3 massive 3D Buses in lanes
  private syncBusStopEvent(busOptions: BusOption[] | null) {
    if (!busOptions || busOptions.length === 0) {
      this.busOptionsGroup.clear();
      return;
    }

    if (this.busOptionsGroup.children.length === 0) {
      busOptions.forEach((bus) => {
        const busMesh = this.create3DLocalBus();
        const xPos = ThreeGameScene.LANE_X[bus.lane];
        busMesh.position.set(xPos, 0, -28); // Approaching ahead in lane
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
