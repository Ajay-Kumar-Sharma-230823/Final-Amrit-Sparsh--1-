﻿'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  motion, useInView, useScroll, useTransform,
  AnimatePresence, useMotionValue, useSpring
} from 'framer-motion';
import {
  Mail, ExternalLink, ArrowRight, Star, Code2, Sparkles,
  Heart, Shield, MapPin, AlertTriangle, CreditCard, Users,
  Brain, Play, Video, ChevronRight
} from 'lucide-react';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DATA
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const mentors = [
  { name: 'Dr. Sanmati Jain', role: 'Academic Mentor', emoji: '👩‍🏫', color: '#7C3AED', image: 'sanmati-jain.jpeg' },
  { name: 'Mr. Ashok Sharma', role: 'Medical Advisor', emoji: '👨‍⚕️', color: '#0EA5E9', image: 'ashok-sharma.jpeg' },
  { name: 'Ms. Shruti Sharma', role: 'Mentor – AI', emoji: '👩‍💻', color: '#EC4899', image: 'shruti-sharma.jpeg' },
  { name: 'Mr. Uday Kure', role: 'Industry Mentor', emoji: '👨‍🏫', color: '#F59E0B', image: 'uday-kure.jpeg' },
];

const coreTeam = [
  { name: 'Harsh Sahu', role: 'Research Lead', emoji: '🔬', module: 'MDR', color: '#10B981', image: 'harsh-sahu.jpeg' },
  { name: 'Akshat Yadav', role: 'Co-Founder', emoji: '🚀', module: 'All', color: '#6366F1', image: 'akshat-yadav.jpeg' },
  { name: 'Shama Rahangdale', role: 'UI/UX Designer', emoji: '🎨', module: 'All', color: '#EC4899', image: 'shama-rahangdale.jpeg' },
  { name: 'Aditya Kumrawat', role: 'AI/ML Researcher', emoji: '🤖', module: 'MDR', color: '#8B5CF6', image: 'aditya-kumrawat.jpeg' },
  { name: 'Anurag Chouhan', role: 'Frontend Developer', emoji: '🖥️', module: 'Student', color: '#14B8A6', image: 'anurag-chouhan.jpeg' },
];

const extendedTeam = [
  { name: 'Adarsh Ghodrao', role: 'Full Stack Dev', emoji: '💻', module: 'ABHA', color: '#F97316', image: 'adarsh-ghodrao.jpeg' },
  { name: 'Aditya Tawre', role: 'Chief Strategist', emoji: '📊', module: 'SOS', color: '#EF4444', image: 'aditya-tawre.jpeg' },
  { name: 'Swaksh Patwari', role: 'Testing Engineer', emoji: '🧪', module: 'Student', color: '#06B6D4', image: 'swaksh-patwari.jpeg' },
  { name: 'Krishna Dhingra', role: 'Backend Developer', emoji: '⚙️', module: 'ABHA', color: '#A855F7', image: 'krishna-dhingra.jpeg' },
  { name: 'Radhika Warude', role: 'Support Engineer', emoji: '🛠️', module: 'SOS', color: '#F43F5E', image: 'radhika-warude.jpeg' },
  { name: 'Ujala Thakur', role: 'Project Coordinator', emoji: '📋', module: 'ASHA', color: '#84CC16', image: 'ujala-thakur.jpeg' },
];
const recognitions = [
  { name: 'SIH',         full: 'Smart India Hackathon',    emoji: '🏆',           color: '#FF6B00' },
  { name: 'Wipro & APU', full: 'Wipro x APU Bengaluru',   emoji: '🔷',          color: '#2B4EAC' },
  { name: 'IIT Delhi',   full: 'IIT Delhi Partnership',    emoji: '⚡',             color: '#003580' },
  { name: 'IIT Indore',  full: 'IIT Indore Collaboration', emoji: '🔬',            color: '#003580' },
  { name: 'IIM',         full: 'IIM Strategic Partner',    emoji: '📈',            color: '#6B0F1A' },
  { name: 'MSME',        full: 'MSME, Govt of India',      emoji: '🏛️',color: '#1B6CA8' },
  { name: 'MP Govt',     full: 'Madhya Pradesh Govt',      emoji: '🗺️', color: '#2D6A4F' },
  { name: 'AIIMS',       full: 'AIIMS Partnership',        emoji: '🏥',         color: '#B5179E' },
];

