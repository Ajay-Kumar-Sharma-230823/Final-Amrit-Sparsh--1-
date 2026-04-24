'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AIRobotProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  theme?: 'light' | 'dark' | 'brown' | 'pink';
  scale?: number;
}

export default function AIRobot({ isSpeaking = false, isListening = false, theme = 'dark', scale = 1 }: AIRobotProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const eyeLeftRef = useRef<THREE.Mesh>(null!);
  const eyeRightRef = useRef<THREE.Mesh>(null!);
  const eyeGlowLeftRef = useRef<THREE.Light>(null!);
  const eyeGlowRightRef = useRef<THREE.Light>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);

  const { scene } = useThree();

  // Theme colors
  const themeColors = {
    light: { robot: '#e8e8e8', accent: '#3b82f6', glow: '#60a5fa' },
    dark: { robot: '#1e1e1e', accent: '#7c3aed', glow: '#a78bfa' },
    brown: { robot: '#8B5E34', accent: '#d4a574', glow: '#f5deb3' },
    pink: { robot: '#fce7f3', accent: '#ec4899', glow: '#f472b6' },
  };

  const colors = themeColors[theme];
  const robotColor = new THREE.Color(colors.robot);
  const accentColor = new THREE.Color(colors.accent);
  const glowColor = new THREE.Color(colors.glow);

  // Create geometries
  const geometries = useMemo(() => {
    const head = new THREE.BoxGeometry(1.2, 1.4, 1);
    const body = new THREE.BoxGeometry(1.4, 2, 0.8);
    const eye = new THREE.SphereGeometry(0.25, 32, 32);
    const mouth = new THREE.BoxGeometry(0.8, 0.2, 0.1);
    const antenna = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);

    return { head, body, eye, mouth, antenna };
  }, []);

  useEffect(() => {
    // Create materials
    const robotMaterial = new THREE.MeshPhongMaterial({
      color: robotColor,
      emissive: new THREE.Color(0x111111),
      shininess: 100,
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });

    const mouthMaterial = new THREE.MeshBasicMaterial({
      color: accentColor,
    });

    // Head
    if (!headRef.current) {
      const head = new THREE.Mesh(geometries.head, robotMaterial);
      head.position.y = 1.2;
      head.castShadow = true;
      head.receiveShadow = true;
      headRef.current = head;
      groupRef.current?.add(head);
    }

    // Body
    if (!bodyRef.current) {
      const body = new THREE.Mesh(geometries.body, robotMaterial);
      body.position.y = -0.2;
      body.castShadow = true;
      body.receiveShadow = true;
      bodyRef.current = body;
      groupRef.current?.add(body);
    }

    // Left Eye
    if (!eyeLeftRef.current) {
      const eyeLeft = new THREE.Mesh(geometries.eye, eyeMaterial);
      eyeLeft.position.set(-0.35, 1.5, 0.55);
      eyeLeft.castShadow = true;
      eyeLeft.receiveShadow = true;
      eyeLeftRef.current = eyeLeft;
      headRef.current?.add(eyeLeft);
    }

    // Right Eye
    if (!eyeRightRef.current) {
      const eyeRight = new THREE.Mesh(geometries.eye, eyeMaterial);
      eyeRight.position.set(0.35, 1.5, 0.55);
      eyeRight.castShadow = true;
      eyeRight.receiveShadow = true;
      eyeRightRef.current = eyeRight;
      headRef.current?.add(eyeRight);
    }

    // Eye Lights (Glow)
    if (!eyeGlowLeftRef.current) {
      const glowLeft = new THREE.PointLight(glowColor, 1.5, 3);
      glowLeft.position.set(-0.35, 1.5, 0.85);
      eyeGlowLeftRef.current = glowLeft;
      headRef.current?.add(glowLeft);
    }

    if (!eyeGlowRightRef.current) {
      const glowRight = new THREE.PointLight(glowColor, 1.5, 3);
      glowRight.position.set(0.35, 1.5, 0.85);
      eyeGlowRightRef.current = glowRight;
      headRef.current?.add(glowRight);
    }

    // Mouth
    if (!mouthRef.current) {
      const mouth = new THREE.Mesh(geometries.mouth, mouthMaterial);
      mouth.position.set(0, 1, 0.6);
      mouth.castShadow = true;
      mouth.receiveShadow = true;
      mouthRef.current = mouth;
      headRef.current?.add(mouth);
    }

    // Antennae
    const antenna1 = new THREE.Mesh(geometries.antenna, robotMaterial);
    antenna1.position.set(-0.3, 2.1, 0);
    antenna1.castShadow = true;
    headRef.current?.add(antenna1);

    const antenna2 = new THREE.Mesh(geometries.antenna, robotMaterial);
    antenna2.position.set(0.3, 2.1, 0);
    antenna2.castShadow = true;
    headRef.current?.add(antenna2);
  }, [geometries, robotColor, accentColor, glowColor]);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle rotation
    groupRef.current.rotation.y += 0.008;

    // Breathing animation
    const breathe = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + breathe;
    }

    // Head tilt when listening
    if (isListening && headRef.current) {
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
    }

    // Eye glow intensity
    const eyeIntensity = isSpeaking ? 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5 : 1.5;
    if (eyeGlowLeftRef.current) eyeGlowLeftRef.current.intensity = eyeIntensity;
    if (eyeGlowRightRef.current) eyeGlowRightRef.current.intensity = eyeIntensity;

    // Speaking animation - mouth
    if (isSpeaking && mouthRef.current) {
      const mouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 4)) * 0.3;
      mouthRef.current.scale.y = 1 + mouthOpen;
      mouthRef.current.position.y = 1 - mouthOpen * 0.1;

      // Light pulse during speaking
      if (eyeGlowLeftRef.current && eyeGlowRightRef.current) {
        const pulse = 1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.8;
        eyeGlowLeftRef.current.intensity = pulse;
        eyeGlowRightRef.current.intensity = pulse;
      }
    } else {
      if (mouthRef.current) {
        mouthRef.current.scale.y = 1;
        mouthRef.current.position.y = 1;
      }
    }

    // Eye blinking
    const blink = Math.max(0, Math.sin(state.clock.elapsedTime * 2) - 0.8) * 2;
    if (eyeLeftRef.current) eyeLeftRef.current.scale.z = Math.max(0.1, 1 - blink);
    if (eyeRightRef.current) eyeRightRef.current.scale.z = Math.max(0.1, 1 - blink);
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.8} />
      
      {/* Key light */}
      <pointLight position={[3, 3, 3]} intensity={1.5} castShadow />
      
      {/* Fill light */}
      <pointLight position={[-2, 2, 2]} intensity={0.8} />
    </group>
  );
}
