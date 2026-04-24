'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VoiceOrb3DProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
}

export default function VoiceOrb3D({ status }: VoiceOrb3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // ── Core sphere (icosahedron for faceted look)
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 6);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#7c3aed'),
      emissive: new THREE.Color('#4c1d95'),
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.92,
      envMapIntensity: 1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // ── Wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(1.35, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#a78bfa'),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // ── Outer glow ring (torus)
    const ringGeo = new THREE.TorusGeometry(1.65, 0.025, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#7c3aed'), transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    const ring2Geo = new THREE.TorusGeometry(1.9, 0.012, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#a78bfa'), transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 4;
    scene.add(ring2);

    // ── Particle cloud
    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 2.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
      const c = new THREE.Color().setHSL(0.75 + Math.random() * 0.1, 1, 0.6 + Math.random() * 0.3);
      pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pLight1 = new THREE.PointLight(0x7c3aed, 3, 8);
    pLight1.position.set(2, 2, 2);
    scene.add(pLight1);
    const pLight2 = new THREE.PointLight(0x06b6d4, 2, 8);
    pLight2.position.set(-2, -1, 2);
    scene.add(pLight2);

    let frame = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.012;
      const s = statusRef.current;

      // Color transitions
      const targetColor = s === 'listening' ? new THREE.Color('#10b981')
        : s === 'thinking' ? new THREE.Color('#f59e0b')
        : s === 'speaking' ? new THREE.Color('#06b6d4')
        : new THREE.Color('#7c3aed');
      coreMat.color.lerp(targetColor, 0.04);
      coreMat.emissive.lerp(targetColor, 0.03);
      ringMat.color.lerp(targetColor, 0.04);
      pLight1.color.lerp(targetColor, 0.03);

      // Pulse scale
      const pulse = s === 'speaking' ? Math.sin(t * 4) * 0.06
        : s === 'listening' ? Math.sin(t * 2.5) * 0.04
        : Math.sin(t * 1.2) * 0.02;
      const sc = 1 + pulse;
      core.scale.setScalar(sc);

      // Rotations
      core.rotation.y = t * 0.4;
      core.rotation.x = Math.sin(t * 0.3) * 0.15;
      wire.rotation.y = -t * 0.25;
      wire.rotation.z = t * 0.15;
      ring.rotation.z = t * 0.5;
      ring.rotation.x = Math.sin(t * 0.5) * 0.3;
      ring2.rotation.y = t * 0.3;
      particles.rotation.y = t * 0.1;
      particles.rotation.x = t * 0.05;

      // Particle breathe
      if (s === 'speaking' || s === 'listening') {
        pMat.opacity = 0.6 + Math.sin(t * 3) * 0.3;
        pMat.size = 0.04 + Math.sin(t * 5) * 0.015;
      } else {
        pMat.opacity = 0.5;
        pMat.size = 0.035;
      }

      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
      pGeo.dispose(); pMat.dispose();
      coreGeo.dispose(); coreMat.dispose();
      wireGeo.dispose(); wireMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