const stats = [
  { label: 'MDR Tracker',        value: 'v1.0', emoji: '🦠' },
  { label: 'MahaKumbh Mode',     value: 'v1.0', emoji: '🏛️' },
  { label: 'Student Healthcare', value: 'v1.0', emoji: '🎓' },
  { label: 'Emergency SOS',      value: 'v1.0', emoji: '🚨' },
  { label: 'ASHA Worker Portal', value: 'v1.0', emoji: '🌿' },
  { label: 'ABHA Integration',   value: 'v1.0', emoji: 'ID' },
];

const featureTags = [
  'AI-Powered', 'Real-time Analytics', 'Secure ABHA',
  'Rural Reach', 'Emergency Response', 'MDR Tracking',
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HELPERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/** Scroll-triggered fade-in */
function FadeIn({
  children, delay = 0, direction = 'up',
}: { children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'none' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const y0 = direction === 'up' ? 50 : 0;
  const x0 = direction === 'left' ? -50 : direction === 'right' ? 50 : 0;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: y0, x: x0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/** Mouse-tracking 3D tilt */
function TiltCard({ children, style = {}, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 25 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 25 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientY - r.top) / r.height - 0.5) * 12;
    const y = -((e.clientX - r.left) / r.width - 0.5) * 12;
    rotX.set(x); rotY.set(y);
  };
  const handleLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div ref={ref}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d', perspective: 1000, ...style }}
      className={className}>
      {children}
    </motion.div>
  );
}

