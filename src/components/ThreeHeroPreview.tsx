import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ThreeHeroPreview: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 240;

    // 1. Scene & Lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.015);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(2.8, 2.2, 5.8);
    camera.lookAt(-0.4, 1.2, -1.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xfff5ea, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 2. Asphalt Ground
    const roadGeo = new THREE.PlaneGeometry(16, 20);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Dashed lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let lz = -8; lz < 10; lz += 4) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.8), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, lz);
      scene.add(dash);
    }

    // Curbs
    const curbMat1 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const curbMat2 = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    for (let cz = -8; cz < 10; cz += 1.5) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 1.4), (cz % 3 === 0 ? curbMat1 : curbMat2));
      curb.position.set(-3.2, 0.12, cz);
      scene.add(curb);
    }

    // 3. Dhaka Local Bus Model (Orange & Chrome)
    const bus = new THREE.Group();
    bus.position.set(-1.2, 0, -2.2);

    const busBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.8, 6.8),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.35, metalness: 0.2 })
    );
    busBody.position.y = 1.8;
    busBody.castShadow = true;
    bus.add(busBody);

    // Blue Decal Stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.64, 0.4, 6.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    stripe.position.y = 1.6;
    bus.add(stripe);

    // Front Grille & Headlights
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.8, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
    );
    grille.position.set(0, 1.0, -3.45);
    bus.add(grille);

    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.8, 0.8].forEach((lx) => {
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), lightMat);
      hl.rotation.x = Math.PI / 2;
      hl.position.set(lx, 1.1, -3.42);
      bus.add(hl);
    });

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    [-1.25, 1.25].forEach((wx) => {
      [-1.8, 1.8].forEach((wz) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(wx, 0.48, wz);
        w.castShadow = true;
        bus.add(w);
      });
    });

    scene.add(bus);

    // 4. Stylized 3D Running Executive Character
    const runner = new THREE.Group();
    runner.position.set(1.1, 0, 0.6);

    // Torso
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.38), shirtMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    runner.add(torso);

    // Tie
    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.6, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    tie.position.set(0, 1.25, -0.21);
    runner.add(tie);

    // Backpack
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    pack.position.set(0, 1.35, 0.24);
    pack.castShadow = true;
    runner.add(pack);

    // Head & Hair
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xdf9b64 })
    );
    head.position.y = 1.95;
    runner.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    hair.position.set(0, 2.05, 0.02);
    runner.add(hair);

    // Legs
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.22), pantMat);
    lLeg.position.set(-0.18, 0.45, 0);
    runner.add(lLeg);

    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.22), pantMat);
    rLeg.position.set(0.18, 0.45, 0);
    runner.add(rLeg);

    scene.add(runner);

    // 5. Gentle Orbit Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle camera sway
      camera.position.x = 2.8 + Math.sin(t * 0.8) * 0.35;
      camera.position.y = 2.2 + Math.cos(t * 0.6) * 0.15;
      camera.lookAt(-0.3, 1.2, -0.8);

      // Bus subtle idle engine rumble vibration
      bus.position.y = Math.sin(t * 12) * 0.012;

      // Character tie flutter
      tie.rotation.x = 0.2 + Math.sin(t * 8) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[220px] sm:min-h-[260px] relative rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
};
