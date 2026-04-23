'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/appStore';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 30;

    // Theme-based colors
    const getColors = () => {
      if (theme === 'dark') return { primary: 0x3b82f6, secondary: 0x8b5cf6, accent: 0x00d4ff };
      if (theme === 'pink') return { primary: 0xec4899, secondary: 0xa855f7, accent: 0xff6ec7 };
      return { primary: 0x2563eb, secondary: 0x7c3aed, accent: 0x0ea5e9 };
    };
    const colors = getColors();

    // Floating particles (DNA helix style)
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 20;
      const r = 15;
      positions[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (i / particleCount - 0.5) * 60;
      positions[i * 3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 10;

      const c = new THREE.Color(i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent);
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Wireframe icosahedrons (health spheres)
    const geoA = new THREE.IcosahedronGeometry(4, 1);
    const matA = new THREE.MeshBasicMaterial({
      color: colors.primary, wireframe: true, transparent: true, opacity: 0.1
    });
    const sphereA = new THREE.Mesh(geoA, matA);
    sphereA.position.set(-20, 8, -10);
    scene.add(sphereA);

    const geoB = new THREE.IcosahedronGeometry(3, 1);
    const matB = new THREE.MeshBasicMaterial({
      color: colors.secondary, wireframe: true, transparent: true, opacity: 0.08
    });
    const sphereB = new THREE.Mesh(geoB, matB);
    sphereB.position.set(18, -6, -8);
    scene.add(sphereB);

    // Torus ring
    const torusGeo = new THREE.TorusGeometry(8, 0.1, 8, 60);
    const torusMat = new THREE.MeshBasicMaterial({
      color: colors.accent, transparent: true, opacity: 0.15
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 0, -5);
    scene.add(torus);

    // Grid plane
    const gridHelper = new THREE.GridHelper(80, 30, colors.primary, colors.primary);
    (gridHelper.material as THREE.Material & { opacity: number; transparent: boolean }).opacity = 0.05;
    (gridHelper.material as THREE.Material & { transparent: boolean }).transparent = true;
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.005;

      particles.rotation.y = t * 0.3;
      particles.rotation.x = t * 0.1;
      sphereA.rotation.x = t * 0.5;
      sphereA.rotation.y = t * 0.3;
      sphereB.rotation.x = -t * 0.3;
      sphereB.rotation.z = t * 0.4;
      torus.rotation.x = t * 0.2;
      torus.rotation.z = t * 0.1;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="three-canvas"
      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, opacity: 0.5, pointerEvents: 'none' }}
    />
  );
}