/** Section heading */
function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <FadeIn>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', borderRadius: 999, padding: '5px 16px', marginBottom: 18 }}>
          <Sparkles size={12} color="var(--accent-primary)" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{eyebrow}</span>
        </motion.div>
        <h2 style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, marginBottom: 14 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>{subtitle}</p>}
      </div>
    </FadeIn>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FLOATING BACKGROUND BLOBS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function BackgroundBlobs() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {[
        { x: '-10%', y: '5%', size: 500, dur: 18, color: 'var(--accent-surface)', opacity: 0.7 },
        { x: '70%', y: '15%', size: 400, dur: 22, color: 'var(--accent-surface)', opacity: 0.5 },
        { x: '30%', y: '60%', size: 350, dur: 16, color: 'var(--accent-surface)', opacity: 0.4 },
        { x: '80%', y: '70%', size: 300, dur: 20, color: 'var(--accent-surface)', opacity: 0.3 },
      ].map((b, i) => (
        <motion.div key={i}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          style={{
            position: 'absolute', left: b.x, top: b.y,
            width: b.size, height: b.size, borderRadius: '50%',
            background: b.color, opacity: b.opacity,
            filter: 'blur(80px)',
          }}
        />
      ))}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FLOATING PARTICLES (for founder card)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function FloatingParticles({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], x: [0, Math.sin(i) * 10, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: `${10 + (i * 7.5) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ANIMATED BORDER (CSS-injected)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const founderBorderStyle = `
@keyframes border-spin {
  from { --border-angle: 0turn; }
  to   { --border-angle: 1turn; }
}
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0turn;
  inherits: false;
}
.founder-animated-border {
  background:
    linear-gradient(var(--bg-primary, #0A0A0A), var(--bg-primary, #0A0A0A)) padding-box,
    conic-gradient(from var(--border-angle), transparent 40%, rgba(255,255,255,0.6) 60%, transparent 80%) border-box;
  border: 2px solid transparent;
  animation: border-spin 4s linear infinite;
}
`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PREMIUM MENTOR CARD â€” Trading Card Style
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function PremiumMentorCard({ name, role, emoji, color, image, delay = 0 }: {
  name: string; role: string; emoji: string; color: string; image: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const sX = useSpring(mouseX, { stiffness: 150, damping: 22 });
  const sY = useSpring(mouseY, { stiffness: 150, damping: 22 });
  const [hovered, setHovered] = useState(false);

  const rotX = useTransform(sY, [0, 1], [14, -14]);
  const rotY = useTransform(sX, [0, 1], [-14, 14]);
  const spotlight = useTransform(
    [sX, sY],
    ([x, y]: number[]) => `radial-gradient(380px circle at ${x * 100}% ${y * 100}%, ${color}28, transparent 65%)`
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => { setHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        whileHover={{ scale: 1.06, z: 50 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}>

        {/* â”€â”€ Outer drop shadow bloom â”€â”€ */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', inset: -20, borderRadius: 52, zIndex: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 60%, ${color}50, transparent 70%)`,
            filter: 'blur(28px)',
          }} />

        {/* â”€â”€ Spinning conic border â”€â”€ */}
        <div style={{ position: 'relative', borderRadius: 38, padding: 2, overflow: 'hidden', zIndex: 1 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -70, zIndex: 0,
              background: `conic-gradient(from 0deg, transparent 30%, ${color}FF 45%, rgba(255,255,255,0.95) 50%, ${color}CC 55%, transparent 70%)`,
              opacity: hovered ? 1 : 0.45,
              transition: 'opacity 0.45s',
            }} />

          {/* â”€â”€ Card body â”€â”€ */}
          <div style={{ position: 'relative', zIndex: 1, borderRadius: 36, overflow: 'hidden', background: 'var(--bg-card)' }}>

            {/* â–“â–“ COLOUR HEADER BAND â–“â–“ */}
            <div style={{
              height: 140, position: 'relative', overflow: 'hidden',
              background: `linear-gradient(145deg, ${color} 0%, ${color}DD 45%, ${color}66 100%)`,
            }}>
              {/* Dot grid */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)`,
                backgroundSize: '18px 18px',
              }} />
              {/* Decorative blobs */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ position: 'absolute', top: 20, left: -30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              {/* Animated star dots */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div key={i}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.6, 1.5, 0.6] }}
                  transition={{ duration: 2.4 + i * 0.35, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 28}%`,
                    width: 5 + (i % 2) * 3, height: 5 + (i % 2) * 3,
                    borderRadius: '50%', background: 'white',
                    boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                  }} />
              ))}
              {/* Role pill */}
              <div style={{
                position: 'absolute', top: 14, left: 14, zIndex: 2,
                background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 999, padding: '5px 14px',
                fontSize: 10, fontWeight: 800, color: 'white',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{role}</div>
            </div>

            {/* â–“â–“ AVATAR â€” overlapping â–“â–“ */}
            <div style={{ marginTop: -58, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 3 }}>
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 0 4px white, 0 0 0 8px ${color}70, 0 16px 56px ${color}55`,
                    `0 0 0 4px white, 0 0 0 12px ${color}40, 0 22px 64px ${color}75`,
                    `0 0 0 4px white, 0 0 0 8px ${color}70, 0 16px 56px ${color}55`,
                  ]
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 116, height: 116, borderRadius: 30, overflow: 'hidden', background: `${color}30`, position: 'relative' }}>
                <img src={image} alt={name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = 'flex'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{emoji}</div>
                {/* Shine sweep */}
                <motion.div
                  animate={{ x: hovered ? '220%' : '-120%' }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%)' }} />
              </motion.div>
            </div>

            {/* â–“â–“ TEXT â–“â–“ */}
            <div style={{ padding: '16px 28px 30px', textAlign: 'center' }}>
              <motion.div
                animate={{ y: hovered ? -3 : 0 }}
                style={{ fontSize: 21, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', fontFamily: 'Outfit, sans-serif', marginBottom: 10 }}>
                {name}
              </motion.div>
              <motion.div
                animate={{ scaleX: hovered ? 1 : 0.4, opacity: hovered ? 1 : 0.4 }}
                style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius: 1, transformOrigin: 'center' }} />
            </div>

            {/* Mouse spotlight */}
            <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6, background: spotlight }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PREMIUM MEMBER CARD â€” Holographic Player Card
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function PremiumMemberCard({ name, role, emoji, module: mod, color = '#5A3E2B', image, delay = 0 }: {
  name: string; role: string; emoji: string; module: string; color?: string; image: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const sX = useSpring(mouseX, { stiffness: 200, damping: 26 });
  const sY = useSpring(mouseY, { stiffness: 200, damping: 26 });
  const [hovered, setHovered] = useState(false);

  const rotX = useTransform(sY, [0, 1], [12, -12]);
  const rotY = useTransform(sX, [0, 1], [-12, 12]);
  const spotlight = useTransform(
    [sX, sY],
    ([x, y]: number[]) => `radial-gradient(220px circle at ${x * 100}% ${y * 100}%, ${color}24, transparent 65%)`
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900, height: '100%' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => { setHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        whileHover={{ scale: 1.07, z: 36 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', height: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}>

        {/* Bloom shadow */}
        <motion.div
          animate={{ opacity: hovered ? 0.9 : 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'absolute', inset: -14, borderRadius: 36, zIndex: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 65%, ${color}45, transparent 70%)`,
            filter: 'blur(18px)',
          }} />

        {/* Spinning conic border */}
        <div style={{ position: 'relative', borderRadius: 30, padding: 1.5, overflow: 'hidden', zIndex: 1, height: '100%' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -50, zIndex: 0,
              background: `conic-gradient(from 0deg, transparent 35%, ${color}FF 48%, rgba(255,255,255,0.8) 50%, ${color}CC 55%, transparent 68%)`,
              opacity: hovered ? 1 : 0.3,
              transition: 'opacity 0.4s',
            }} />

          {/* Card inner */}
          <div style={{ position: 'relative', zIndex: 1, borderRadius: 29, overflow: 'hidden', background: 'var(--bg-card)', height: '100%' }}>

            {/* Colour header */}
            <div style={{
              height: 88, position: 'relative', overflow: 'hidden',
              background: `linear-gradient(140deg, ${color} 0%, ${color}CC 50%, ${color}44 100%)`,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                backgroundSize: '14px 14px',
              }} />
              <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -16, left: -16, width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              {/* Mini stars */}
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.5, 1.3, 0.5] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{
                    position: 'absolute',
                    left: `${20 + i * 30}%`, top: `${30 + (i % 2) * 35}%`,
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'white', boxShadow: '0 0 6px rgba(255,255,255,0.9)',
                  }} />
              ))}
            </div>

            {/* Avatar overlapping */}
            <div style={{ marginTop: -40, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 3, marginBottom: 12 }}>
              <motion.div
                animate={{
                  boxShadow: hovered
                    ? `0 0 0 3px white, 0 0 0 7px ${color}90, 0 12px 44px ${color}65`
                    : `0 0 0 3px white, 0 0 0 5px ${color}55, 0 8px 24px ${color}35`,
                }}
                transition={{ duration: 0.4 }}
                style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', background: `${color}20`, position: 'relative' }}>
                <img src={image} alt={name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = 'flex'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{emoji}</div>
                {/* Shine */}
                <motion.div
                  animate={{ x: hovered ? '220%' : '-100%' }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', background: 'linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.38) 50%, transparent 72%)' }} />
              </motion.div>
            </div>

            {/* Text */}
            <div style={{ padding: '0 16px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.015em', fontFamily: 'Outfit, sans-serif', marginBottom: 3 }}>{name}</div>
              <motion.div
                animate={{ color: hovered ? color : 'var(--text-muted)' }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 11, letterSpacing: '0.02em' }}>{role}</motion.div>
              <motion.div
                animate={{
                  background: hovered ? `${color}30` : `${color}16`,
                  borderColor: hovered ? `${color}80` : `${color}38`,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'inline-block', borderRadius: 999, padding: '3px 13px',
                  fontSize: 8.5, fontWeight: 800, color: color,
                  border: '1px solid', letterSpacing: '0.09em',
                }}>{mod}</motion.div>
            </div>

            {/* Mouse spotlight */}
            <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: spotlight }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AboutModule() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });
  const heroParallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const [videoHovered, setVideoHovered] = useState(false);

  /* Inject animated border CSS */
  useEffect(() => {
    const existing = document.getElementById('founder-border-style');
    if (!existing) {
      const tag = document.createElement('style');
      tag.id = 'founder-border-style';
      tag.textContent = founderBorderStyle;
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <div ref={pageRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <BackgroundBlobs />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          1.  CINEMATIC HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <motion.section style={{ y: heroParallaxY, paddingBottom: 72, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>

          {/* LEFT â€” Text */}
          <FadeIn direction="left">
            <div>
              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', borderRadius: 999, padding: '5px 16px', marginBottom: 20 }}>
                <Sparkles size={12} color="var(--accent-primary)" />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Our Story</span>
              </motion.div>

              {/* Sub-heading */}
              <motion.h2
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em', marginBottom: 10, textTransform: 'uppercase' }}>
                About Amrit Sparsh
              </motion.h2>

              {/* MAIN HEADLINE */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 48, fontWeight: 900, letterSpacing: '-0.035em',
                  fontFamily: 'Outfit, sans-serif', lineHeight: 1.06, marginBottom: 24,
                  color: 'var(--text-primary)',
                }}>
                Reimagining<br />
                Healthcare<br />
                <span style={{ color: 'var(--accent-primary)' }}>for India</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
                style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 32, maxWidth: 500, letterSpacing: '0.01em' }}>
                Amrit Sparsh is an AI-driven unified healthcare platform designed to revolutionize healthcare accessibility across India. It integrates student healthcare, emergency response systems, MDR infection tracking, rural ASHA support, and large-scale public health management into one intelligent ecosystem.
              </motion.p>

              {/* 3D Feature Chips */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {featureTags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.06, type: 'spring', damping: 14 }}
                    whileHover={{ y: -5, scale: 1.06, boxShadow: '0 12px 28px rgba(90,62,43,0.22)' }}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 12, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      color: 'var(--text-secondary)', cursor: 'default',
                      boxShadow: 'var(--shadow-sm)',
                      transform: 'perspective(400px)',
                      transition: 'background 0.2s',
                    }}>
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </FadeIn>

          {/* RIGHT â€” YouTube Video in Premium Frame */}
          <FadeIn direction="right" delay={0.15}>
            <div style={{ position: 'relative' }}>
              {/* Glow halo behind video */}
              <div style={{
                position: 'absolute', inset: -24, borderRadius: 38,
                background: 'radial-gradient(ellipse at center, var(--accent-surface) 0%, transparent 70%)',
                filter: 'blur(32px)', zIndex: 0, opacity: 0.9,
              }} />

              {/* Floating label */}
              <motion.div
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <div style={{
                  background: 'var(--gradient-primary)', color: 'white',
                  borderRadius: 999, padding: '6px 18px', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: '0 8px 24px rgba(90,62,43,0.35)',
                  whiteSpace: 'nowrap',
                }}>
                  <Video size={14} />
                  Experience Amrit Sparsh in Action ðŸŽ¥
                </div>
              </motion.div>

              {/* Video Container */}
              <motion.div
                onHoverStart={() => setVideoHovered(true)}
                onHoverEnd={() => setVideoHovered(false)}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.03 }}
                style={{
                  position: 'relative', zIndex: 1,
                  borderRadius: 28,
                  overflow: 'hidden',
                  boxShadow: videoHovered
                    ? '0 0 0 2px var(--accent-primary), 0 32px 80px rgba(90,62,43,0.40), 0 8px 32px rgba(0,0,0,0.25)'
                    : '0 0 0 1.5px var(--border-strong), 0 24px 60px rgba(0,0,0,0.2)',
                  transition: 'box-shadow 0.4s ease',
                  aspectRatio: '16/9',
                  background: '#000',
                }}>
                {/* Glowing border overlay */}
                <motion.div
                  animate={{ opacity: videoHovered ? 1 : 0.4 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 28, zIndex: 2, pointerEvents: 'none',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                  }}
                />
                <iframe
                  src="https://www.youtube.com/embed/Wi8Xgct4jSM?si=BnKj_abAbEeq9ZNE&rel=0&modestbranding=1&color=white"
                  title="Amrit Sparsh â€” Experience in Action"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block', position: 'absolute', inset: 0 }}
                />
              </motion.div>

              {/* Decorative orbiting ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'calc(100% + 80px)', height: 'calc(100% + 80px)',
                  borderRadius: '50%', border: '1px dashed var(--border-color)',
                  opacity: 0.4, zIndex: 0, pointerEvents: 'none',
                }}
              />
            </div>
          </FadeIn>
        </div>
      </motion.section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          2.  STATS STRIP
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <FadeIn>
        <div style={{
          background: 'var(--gradient-primary)', borderRadius: 28, padding: '30px 44px',
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0,
          marginBottom: 88, boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden', position: 'relative', zIndex: 1,
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none', padding: '0 16px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 24 }}>{s.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginTop: 5, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.62)', marginTop: 3, letterSpacing: '0.05em' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          3.  FOUNDER 3D CARD (Next-Level)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ paddingBottom: 88, position: 'relative', zIndex: 1 }}>
        <SectionTitle eyebrow="Leadership" title="The Visionary Behind It All" />
        <FadeIn>
          {/* ════ CINEMATIC FOUNDER HERO CARD ════ */}
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ position: 'relative', borderRadius: 44, padding: 3, overflow: 'hidden' }}>
            {/* 3× faster spinning rainbow border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', inset: -100, zIndex: 0,
                background: 'conic-gradient(from 0deg, transparent 15%, #FF6B6B 30%, #FFD93D 38%, #6BCB77 46%, #4D96FF 54%, #C77DFF 62%, #FF6B6B 70%, transparent 85%)',
              }} />

            {/* Card body */}
            <div style={{
              position: 'relative', zIndex: 1, borderRadius: 42, overflow: 'hidden',
              background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0A2E 35%, #0A1628 70%, #0F1A0A 100%)',
              boxShadow: '0 40px 120px rgba(100,40,200,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'stretch', minHeight: 360,
            }}>

              {/* LEFT: Purple gradient photo panel */}
              <div style={{
                width: 300, flexShrink: 0, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 40%, #7C3AED 70%, #4338CA 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '48px 28px',
              }}>
                {/* Dot grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                {/* Blobs */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                {/* Star sparkles */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.6, 0.5] }}
                    transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
                    style={{
                      position: 'absolute',
                      left: `${8 + i * 13}%`, top: `${10 + (i % 4) * 22}%`,
                      width: 5 + (i % 3) * 2, height: 5 + (i % 3) * 2,
                      borderRadius: '50%', background: 'white', boxShadow: '0 0 12px rgba(255,255,255,0.9)',
                    }} />
                ))}

                {/* Photo with rings */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: -26, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(196,160,255,0.6), 0 0 0 8px rgba(124,58,237,0.4)',
                        '0 0 0 24px rgba(196,160,255,0), 0 0 0 18px rgba(124,58,237,0)',
                        '0 0 0 0 rgba(196,160,255,0.6), 0 0 0 8px rgba(124,58,237,0.4)',
                      ]
                    }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                    style={{
                      width: 188, height: 188, borderRadius: 40, overflow: 'hidden',
                      border: '4px solid rgba(255,255,255,0.55)',
                      background: 'rgba(255,255,255,0.1)', position: 'relative',
                    }}>
                    <img src="/founder.jpeg" alt="Ajay Kumar Sharma"
                      onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = 'flex'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    <div style={{ display: 'none', position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>AKS</div>
                    {/* Perpetual shine sweep */}
                    <motion.div
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                      style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)' }} />
                  </motion.div>
                  {/* Gold star badge */}
                  <div style={{
                    position: 'absolute', bottom: -8, right: -8,
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, boxShadow: '0 4px 24px rgba(255,165,0,0.7)',
                    border: '3px solid rgba(255,255,255,0.9)',
                  }}>★</div>
                </div>
                {/* Name under photo */}
                <div style={{ marginTop: 24, textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>Ajay Kumar Sharma</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Founder & Visionary</div>
                </div>
              </div>

              {/* RIGHT: Dark content panel */}
              <div style={{ flex: 1, padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                <FloatingParticles count={12} />
                {/* Glow blobs */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(28px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, left: 0, width: 160, height: 160, borderRadius: '50%', background: 'rgba(67,56,202,0.08)', filter: 'blur(20px)', pointerEvents: 'none' }} />

                {/* Neon pulsing badge */}
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 rgba(167,139,250,0.4)', '0 0 24px 6px rgba(124,58,237,0.4)', '0 0 0 0 rgba(167,139,250,0.4)'] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'linear-gradient(90deg, rgba(124,58,237,0.3), rgba(67,56,202,0.25))',
                    border: '1.5px solid rgba(167,139,250,0.5)',
                    borderRadius: 999, padding: '6px 18px', marginBottom: 20, width: 'fit-content',
                  }}>
                  <Star size={11} color="#C4B5FD" fill="#C4B5FD" />
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#C4B5FD', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Founder & Visionary Leader</span>
                </motion.div>

                {/* Gradient headline */}
                <h3 style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em',
                  fontFamily: 'Outfit, sans-serif', lineHeight: 1.05, marginBottom: 8,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 50%, #818CF8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Ajay Kumar Sharma</h3>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', marginBottom: 18, fontWeight: 500, letterSpacing: '0.02em' }}>Founder & CEO · Amrit Sparsh Healthcare Tech</div>

                {/* Personal message quote */}
                <div style={{
                  position: 'relative', marginBottom: 22, paddingLeft: 18,
                  borderLeft: '3px solid rgba(167,139,250,0.6)',
                }}>
                  <div style={{ fontSize: 28, color: 'rgba(196,181,253,0.4)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 4, marginLeft: -4 }}>&ldquo;</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
                    I built Amrit Sparsh because I believe every life deserves world-class healthcare — whether you live in a metro or the most remote village of India. We are not just building software; we are building hope, dignity, and a future where no one is left behind.
                  </p>
                  <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.6)', marginTop: 10, fontWeight: 700, letterSpacing: '0.05em', fontStyle: 'normal' }}>— Ajay Kumar Sharma, Founder & Visionary</div>
                </div>

                {/* Stat chips */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
                  {[{ val: '6', lbl: 'Modules' }, { val: '8+', lbl: 'Awards' }, { val: '20+', lbl: 'Team' }, { val: '∞', lbl: 'Impact' }].map((s) => (
                    <div key={s.lbl} style={{
                      background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.3)',
                      borderRadius: 14, padding: '8px 18px', textAlign: 'center', minWidth: 64,
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#C4B5FD', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Tag pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['AI & Healthcare', 'Public Health', 'Emergency SOS', 'Rural Tech', 'ABHA Integration', 'MDR Tracking'].map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.76)',
                      borderRadius: 999, padding: '5px 14px', fontSize: 11,
                      fontWeight: 600, border: '1px solid rgba(255,255,255,0.13)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </FadeIn>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          4.  MENTORS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ paddingBottom: 88, position: 'relative', zIndex: 1 }}>
        <SectionTitle eyebrow="Guidance" title="Our Esteemed Mentors"
          subtitle="The guiding lights who shaped Amrit Sparsh with wisdom, experience, and domain expertise." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {mentors.map((m, i) => (
            <PremiumMentorCard key={m.name} {...m} delay={i * 0.12} />
          ))}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          5.  CORE TEAM
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ paddingBottom: 88, position: 'relative', zIndex: 1 }}>
        <SectionTitle eyebrow="Core Team" title="Meet the Minds Behind Amrit Sparsh"
          subtitle="Passionate builders, designers and engineers who turned a bold vision into a living product." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
          {coreTeam.map((m, i) => (
            <PremiumMemberCard key={m.name} {...m} delay={i * 0.08} />
          ))}
        </div>

        {/* Extended Team */}
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-surface)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Extended Team</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>The backbone of Amrit Sparsh operations</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {extendedTeam.map((m, i) => (
              <PremiumMemberCard key={m.name} {...m} color="#5A3E2B" delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          6.  RECOGNITION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ paddingBottom: 88, position: 'relative', zIndex: 1 }}>
        <SectionTitle eyebrow="Recognition & Validation" title="Trusted by the Best"
          subtitle="Recognised by India's premier institutions, government bodies, and global technology leaders." />
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 32, padding: '44px 52px', boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, rowGap: 40 }}>
            {recognitions.map((r, i) => (
              <motion.div key={r.name}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.1, y: -8, rotate: 3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'default' }}>
                <motion.div
                  whileHover={{ boxShadow: `0 0 40px ${r.color}50, 0 16px 40px rgba(0,0,0,0.15)` }}
                  style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--accent-surface)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(8px)', transition: 'box-shadow 0.3s ease' }}>
                  {r.emoji}
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4, maxWidth: 110 }}>{r.full}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          7.  PLATFORM + CTA
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section style={{ paddingBottom: 32, position: 'relative', zIndex: 1 }}>
        <SectionTitle eyebrow="Platform" title="One Platform, Six Missions" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { icon: Heart, title: 'Student Healthcare', desc: 'Real-time vitals, AI assistant, ABHA for students.', color: '#B84040' },
            { icon: Shield, title: 'MDR Tracking', desc: 'Cluster detection, contact tracing, outbreak monitoring.', color: '#3D7A5E' },
            { icon: AlertTriangle, title: 'Emergency SOS', desc: 'One-tap emergency, GPS dispatch, profile sharing.', color: '#C47B2B' },
            { icon: MapPin, title: 'MahaKumbh Mode', desc: 'Mass gathering crowd intelligence, camp navigation.', color: '#5A3E2B' },
            { icon: Users, title: 'ASHA Portal', desc: 'Offline-first rural healthcare, vaccination tracking.', color: '#7A4E3E' },
            { icon: CreditCard, title: 'ABHA Identity', desc: 'Digital health card, consent management, records vault.', color: '#3D7A5E' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -7, scale: 1.02 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 22, padding: '24px 22px', boxShadow: 'var(--shadow-card)', cursor: 'default', transition: 'box-shadow 0.3s ease' }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={22} color={item.color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.desc}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA row */}
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 28, padding: 28, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code2 size={17} color="var(--accent-primary)" /> Built With
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Next.js 16', 'React 18', 'TypeScript', 'Three.js', 'Framer Motion', 'Recharts', 'Zustand', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Flutter'].map(t => (
                  <span key={t} style={{ background: 'var(--accent-surface)', color: 'var(--text-secondary)', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 600, border: '1px solid var(--border-color)' }}>{t}</span>
                ))}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }}
              style={{ background: 'var(--gradient-primary)', borderRadius: 28, padding: 28, boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Brain size={28} color="rgba(255,255,255,0.88)" style={{ marginBottom: 14 }} />
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>Join Our Mission</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginBottom: 20, lineHeight: 1.65 }}>
                  Partner with us to revolutionize healthcare across India. We are actively seeking collaborators, investors, and healthcare institutions.
                </p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 12, padding: '11px 22px', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 13, backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Get in Touch <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
