'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ═══════════════════════════════════ CSS ════════════════════════════════════ */
const MH_CSS = `
@keyframes mhSos  { 0%{box-shadow:0 0 0 0 rgba(224,60,60,.8)} 70%{box-shadow:0 0 0 18px rgba(224,60,60,0)} 100%{box-shadow:0 0 0 0 rgba(224,60,60,0)} }
@keyframes mhEcg  { 0%{stroke-dashoffset:300} 100%{stroke-dashoffset:0} }
@keyframes mhWear { 0%,100%{opacity:.4;transform:scale(.95)} 50%{opacity:1;transform:scale(1.04)} }
@keyframes mhRing { 0%{transform:scale(1);opacity:.55} 70%{transform:scale(2.2);opacity:0} 100%{opacity:0} }

.mz { cursor:pointer; transition:filter .18s; }
.mz:hover { filter:brightness(1.12) saturate(1.2); }

.mh-card {
  background:var(--bg-card); border:1px solid var(--border-color);
  border-radius:22px; box-shadow:var(--shadow-md); position:relative; overflow:hidden;
}
.mh-lbl { font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:13px; }
.mh-vbtn { padding:6px 18px;border-radius:30px;border:1.5px solid var(--border-color);background:transparent;color:var(--text-muted);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s; }
.mh-vbtn.act { border-color:#8B5E3C;background:rgba(139,94,60,.13);color:#8B5E3C; }
.mh-tip {
  position:fixed;z-index:9999;pointer-events:none;min-width:195px;
  background:rgba(6,10,20,.97);border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(18px);border-radius:14px;padding:11px 14px;
  box-shadow:0 20px 60px rgba(0,0,0,.7);
}
[data-theme="light"] .mh-tip {
  background:rgba(255,255,255,.97);border:1px solid rgba(70,110,140,.18);
  box-shadow:0 16px 50px rgba(70,110,140,.18);
}
`;

/* ═══════════════════════════════════ TYPES + DATA ═══════════════════════════ */
type Sev='healthy'|'warn'|'moderate'|'critical';
interface BPart{id:string;label:string;condition:string;sev:Sev;report:string;organKey?:string}
interface TipState{part:BPart;x:number;y:number}

const SEV_COLOR:Record<Sev,string>={healthy:'#B0BCCB',warn:'#D4A020',moderate:'#D07020',critical:'#C83030'};

const FRONT:BPart[]=[
  {id:'head',      label:'Head',          condition:'Migraine Detected',       sev:'moderate',report:'MRI Brain — Feb 2026',  organKey:'Head'},
  {id:'l-delt',    label:'L Deltoid',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-delt',    label:'R Deltoid',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'chest',     label:'Chest / Heart', condition:'Hypertension — High BP',   sev:'critical',report:'ECG — Mar 2026',        organKey:'Heart'},
  {id:'abs',       label:'Abdomen',       condition:'Healthy',                  sev:'healthy', report:'Liver enzymes normal'},
  {id:'l-oblique', label:'L Oblique',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-oblique', label:'R Oblique',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'l-bicep',   label:'L Bicep',       condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-bicep',   label:'R Bicep',       condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'l-fore',    label:'L Forearm',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-fore',    label:'R Forearm',     condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'l-quad',    label:'L Quadriceps',  condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-quad',    label:'R Quadriceps',  condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'l-shin',    label:'L Shin',        condition:'Healthy',                  sev:'healthy', report:'No issues'},
  {id:'r-shin',    label:'R Shin',        condition:'Healthy',                  sev:'healthy', report:'No issues'},
];
const BACK:BPart[]=[
  {id:'head-b',   label:'Head',          condition:'Migraine Detected',        sev:'moderate',report:'MRI Brain — Feb 2026',  organKey:'Head'},
  {id:'traps',    label:'Trapezius',     condition:'Mild Stiffness',           sev:'warn',    report:'Physiotherapy advised'},
  {id:'l-delt-b', label:'L Deltoid',    condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-delt-b', label:'R Deltoid',    condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'l-lat',    label:'L Latissimus', condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-lat',    label:'R Latissimus', condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'l-bk',     label:'Lower Back',   condition:'L4-L5 Mild Disc Bulge',    sev:'warn',    report:'MRI lumbar — Dec 2025'},
  {id:'r-bk',     label:'Lower Back',   condition:'L4-L5 Mild Disc Bulge',    sev:'warn',    report:'MRI lumbar — Dec 2025'},
  {id:'l-tri',    label:'L Tricep',     condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-tri',    label:'R Tricep',     condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'l-glute',  label:'L Glute',      condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-glute',  label:'R Glute',      condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'l-ham',    label:'L Hamstring',  condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-ham',    label:'R Hamstring',  condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'l-calf',   label:'L Calf',       condition:'Healthy',                   sev:'healthy', report:'No issues'},
  {id:'r-calf',   label:'R Calf',       condition:'Healthy',                   sev:'healthy', report:'No issues'},
];

/* ══════════════════ GRADIENT DEFS ══════════════════
  Using userSpaceOnUse anchored at (40,80) simulates
  consistent upper-left lighting across ALL muscles
  — same technique used in premium anatomy apps        */
const GRAD_DEFS = `
<defs>
  <!-- ─── Grey base: healthy muscle ─── -->
  <radialGradient id="gM" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#DDE7F0"/>
    <stop offset="45%"  stop-color="#B2BFCE"/>
    <stop offset="100%" stop-color="#7A8EA0"/>
  </radialGradient>
  <!-- lighter variant for head / hands -->
  <radialGradient id="gML" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#E8F0F7"/>
    <stop offset="50%"  stop-color="#C4D2DE"/>
    <stop offset="100%" stop-color="#92A4B8"/>
  </radialGradient>
  <!-- darker variant for recessed obliques/inner thigh -->
  <radialGradient id="gMD" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#CAD6E2"/>
    <stop offset="50%"  stop-color="#A0AEBB"/>
    <stop offset="100%" stop-color="#6E7E90"/>
  </radialGradient>

  <!-- ─── Disease gradients ─── -->
  <!-- critical / red (hypertension, injury) -->
  <radialGradient id="gCrit" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#F2A0A0"/>
    <stop offset="45%"  stop-color="#D44040"/>
    <stop offset="100%" stop-color="#922020"/>
  </radialGradient>
  <!-- moderate / orange (migraine) -->
  <radialGradient id="gMod" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#F2B870"/>
    <stop offset="45%"  stop-color="#D07828"/>
    <stop offset="100%" stop-color="#944C10"/>
  </radialGradient>
  <!-- warn / yellow (stiffness, disc) -->
  <radialGradient id="gWarn" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#EFD870"/>
    <stop offset="45%"  stop-color="#C8A010"/>
    <stop offset="100%" stop-color="#8C6C00"/>
  </radialGradient>

  <!-- ─── Shadows between muscle groups ─── -->
  <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#5A6A78" stop-opacity="0"/>
    <stop offset="100%" stop-color="#3A4A58" stop-opacity="0.55"/>
  </radialGradient>

  <!-- drop shadow filter for body -->
  <filter id="fShadow" x="-8%" y="-4%" width="116%" height="112%">
    <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#1A2A36" flood-opacity="0.35"/>
  </filter>
</defs>`;

/* Map severity → gradient id */
function gId(sev:Sev, base='gM'): string {
  if(sev==='healthy')  return base;
  if(sev==='critical') return 'gCrit';
  if(sev==='moderate') return 'gMod';
  if(sev==='warn')     return 'gWarn';
  return base;
}

/* Stroke colour per severity */
function gStroke(sev:Sev): string {
  if(sev==='healthy')  return '#5A6A7A';
  if(sev==='critical') return '#8A1818';
  if(sev==='moderate') return '#8A4400';
  if(sev==='warn')     return '#7A6200';
  return '#5A6A7A';
}

/* ══════════════════════════════════════════════════════════════════
   FRONT BODY SVG
   ViewBox 0 0 220 510 · CX=110
   Style: 3D anatomical muscle diagram (matches reference image)
   — radial gradients give domed 3D depth to each muscle group
   — thin dark strokes define muscle boundaries
   — disease-affected muscles use coloured gradients
══════════════════════════════════════════════════════════════════ */
function FrontBodySVG({parts,onHover,onLeave}:{
  parts:BPart[];onHover:(p:BPart,e:React.MouseEvent)=>void;onLeave:()=>void;
}){
  const pm=Object.fromEntries(parts.map(p=>[p.id,p]));
  const Z=(id:string)=>pm[id]||parts[0];
  const f=(id:string,base='gM')=>`url(#${gId(pm[id]?.sev||'healthy',base)})`;
  const s=(id:string)=>gStroke(pm[id]?.sev||'healthy');
  const SW=0.9; // standard stroke width
  const bp=(id:string,base?:string)=>({
    className:'mz' as const,
    fill:f(id,base),
    stroke:s(id),
    strokeWidth:SW,
    strokeLinejoin:'round' as const,
    onMouseMove:(e:React.MouseEvent)=>onHover(Z(id),e),
    onMouseLeave:onLeave,
  });
  /* static (non-interactive) grey base parts */
  const SP={fill:'url(#gM)',stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};
  const SPL={fill:'url(#gML)',stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};
  const SPD={fill:'url(#gMD)',stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};

  return (
    <svg viewBox="0 0 220 510" width="200" height="464" style={{display:'block',overflow:'visible'}}
      dangerouslySetInnerHTML={undefined}>

      {/* inject gradient defs via dangerouslySetInnerHTML wrapper workaround */}
      <defs>
        {/* grey healthy */}
        <radialGradient id="gM" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#DDE7F0"/>
          <stop offset="45%"  stopColor="#B2BFCE"/>
          <stop offset="100%" stopColor="#7A8EA0"/>
        </radialGradient>
        <radialGradient id="gML" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E8F0F7"/>
          <stop offset="50%"  stopColor="#C4D2DE"/>
          <stop offset="100%" stopColor="#92A4B8"/>
        </radialGradient>
        <radialGradient id="gMD" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#CAD6E2"/>
          <stop offset="50%"  stopColor="#A0AEBB"/>
          <stop offset="100%" stopColor="#6E7E90"/>
        </radialGradient>
        {/* disease colours */}
        <radialGradient id="gCrit" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F2A0A0"/>
          <stop offset="45%"  stopColor="#D44040"/>
          <stop offset="100%" stopColor="#922020"/>
        </radialGradient>
        <radialGradient id="gMod" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F2B870"/>
          <stop offset="45%"  stopColor="#D07828"/>
          <stop offset="100%" stopColor="#944C10"/>
        </radialGradient>
        <radialGradient id="gWarn" cx="40" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#EFD870"/>
          <stop offset="45%"  stopColor="#C8A010"/>
          <stop offset="100%" stopColor="#8C6C00"/>
        </radialGradient>
        <filter id="fBodyShadow" x="-10%" y="-4%" width="120%" height="116%">
          <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#1A2A36" floodOpacity="0.3"/>
        </filter>
        <filter id="fMuscleShadow">
          <feGaussianBlur stdDeviation="1.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ──── FEET ──── */}
      <path {...SP}
        d="M 61,465 C 50,467 41,472 36,480 C 33,487 37,493 47,495
           C 58,497 74,494 82,487 C 87,481 85,473 81,469 Z"/>
      <path {...SP}
        d="M 159,465 C 170,467 179,472 184,480 C 187,487 183,493 173,495
           C 162,497 146,494 138,487 C 133,481 135,473 139,469 Z"/>

      {/* ──── LOWER LEGS (shins) ──── */}
      <path {...bp('l-shin')}
        d="M 58,400 C 53,416 51,438 52,456 C 53,470 57,482 64,488
           C 70,492 80,492 86,487 C 91,473 91,453 90,434 C 89,416 87,400 84,391 Z"/>
      {/* tibialis peak */}
      <path {...SPL}
        d="M 62,406 C 60,420 60,438 62,453 C 63,462 66,470 69,476
           C 72,471 74,460 74,446 C 74,430 72,414 70,403 Z"
        style={{opacity:0.7}}/>

      <path {...bp('r-shin')}
        d="M 162,400 C 167,416 169,438 168,456 C 167,470 163,482 156,488
           C 150,492 140,492 134,487 C 129,473 129,453 130,434 C 131,416 133,400 136,391 Z"/>
      <path {...SPL}
        d="M 158,406 C 160,420 160,438 158,453 C 157,462 154,470 151,476
           C 148,471 146,460 146,446 C 146,430 148,414 150,403 Z"
        style={{opacity:0.7}}/>

      {/* ──── KNEECAPS ──── */}
      <path {...SPL}
        d="M 54,386 C 50,393 50,405 56,412 C 62,418 74,419 80,413
           C 86,406 85,394 80,387 C 74,381 60,381 54,386 Z"/>
      <path {...SPL}
        d="M 166,386 C 170,393 170,405 164,412 C 158,418 146,419 140,413
           C 134,406 135,394 140,387 C 146,381 160,381 166,386 Z"/>


      {/* ──── UPPER LEGS (thighs) ──── */}
      {/* Left thigh — single clean shape */}
      <path {...bp('l-quad')}
        d="M 66,272 C 56,286 51,308 50,330 C 48,352 52,372 58,386
           C 64,394 74,397 82,392 C 88,380 89,358 88,336 C 87,312 83,288 78,272 Z"/>

      {/* Right thigh — single clean shape */}
      <path {...bp('r-quad')}
        d="M 154,272 C 164,286 169,308 170,330 C 172,352 168,372 162,386
           C 156,394 146,397 138,392 C 132,380 131,358 132,336 C 133,312 137,288 142,272 Z"/>





      {/* ──── TORSO BASE (background) ──── */}
      <path {...SP}
        d="M 54,128 C 48,138 46,156 46,175 C 46,196 50,218 56,238
           C 60,253 65,265 70,272 L 150,272 C 155,265 160,253 164,238
           C 170,218 174,196 174,175 C 174,156 172,138 166,128 Z"/>

      {/* ──── OBLIQUES ──── */}
      <path {...bp('l-oblique','gMD')}
        d="M 56,150 C 50,166 49,184 52,202 C 55,220 62,238 70,254
           C 74,262 82,268 93,265 C 95,253 95,238 92,222 C 89,204 83,186 77,166
           C 73,152 64,146 58,148 Z"/>
      <path {...bp('r-oblique','gMD')}
        d="M 164,150 C 170,166 171,184 168,202 C 165,220 158,238 150,254
           C 146,262 138,268 127,265 C 125,253 125,238 128,222 C 131,204 137,186 143,166
           C 147,152 156,146 162,148 Z"/>

      {/* ──── RECTUS ABDOMINIS ──── */}
      <path {...bp('abs')}
        d="M 98,186 C 94,196 93,208 94,222 C 95,237 98,252 103,264
           C 106,271 110,274 110,274 C 110,274 114,271 117,264
           C 122,252 125,237 126,222 C 127,208 126,196 122,186
           C 119,179 115,175 110,175 C 105,175 101,179 98,186 Z"/>
      {/* ab segments (horizontal division lines) */}
      {[201,217,234].map(y=>(
        <path key={y} fill="none" stroke="#5A6A7A" strokeWidth="0.75" strokeOpacity="0.75"
          d={`M 95,${y} Q 110,${y-2} 125,${y}`}/>
      ))}
      {/* midline linea alba */}
      <line x1="110" y1="177" x2="110" y2="272" stroke="#5A6A7A" strokeWidth="0.65" strokeOpacity="0.65"/>
      {/* serratus ant bumps */}
      {[178,192,207].map((y,i)=>(
        <path key={y} fill="url(#gMD)" stroke="#5A6A7A" strokeWidth="0.5"
          d={`M ${54+i},${y} C ${52+i},${y+6} ${52+i},${y+12} ${55+i},${y+16} C ${57+i},${y+12} ${58+i},${y+6} ${55+i},${y} Z`}/>
      ))}
      {[178,192,207].map((y,i)=>(
        <path key={y+'r'} fill="url(#gMD)" stroke="#5A6A7A" strokeWidth="0.5"
          d={`M ${166-i},${y} C ${168-i},${y+6} ${168-i},${y+12} ${165-i},${y+16} C ${163-i},${y+12} ${162-i},${y+6} ${165-i},${y} Z`}/>
      ))}

      {/* ──── CHEST / PECTORALS ──── */}
      <path {...bp('chest')}
        d="M 56,128 C 52,138 51,152 56,168 C 62,182 72,194 90,198
           C 100,198 108,196 112,192 C 108,178 102,162 94,148
           C 86,134 74,124 60,124 Z"/>
      <path {...bp('chest')}
        d="M 164,128 C 168,138 169,152 164,168 C 158,182 148,194 130,198
           C 120,198 112,196 108,192 C 112,178 118,162 126,148
           C 134,134 146,124 160,124 Z"/>
      {/* pec line */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.8" strokeOpacity="0.7"
        d="M 58,154 C 70,147 88,146 110,153"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.8" strokeOpacity="0.7"
        d="M 162,154 C 150,147 132,146 110,153"/>
      {/* sternum */}
      <line x1="110" y1="128" x2="110" y2="198" stroke="#4A5A6A" strokeWidth="0.8" strokeOpacity="0.6"/>
      {/* clavicles */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="1.1" strokeLinecap="round"
        d="M 100,126 C 90,130 76,132 60,128"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="1.1" strokeLinecap="round"
        d="M 120,126 C 130,130 144,132 160,128"/>

      {/* ──── DELTOIDS ──── */}
      <path {...bp('l-delt')}
        d="M 58,124 C 44,126 32,138 27,155 C 22,171 27,188 37,197
           C 46,205 59,206 67,198 C 74,188 76,174 74,158 C 72,142 66,125 58,124 Z"/>
      {/* delt lines */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.65"
        d="M 31,163 C 40,156 53,154 64,160"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.55"
        d="M 28,178 C 36,172 48,170 58,175"/>

      <path {...bp('r-delt')}
        d="M 162,124 C 176,126 188,138 193,155 C 198,171 193,188 183,197
           C 174,205 161,206 153,198 C 146,188 144,174 146,158 C 148,142 154,125 162,124 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.65"
        d="M 189,163 C 180,156 167,154 156,160"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.55"
        d="M 192,178 C 184,172 172,170 162,175"/>

      {/* front trapezius slope */}
      <path {...SP}
        d="M 100,124 C 91,128 78,130 60,128 L 58,132 C 70,132 84,130 96,128 Z"/>
      <path {...SP}
        d="M 120,124 C 129,128 142,130 160,128 L 162,132 C 150,132 136,130 124,128 Z"/>

      {/* ──── UPPER ARMS (biceps) ──── */}
      {/* L upper arm base */}
      <path {...SP}
        d="M 38,192 C 31,208 28,226 28,242 C 28,258 33,272 41,282
           C 47,288 57,290 64,284 C 70,274 72,258 71,242 C 70,224 66,206 61,194 Z"/>
      {/* L bicep (slightly lighter domed shape) */}
      <path {...bp('l-bicep','gML')}
        d="M 34,210 C 30,222 30,238 34,251 C 37,260 44,266 51,263
           C 57,257 59,244 57,230 C 55,217 51,207 47,205 Z"/>
      {/* brachialis bump */}
      <path {...SPD}
        d="M 28,224 C 25,234 26,246 30,254 C 33,258 37,260 41,256
           C 38,246 37,234 36,224 Z"/>
      {/* bicep peak line */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.6"
        d="M 30,234 C 36,228 46,228 52,234"/>

      {/* R upper arm base */}
      <path {...SP}
        d="M 182,192 C 189,208 192,226 192,242 C 192,258 187,272 179,282
           C 173,288 163,290 156,284 C 150,274 148,258 149,242 C 150,224 154,206 159,194 Z"/>
      <path {...bp('r-bicep','gML')}
        d="M 186,210 C 190,222 190,238 186,251 C 183,260 176,266 169,263
           C 163,257 161,244 163,230 C 165,217 169,207 173,205 Z"/>
      <path {...SPD}
        d="M 192,224 C 195,234 194,246 190,254 C 187,258 183,260 179,256
           C 182,246 183,234 184,224 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.6"
        d="M 190,234 C 184,228 174,228 168,234"/>

      {/* ──── FOREARMS ──── */}
      <path {...bp('l-fore','gM')}
        d="M 27,284 C 22,300 20,318 20,334 C 20,348 25,362 33,370
           C 40,376 51,378 57,371 C 63,361 65,345 63,329 C 61,311 56,295 51,283 Z"/>
      {/* brachioradialis ridge */}
      <path fill="url(#gMD)" stroke="#5A6A7A" strokeWidth="0.6"
        d="M 48,288 C 46,302 46,318 48,332 C 50,342 54,350 57,354
           C 59,346 60,332 58,318 C 56,304 54,292 51,285 Z"/>

      <path {...bp('r-fore','gM')}
        d="M 193,284 C 198,300 200,318 200,334 C 200,348 195,362 187,370
           C 180,376 169,378 163,371 C 157,361 155,345 157,329 C 159,311 164,295 169,283 Z"/>
      <path fill="url(#gMD)" stroke="#5A6A7A" strokeWidth="0.6"
        d="M 172,288 C 174,302 174,318 172,332 C 170,342 166,350 163,354
           C 161,346 160,332 162,318 C 164,304 166,292 169,285 Z"/>

      {/* ──── HANDS ──── */}
      <path {...SPL}
        d="M 20,372 C 15,379 14,391 19,400 C 24,407 36,409 47,404
           C 55,399 58,388 54,378 C 51,370 46,366 41,366 Z"/>
      <path {...SPL}
        d="M 200,372 C 205,379 206,391 201,400 C 196,407 184,409 173,404
           C 165,399 162,388 166,378 C 169,370 174,366 179,366 Z"/>

      {/* ──── NECK ──── */}
      <path {...SP}
        d="M 98,100 C 94,108 93,118 93,128 C 93,132 95,136 99,138
           L 121,138 C 125,136 127,132 127,128 C 127,118 126,108 122,100 Z"/>
      {/* SCM lines */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.75" strokeOpacity="0.6"
        d="M 101,102 C 99,111 99,122 101,136"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.75" strokeOpacity="0.6"
        d="M 119,102 C 121,111 121,122 119,136"/>

      {/* ──── HEAD ──── */}
      <path {...bp('head','gML')}
        d="M 110,12 C 90,12 74,22 68,38 C 62,54 62,72 70,86
           C 78,100 92,108 110,108 C 128,108 142,100 150,86
           C 158,72 158,54 152,38 C 146,22 130,12 110,12 Z"/>
      {/* hair cap (slightly darkened top) */}
      <path fill="url(#gMD)" stroke="none" strokeOpacity="0"
        d="M 110,12 C 90,12 74,22 68,38 C 78,22 92,14 110,13
           C 128,14 142,22 152,38 C 146,22 130,12 110,12 Z"
        style={{opacity:0.65}}/>
      {/* ear L */}
      <path {...SPL}
        d="M 68,55 C 62,58 59,65 60,73 C 61,81 65,86 68,88
           C 69,84 70,78 70,72 C 70,66 70,60 68,55 Z"/>
      {/* ear R */}
      <path {...SPL}
        d="M 152,55 C 158,58 161,65 160,73 C 159,81 155,86 152,88
           C 151,84 150,78 150,72 C 150,66 150,60 152,55 Z"/>

      {/* ──── CRITICAL PULSE RING ──── */}
      {parts.filter(p=>p.sev==='critical').map(p=>(
        <circle key={p.id+'-ring'} cx="110" cy="163" r="34"
          fill="none" stroke="#D44040" strokeWidth="2.5" strokeOpacity=".4"
          style={{animation:'mhRing 2s ease-out infinite',transformOrigin:'110px 163px',pointerEvents:'none'}}/>
      ))}
    </svg>
  );
}

/* ════════════════════════════════ BACK BODY SVG ══════════════════════════════
   Same 3D anatomical muscle chart style, posterior view
════════════════════════════════════════════════════════════════════════════ */
function BackBodySVG({parts,onHover,onLeave}:{
  parts:BPart[];onHover:(p:BPart,e:React.MouseEvent)=>void;onLeave:()=>void;
}){
  const pm=Object.fromEntries(parts.map(p=>[p.id,p]));
  const Z=(id:string)=>pm[id]||parts[0];
  const f=(id:string,base='gM')=>`url(#${gId(pm[id]?.sev||'healthy',base)})`;
  const s=(id:string)=>gStroke(pm[id]?.sev||'healthy');
  const SW=0.9;
  const bp=(id:string,base?:string)=>({
    className:'mz' as const,fill:f(id,base||'gM'),stroke:s(id),strokeWidth:SW,strokeLinejoin:'round' as const,
    onMouseMove:(e:React.MouseEvent)=>onHover(Z(id),e),onMouseLeave:onLeave,
  });
  const SP= {fill:'url(#gM)', stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};
  const SPL={fill:'url(#gML)',stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};
  const SPD={fill:'url(#gMD)',stroke:'#5A6A7A',strokeWidth:SW,strokeLinejoin:'round' as const};

  return (
    <svg viewBox="0 0 220 510" width="200" height="464" style={{display:'block',overflow:'visible'}}>

      <defs>
        <radialGradient id="gM" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#DDE7F0"/>
          <stop offset="45%"  stopColor="#B2BFCE"/>
          <stop offset="100%" stopColor="#7A8EA0"/>
        </radialGradient>
        <radialGradient id="gML" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E8F0F7"/>
          <stop offset="50%"  stopColor="#C4D2DE"/>
          <stop offset="100%" stopColor="#92A4B8"/>
        </radialGradient>
        <radialGradient id="gMD" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#CAD6E2"/>
          <stop offset="50%"  stopColor="#A0AEBB"/>
          <stop offset="100%" stopColor="#6E7E90"/>
        </radialGradient>
        <radialGradient id="gCrit" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F2A0A0"/>
          <stop offset="45%"  stopColor="#D44040"/>
          <stop offset="100%" stopColor="#922020"/>
        </radialGradient>
        <radialGradient id="gMod" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F2B870"/>
          <stop offset="45%"  stopColor="#D07828"/>
          <stop offset="100%" stopColor="#944C10"/>
        </radialGradient>
        <radialGradient id="gWarn" cx="180" cy="60" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#EFD870"/>
          <stop offset="45%"  stopColor="#C8A010"/>
          <stop offset="100%" stopColor="#8C6C00"/>
        </radialGradient>
      </defs>

      {/* feet back */}
      <path {...SP}
        d="M 61,465 C 50,467 41,472 36,480 C 33,487 37,493 47,495 C 58,497 74,494 82,487 C 87,481 85,473 81,469 Z"/>
      <path {...SP}
        d="M 159,465 C 170,467 179,472 184,480 C 187,487 183,493 173,495 C 162,497 146,494 138,487 C 133,481 135,473 139,469 Z"/>

      {/* calves */}
      <path {...bp('l-calf')}
        d="M 54,404 C 50,420 48,442 50,460 C 51,474 56,486 64,492
           C 70,496 80,496 86,490 C 91,476 91,456 89,438 C 87,420 84,404 81,394 Z"/>
      {/* gastrocnemius heads */}
      <path {...SPD}
        d="M 58,408 C 56,422 57,440 60,456 C 62,466 66,474 70,478
           C 73,472 74,460 73,446 C 72,430 69,414 66,405 Z" style={{opacity:0.8}}/>
      <path {...SP}
        d="M 74,410 C 73,422 73,438 74,452 C 75,462 78,470 80,476
           C 83,468 84,454 83,440 C 82,426 79,412 76,405 Z" style={{opacity:0.75}}/>

      <path {...bp('r-calf')}
        d="M 166,404 C 170,420 172,442 170,460 C 169,474 164,486 156,492
           C 150,496 140,496 134,490 C 129,476 129,456 131,438 C 133,420 136,404 139,394 Z"/>
      <path {...SPD}
        d="M 162,408 C 164,422 163,440 160,456 C 158,466 154,474 150,478
           C 147,472 146,460 147,446 C 148,430 151,414 154,405 Z" style={{opacity:0.8}}/>
      <path {...SP}
        d="M 146,410 C 147,422 147,438 146,452 C 145,462 142,470 140,476
           C 137,468 136,454 137,440 C 138,426 141,412 144,405 Z" style={{opacity:0.75}}/>

      {/* knee back */}
      <path {...SPL}
        d="M 50,388 C 45,395 45,408 51,416 C 57,422 70,423 77,416 C 83,408 82,395 76,388 C 70,382 56,382 50,388 Z"/>
      <path {...SPL}
        d="M 170,388 C 175,395 175,408 169,416 C 163,422 150,423 143,416 C 137,408 138,395 144,388 C 150,382 164,382 170,388 Z"/>

      {/* hamstrings */}
      <path {...bp('l-ham')}
        d="M 60,278 C 53,294 49,316 49,337 C 49,360 54,382 62,394
           C 68,400 77,402 84,396 C 88,384 89,362 88,340 C 87,316 83,292 77,274 Z"/>
      <path {...bp('l-ham')}
        d="M 80,276 C 76,294 74,316 75,338 C 76,360 80,380 87,392
           C 92,398 100,400 106,392 C 109,378 108,358 106,338 C 103,316 98,294 92,276 Z"/>
      {/* ham lines */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.58"
        d="M 64,302 C 70,296 80,295 88,300"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.5"
        d="M 62,328 C 68,322 78,321 86,326"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.55" strokeOpacity="0.45"
        d="M 63,354 C 69,348 79,347 87,352"/>

      <path {...bp('r-ham')}
        d="M 160,278 C 167,294 171,316 171,337 C 171,360 166,382 158,394
           C 152,400 143,402 136,396 C 132,384 131,362 132,340 C 133,316 137,292 143,274 Z"/>
      <path {...bp('r-ham')}
        d="M 140,276 C 144,294 146,316 145,338 C 144,360 140,380 133,392
           C 128,398 120,400 114,392 C 111,378 112,358 114,338 C 117,316 122,294 128,276 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.58"
        d="M 156,302 C 150,296 140,295 132,300"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.5"
        d="M 158,328 C 152,322 142,321 134,326"/>



      {/* glutes */}
      <path {...bp('l-glute')}
        d="M 62,270 C 55,278 53,290 57,308 C 62,325 76,340 110,342 L 110,270 Z"/>
      <path {...bp('r-glute')}
        d="M 158,270 C 165,278 167,290 163,308 C 158,325 144,340 110,342 L 110,270 Z"/>
      {/* glute crease */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="1" strokeOpacity="0.55"
        d="M 64,318 C 80,328 98,332 110,332 C 122,332 140,328 156,318"/>

      {/* torso back base */}
      <path {...SP}
        d="M 54,128 C 48,138 46,156 46,175 C 46,196 50,218 56,238
           C 60,253 65,265 70,272 L 150,272 C 155,265 160,253 164,238
           C 170,218 174,196 174,175 C 174,156 172,138 166,128 Z"/>

      {/* lower back / erector spinae */}
      <path {...bp('l-bk')}
        d="M 100,190 C 96,204 94,220 96,238 C 98,254 103,266 110,272 L 110,190 Z"/>
      <path {...bp('r-bk')}
        d="M 120,190 C 124,204 126,220 124,238 C 122,254 117,266 110,272 L 110,190 Z"/>
      {/* erector columns */}
      <line x1="107" y1="185" x2="107" y2="270" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.7"/>
      <line x1="113" y1="185" x2="113" y2="270" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.7"/>

      {/* lats */}
      <path {...bp('l-lat')}
        d="M 54,134 C 48,148 47,164 52,182 C 57,200 68,220 82,238
           C 90,248 101,258 116,262 C 118,250 116,234 110,216 C 104,198 94,178 82,160
           C 72,144 62,132 56,132 Z"/>
      {/* lat striations */}
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.55"
        d="M 57,158 C 66,152 80,150 92,158"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.55" strokeOpacity="0.5"
        d="M 54,178 C 64,170 78,168 92,176"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.5" strokeOpacity="0.45"
        d="M 54,200 C 64,192 80,190 96,198"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.5" strokeOpacity="0.4"
        d="M 57,222 C 68,214 84,212 100,220"/>

      <path {...bp('r-lat')}
        d="M 166,134 C 172,148 173,164 168,182 C 163,200 152,220 138,238
           C 130,248 119,258 104,262 C 102,250 104,234 110,216 C 116,198 126,178 138,160
           C 148,144 158,132 164,132 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.6" strokeOpacity="0.55"
        d="M 163,158 C 154,152 140,150 128,158"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.55" strokeOpacity="0.5"
        d="M 166,178 C 156,170 142,168 128,176"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.5" strokeOpacity="0.45"
        d="M 166,200 C 156,192 140,190 124,198"/>

      {/* infraspinatus / teres */}
      <path {...SPD}
        d="M 63,144 C 58,156 58,170 64,182 C 70,190 82,195 92,190
           C 94,180 92,166 88,154 C 82,142 71,140 65,142 Z" style={{opacity:0.9}}/>
      <path {...SPD}
        d="M 157,144 C 162,156 162,170 156,182 C 150,190 138,195 128,190
           C 126,180 128,166 132,154 C 138,142 149,140 155,142 Z" style={{opacity:0.9}}/>

      {/* trapezius */}
      <path {...bp('traps')}
        d="M 110,128 C 100,132 86,136 70,134 C 62,130 56,128 54,130
           C 58,136 66,140 78,140 C 92,140 108,136 110,134
           C 112,136 128,140 142,140 C 154,140 162,136 166,130
           C 164,128 158,130 150,134 C 134,136 120,132 110,128 Z"/>
      {/* upper trap */}
      <path {...bp('traps')}
        d="M 94,108 C 85,114 74,120 62,124 C 58,128 58,132 66,132
           C 80,132 98,128 110,124 C 122,128 140,132 154,132
           C 162,132 162,128 158,124 C 146,120 135,114 126,108 Z"/>
      {/* rhomboid area */}
      <path {...SPD}
        d="M 96,140 C 93,150 93,162 96,174 C 99,180 106,183 110,182
           C 114,183 121,180 124,174 C 127,162 127,150 124,140 Z" style={{opacity:0.85}}/>

      {/* posterior deltoids */}
      <path {...bp('l-delt-b')}
        d="M 58,124 C 44,126 32,138 27,155 C 22,171 27,188 37,197
           C 46,205 59,206 67,198 C 74,188 76,174 74,158 C 72,142 66,125 58,124 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.6"
        d="M 31,163 C 40,156 53,154 64,160"/>
      <path {...bp('r-delt-b')}
        d="M 162,124 C 176,126 188,138 193,155 C 198,171 193,188 183,197
           C 174,205 161,206 153,198 C 146,188 144,174 146,158 C 148,142 154,125 162,124 Z"/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.65" strokeOpacity="0.6"
        d="M 189,163 C 180,156 167,154 156,160"/>

      {/* triceps */}
      <path {...bp('l-tri')}
        d="M 28,196 C 22,212 20,230 21,247 C 22,261 28,275 38,283
           C 45,289 56,290 62,282 C 68,272 70,255 68,238 C 66,220 61,202 56,193 Z"/>
      {/* tricep long head accent */}
      <path {...SPD}
        d="M 27,218 C 25,230 26,244 30,255 C 33,262 38,266 43,262
           C 39,250 38,236 37,223 Z" style={{opacity:0.8}}/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.65"
        d="M 26,228 C 32,222 44,222 54,228"/>

      <path {...bp('r-tri')}
        d="M 192,196 C 198,212 200,230 199,247 C 198,261 192,275 182,283
           C 175,289 164,290 158,282 C 152,272 150,255 152,238 C 154,220 159,202 164,193 Z"/>
      <path {...SPD}
        d="M 193,218 C 195,230 194,244 190,255 C 187,262 182,266 177,262
           C 181,250 182,236 183,223 Z" style={{opacity:0.8}}/>
      <path fill="none" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.65"
        d="M 194,228 C 188,222 176,222 166,228"/>

      {/* forearms back */}
      <path {...SPD}
        d="M 20,285 C 15,301 14,319 16,335 C 18,349 24,363 33,370
           C 40,376 51,377 57,369 C 63,358 65,342 63,326 C 61,308 56,292 51,283 Z"/>
      <path {...SPD}
        d="M 200,285 C 205,301 206,319 204,335 C 202,349 196,363 187,370
           C 180,376 169,377 163,369 C 157,358 155,342 157,326 C 159,308 164,292 169,283 Z"/>

      {/* hands back */}
      <path {...SPL}
        d="M 15,372 C 10,379 9,391 14,400 C 19,407 31,409 43,403 C 51,398 54,387 50,377 C 46,369 41,365 36,365 Z"/>
      <path {...SPL}
        d="M 205,372 C 210,379 211,391 206,400 C 201,407 189,409 177,403 C 169,398 166,387 170,377 C 174,369 179,365 184,365 Z"/>

      {/* neck */}
      <path {...SP}
        d="M 98,100 C 94,108 93,118 93,128 C 93,132 95,136 99,138 L 121,138
           C 125,136 127,132 127,128 C 127,118 126,108 122,100 Z"/>
      <line x1="103" y1="102" x2="103" y2="138" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.55"/>
      <line x1="117" y1="102" x2="117" y2="138" stroke="#4A5A6A" strokeWidth="0.7" strokeOpacity="0.55"/>

      {/* head back */}
      <path {...bp('head-b','gML')}
        d="M 110,12 C 90,12 74,22 68,38 C 62,54 62,72 70,86 C 78,100 92,108 110,108
           C 128,108 142,100 150,86 C 158,72 158,54 152,38 C 146,22 130,12 110,12 Z"/>
      <path fill="url(#gMD)" stroke="none"
        d="M 110,12 C 90,12 74,22 68,38 C 78,22 92,14 110,13 C 128,14 142,22 152,38
           C 146,22 130,12 110,12 Z" style={{opacity:0.6}}/>
      <path {...SPL}
        d="M 68,55 C 62,58 59,65 60,73 C 61,81 65,86 68,88 C 69,84 70,78 70,72 C 70,66 70,60 68,55 Z"/>
      <path {...SPL}
        d="M 152,55 C 158,58 161,65 160,73 C 159,81 155,86 152,88 C 151,84 150,78 150,72 C 150,66 150,60 152,55 Z"/>

      {/* warn ring */}
      {parts.filter(p=>p.sev==='warn'||p.sev==='moderate').slice(0,1).map(p=>(
        <ellipse key={p.id+'-bw'} cx="110" cy="200" rx="38" ry="32"
          fill="none" stroke={SEV_COLOR[p.sev]} strokeWidth="2" strokeOpacity=".35"
          style={{animation:'mhRing 2.6s ease-out infinite',transformOrigin:'110px 200px',pointerEvents:'none'}}/>
      ))}
    </svg>
  );
}

/* ══════════════════════════════ BODY LEGEND ══════════════════════════════ */
function BodyLegend({sel}:{sel:BPart|null}){
  const s2={healthy:'Healthy',warn:'Warning',moderate:'Moderate',critical:'Critical'} as const;
  const s2c:Record<Sev,string>={healthy:'#38B88A',warn:'#D4A020',moderate:'#D07020',critical:'#C83030'};
  return(
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        {(['healthy','warn','moderate','critical'] as Sev[]).map(sv=>(
          <div key={sv} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:9,background:`${s2c[sv]}10`,border:`1px solid ${s2c[sv]}28`}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:s2c[sv]}}/>
            <span style={{fontSize:9,fontWeight:700,color:'var(--text-muted)'}}>{s2[sv]}</span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {sel
          ?<motion.div key={sel.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{padding:'11px 13px',borderRadius:13,background:`${s2c[sel.sev]}0e`,border:`1.5px solid ${s2c[sel.sev]}35`}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:s2c[sel.sev]}}/>
                <span style={{fontSize:13,fontWeight:800,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif'}}>{sel.label}</span>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:s2c[sel.sev],marginBottom:3}}>{sel.condition}</div>
              <div style={{fontSize:10,color:'var(--text-muted)',lineHeight:1.5}}>📋 {sel.report}</div>
            </motion.div>
          :<div style={{padding:'11px 13px',borderRadius:13,background:'var(--accent-surface)',border:'1px solid var(--border-color)',textAlign:'center',fontSize:10,color:'var(--text-muted)'}}>
              Hover a muscle group for details
            </div>
        }
      </AnimatePresence>
    </div>
  );
}

/* ═════════════════ ECG ═════════════════ */
function ECGLine({color='#ef4444'}:{color?:string}){
  return <svg width="86" height="20" viewBox="0 0 86 20" style={{opacity:.85}}>
    <path d="M0,10 L10,10 L15,3 L20,17 L25,10 L32,10 L38,10 L43,5 L48,15 L53,10 L62,10 L68,4 L74,16 L80,10 L86,10"
      fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="300" strokeDashoffset="300"
      style={{filter:`drop-shadow(0 0 2px ${color})`,animation:'mhEcg 2s linear infinite'}}/>
  </svg>;
}

/* ═════════════════ CHART TOOLTIP ═════════════════ */
const CTip=({active,payload,label}:any)=>{
  if(!active||!payload?.length) return null;
  return <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:10,padding:'8px 11px',boxShadow:'var(--shadow-lg)'}}>
    <div style={{fontSize:9,color:'var(--text-muted)',marginBottom:4,fontWeight:700}}>{label}</div>
    {payload.map((p:any)=><div key={p.name} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,marginBottom:2}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:p.color}}/>
      <span style={{color:'var(--text-muted)',fontWeight:400}}>{p.name}:</span>
      <span style={{color:p.color}}>{p.value}</span>
    </div>)}
  </div>;
};

/* shared chart data */
const bpData=[{d:'Apr 8',s:118,di:75},{d:'Apr 9',s:120,di:76},{d:'Apr 10',s:124,di:79},{d:'Apr 11',s:128,di:82},{d:'Apr 12',s:132,di:84},{d:'Apr 13',s:129,di:83},{d:'Apr 14',s:128,di:82}];
const hrData=[{d:'6am',v:66},{d:'8am',v:72},{d:'10am',v:78},{d:'12pm',v:82},{d:'2pm',v:76},{d:'4pm',v:74},{d:'6pm',v:71},{d:'8pm',v:70}];
const sgData=[{d:'Mon',f:88,p:122},{d:'Tue',f:92,p:118},{d:'Wed',f:95,p:130},{d:'Thu',f:90,p:125},{d:'Fri',f:87,p:119},{d:'Sat',f:93,p:128},{d:'Sun',f:95,p:132}];
const organInfo:Record<string,any>={
  Head:    {icon:'🧠',status:'Moderate — Migraine',     sc:'#f97316',notes:'2–3×/month. Sumatriptan 50mg.',history:'Since 2022. EEG normal.',    reports:[{t:'MRI Brain',d:'Feb 5 2026',tag:'Neurology'},{t:'EEG',d:'Nov 2025',tag:'Neurology'}]},
  Heart:   {icon:'🫀',status:'Critical — Hypertension', sc:'#ef4444',notes:'BP 125–132/80–84. Amlodipine 5mg.',history:'Dx Jan 2025.',             reports:[{t:'ECG',d:'Mar 28 2026',tag:'Cardiology'},{t:'Echo',d:'Jan 15 2026',tag:'Cardiology'}]},
  Lungs:   {icon:'🫁',status:'Healthy',                 sc:'#10b981',notes:'SpO₂ 97–99%.',history:'Non-smoker.',                                   reports:[{t:'Chest X-Ray',d:'Mar 28 2026',tag:'Radiology'}]},
  Eyes:    {icon:'👁',status:'Mild — Digital Strain',   sc:'#f59e0b',notes:'6/6 vision.',history:'First exam Dec 2024.',                            reports:[{t:'Eye Exam',d:'Mar 15 2026',tag:'Ophthalmology'}]},
  Kidneys: {icon:'🫘',status:'Healthy',                 sc:'#10b981',notes:'Creatinine 0.9.',history:'No stones.',                                   reports:[{t:'KFT',d:'Apr 10 2026',tag:'Biochem'}]},
};
const medTimeline=[
  {id:'t1',date:'Apr 10 2026',type:'Blood Test',icon:'🧪',doctor:'Dr. R. Mehta',hospital:'Amrit Sparsh Lab',color:'#10b981',note:'CBC + Lipid — All normal.',has:true},
  {id:'t2',date:'Mar 28 2026',type:'Cardiology',icon:'🫀',doctor:'Dr. Priya Sharma',hospital:'Amrit Heart Care',color:'#ef4444',note:'BP management follow-up.',has:true},
  {id:'t3',date:'Mar 15 2026',type:'Eye Checkup',icon:'👁',doctor:'Dr. S. Gupta',hospital:'City Eye Clinic',color:'#06b6d4',note:'Vision 6/6. Digital strain noted.',has:false},
  {id:'t4',date:'Feb 22 2026',type:'Neurology',icon:'🧠',doctor:'Dr. A. Verma',hospital:'Amrit Neuro Centre',color:'#8b5cf6',note:'Migraine — sumatriptan prescribed.',has:true},
];
const pastA=[{id:'p1',doc:'Dr. R. Mehta',spec:'Pathology',date:'Apr 10 2026',emoji:'🧪',color:'#10b981'},{id:'p2',doc:'Dr. P. Sharma',spec:'Cardiology',date:'Mar 28 2026',emoji:'🫀',color:'#ef4444'},{id:'p3',doc:'Dr. A. Verma',spec:'Neurology',date:'Feb 22 2026',emoji:'🧠',color:'#8b5cf6'}];
const nextA=[{id:'n1',doc:'Dr. Priya Sharma',spec:'Cardiology',date:'Apr 15 2026',time:'10:00 AM',emoji:'👩‍⚕️',color:'#10b981',status:'confirmed'},{id:'n2',doc:'Dr. K. Sinha',spec:'Neurology',date:'Apr 22 2026',time:'2:00 PM',emoji:'🧠',color:'#8b5cf6',status:'scheduled'},{id:'n3',doc:'Annual Checkup',spec:'Full Screen',date:'Apr 28 2026',time:'7:30 AM',emoji:'🏥',color:'#06b6d4',status:'scheduled'}];
const aiInsights=[{icon:'🫀',color:'#ef4444',bg:'rgba(239,68,68,.07)',title:'BP Rising',desc:'Systolic elevated 5 days. Reduce sodium.'},{icon:'😴',color:'#8b5cf6',bg:'rgba(139,92,246,.07)',title:'Sleep Deficit',desc:'~8h deficit this week. Consistent schedule.'},{icon:'🧠',color:'#f97316',bg:'rgba(249,115,22,.07)',title:'Migraine Risk',desc:'Weather + sleep: high risk. Sumatriptan.'},{icon:'✅',color:'#10b981',bg:'rgba(16,185,129,.07)',title:'SpO₂ Optimal',desc:'98% — excellent respiratory health!'}];

/* ══════════════════ RIGHT SIDE PANELS ══════════════════ */
function HealthCard({user}:{user:any}){
  const vitals=[{icon:'🩸',label:'Blood Pressure',value:'128/82',unit:'mmHg',color:'#ef4444',status:'Elevated',sc:'#ef4444'},{icon:'❤️',label:'Heart Rate',value:'78',unit:'bpm',color:'#f43f5e',status:'Normal',sc:'#10b981'},{icon:'🍬',label:'Blood Sugar',value:'95',unit:'mg/dL',color:'#f97316',status:'Normal',sc:'#10b981'},{icon:'💧',label:'SpO₂',value:'98',unit:'%',color:'#06b6d4',status:'Excellent',sc:'#10b981'}];
  const diseases:string[]=user?.diseases?.length?user.diseases:['Hypertension','Migraine'];
  const dc=['#ef4444','#f97316','#8b5cf6','#06b6d4'];
  return(
    <div className="mh-card" style={{padding:'19px 21px'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3.5,background:'linear-gradient(90deg,#8B5E3C,#c8955e,#8B5E3C)',borderRadius:'22px 22px 0 0'}}/>
      <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:15}}>
        <div style={{width:50,height:50,borderRadius:'50%',overflow:'hidden',border:'2.5px solid rgba(139,94,60,.3)',flexShrink:0}}>
          <img src="/founder.jpeg" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}
            onError={e=>{(e.target as HTMLImageElement).style.display='none';(e.target as any).parentElement.style.background='#8B5E3C';(e.target as any).parentElement.innerHTML=`<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff'>A</div>`;}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:900,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif',letterSpacing:'-.02em'}}>{user?.name||'Ajay Kumar Sharma'}</div>
          <div style={{display:'flex',gap:9,marginTop:3,flexWrap:'wrap'}}>
            {[{k:'Age',v:user?.age||'32 yrs'},{k:'Blood',v:user?.bloodGroup||'O+'},{k:'Gender',v:'Male'}].map(c=>(
              <div key={c.k} style={{display:'flex',gap:3}}><span style={{fontSize:9,color:'var(--text-muted)'}}>{c.k}:</span><span style={{fontSize:10,fontWeight:700,color:'var(--text-primary)'}}>{c.v}</span></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'7px 11px',borderRadius:12,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',animation:'mhWear 2.5s ease-in-out infinite'}}>
          <span style={{fontSize:15}}>⌚</span>
          <div style={{fontSize:8,fontWeight:800,color:'#10b981',textTransform:'uppercase'}}>Live</div>
          <div style={{width:30,height:3,borderRadius:2,background:'rgba(16,185,129,.18)',overflow:'hidden'}}>
            <motion.div style={{height:'100%',background:'#10b981',borderRadius:2}} animate={{width:['0%','100%']}} transition={{duration:2.2,repeat:Infinity}}/>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        {vitals.map(v=>(
          <motion.div key={v.label} whileHover={{scale:1.02,y:-2}}
            style={{padding:'10px 12px',borderRadius:13,background:`linear-gradient(135deg,${v.color}0b,var(--accent-surface))`,border:`1px solid ${v.color}1c`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:15}}>{v.icon}</span>
              <div style={{fontSize:8,fontWeight:700,padding:'2px 6px',borderRadius:20,background:`${v.sc}18`,color:v.sc,border:`1px solid ${v.sc}22`}}>{v.status}</div>
            </div>
            <div style={{display:'flex',alignItems:'baseline',gap:3}}>
              <span style={{fontSize:19,fontWeight:900,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif',lineHeight:1}}>{v.value}</span>
              <span style={{fontSize:9,color:'var(--text-muted)'}}>{v.unit}</span>
            </div>
            <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{v.label}</div>
          </motion.div>
        ))}
      </div>
      <div style={{fontSize:9,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:7}}>Active Conditions</div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {diseases.map((d:string,i:number)=>{const c=dc[i%dc.length];return(<div key={d} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',borderRadius:30,background:`${c}10`,border:`1px solid ${c}24`,fontSize:11,fontWeight:700,color:c}}><div style={{width:5,height:5,borderRadius:'50%',background:c}}/>{d}</div>);})}
      </div>
    </div>
  );
}
function AIInsights(){
  return(
    <div className="mh-card" style={{padding:'16px 18px'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#6366f1,#8b5cf6)',borderRadius:'22px 22px 0 0'}}/>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{width:30,height:30,borderRadius:9,background:'rgba(99,102,241,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
        <div style={{fontSize:12,fontWeight:800,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif'}}>AI Health Insights</div>
        <div style={{marginLeft:'auto',padding:'2px 9px',borderRadius:20,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',fontSize:9,fontWeight:700,color:'#6366f1'}}>4 Alerts</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {aiInsights.map((ins,i)=>(
          <motion.div key={i} whileHover={{scale:1.02,y:-2}} style={{padding:'10px 11px',borderRadius:12,background:ins.bg,border:`1.5px solid ${ins.color}1e`,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <div style={{width:24,height:24,borderRadius:7,background:`${ins.color}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>{ins.icon}</div>
              <div style={{fontSize:10,fontWeight:800,color:'var(--text-primary)',lineHeight:1.2}}>{ins.title}</div>
            </div>
            <div style={{fontSize:9,color:'var(--text-muted)',lineHeight:1.55}}>{ins.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
function Trends(){
  return(
    <div>
      <div className="mh-lbl">Health Trends</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        {[
          {title:'Blood Pressure',val:'128/82',unit:'mmHg',color:'#ef4444',data:bpData,type:'line',keys:[{k:'s',n:'Systolic',c:'#ef4444'},{k:'di',n:'Diastolic',c:'#f97316'}],dom:[60,145]},
          {title:'Heart Rate',val:'78',unit:'BPM',color:'#f43f5e',data:hrData,type:'area',keys:[{k:'v',n:'BPM',c:'#f43f5e'}],dom:[55,95]},
          {title:'Blood Sugar',val:'95',unit:'mg/dL',color:'#f97316',data:sgData,type:'area',keys:[{k:'f',n:'Fasting',c:'#f97316'},{k:'p',n:'Post',c:'#fbbf24'}],dom:[70,160]},
        ].map(ch=>(
          <div key={ch.title} className="mh-card" style={{padding:'13px'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${ch.color},${ch.color}77)`,borderRadius:'22px 22px 0 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:9}}>
              <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{ch.title}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:15,fontWeight:900,color:ch.color,fontFamily:'Space Grotesk,sans-serif',lineHeight:1}}>{ch.val}</div><div style={{fontSize:8,color:'var(--text-muted)'}}>{ch.unit}</div></div>
            </div>
            <ResponsiveContainer width="100%" height={82}>
              {ch.type==='line'
                ?<LineChart data={ch.data} margin={{top:2,right:2,left:-34,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.4}/>
                    <XAxis dataKey="d" tick={{fontSize:8,fill:'var(--text-muted)'}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'var(--text-muted)'}} tickLine={false} axisLine={false} domain={ch.dom}/>
                    <Tooltip content={<CTip/>}/>
                    {ch.keys.map(k=><Line key={k.k} type="monotone" dataKey={k.k} name={k.n} stroke={k.c} strokeWidth={2} dot={{r:2,fill:k.c}} activeDot={{r:4}}/>)}
                  </LineChart>
                :<AreaChart data={ch.data} margin={{top:2,right:2,left:-34,bottom:0}}>
                    <defs>{ch.keys.map(k=><linearGradient key={k.k} id={`g${k.k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.c} stopOpacity=".22"/><stop offset="100%" stopColor={k.c} stopOpacity="0"/></linearGradient>)}</defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.4}/>
                    <XAxis dataKey="d" tick={{fontSize:8,fill:'var(--text-muted)'}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fontSize:8,fill:'var(--text-muted)'}} tickLine={false} axisLine={false} domain={ch.dom}/>
                    <Tooltip content={<CTip/>}/>
                    {ch.keys.map(k=><Area key={k.k} type="monotone" dataKey={k.k} name={k.n} stroke={k.c} strokeWidth={2} fill={`url(#g${k.k})`} dot={false} activeDot={{r:4}}/>)}
                  </AreaChart>
              }
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
function OrganExplorer(){
  const [sel,setSel]=useState('Heart');const organs=Object.keys(organInfo);const d=organInfo[sel];
  return(
    <div className="mh-card" style={{padding:'16px 18px'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#8b5cf6,#6366f1)',borderRadius:'22px 22px 0 0'}}/>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{width:30,height:30,borderRadius:9,background:'rgba(139,92,246,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🔬</div>
        <div style={{fontSize:12,fontWeight:800,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif'}}>Organ-wise Explorer</div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
        {organs.map(o=>{const act=o===sel;const c=organInfo[o].sc;return(<motion.button key={o} whileHover={{scale:1.04}} whileTap={{scale:.97}} onClick={()=>setSel(o)}
          style={{padding:'4px 12px',borderRadius:30,border:`1.5px solid ${act?c:'var(--border-color)'}`,background:act?`${c}12`:'transparent',color:act?c:'var(--text-muted)',fontSize:10,fontWeight:700,cursor:'pointer',transition:'all .18s',display:'flex',alignItems:'center',gap:3}}>
          {organInfo[o].icon} {o}</motion.button>);})}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sel} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.18}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{padding:'10px 12px',borderRadius:12,background:`${d.sc}0b`,border:`1.5px solid ${d.sc}22`}}>
                <div style={{fontSize:8,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Status</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:6,height:6,borderRadius:'50%',background:d.sc}}/><div style={{fontSize:12,fontWeight:800,color:d.sc}}>{d.status}</div></div>
              </div>
              <div style={{padding:'10px 12px',borderRadius:12,background:'var(--accent-surface)',border:'1px solid var(--border-color)'}}><div style={{fontSize:8,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Doctor Notes</div><div style={{fontSize:9,color:'var(--text-secondary)',lineHeight:1.6}}>{d.notes}</div></div>
              <div style={{padding:'9px 12px',borderRadius:12,background:'var(--bg-card)',border:'1px solid var(--border-color)'}}><div style={{fontSize:8,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>History</div><div style={{fontSize:9,color:'var(--text-muted)',lineHeight:1.5}}>{d.history}</div></div>
            </div>
            <div>
              <div style={{fontSize:8,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Reports & Scans</div>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {d.reports.length===0?<div style={{padding:'18px',borderRadius:12,background:'var(--accent-surface)',border:'1px solid var(--border-color)',textAlign:'center',color:'var(--text-muted)',fontSize:10}}>No reports</div>
                  :d.reports.map((r:any,i:number)=>(
                    <motion.div key={i} whileHover={{x:3}} style={{padding:'9px 12px',borderRadius:12,background:'var(--bg-card)',border:'1px solid var(--border-color)',display:'flex',alignItems:'center',gap:9,cursor:'pointer',transition:'all .18s'}}>
                      <div style={{width:34,height:34,borderRadius:9,background:`${d.sc}0d`,border:`1px solid ${d.sc}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{d.icon}</div>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{r.t}</div><div style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>{r.tag} · {r.d}</div></div>
                      <div style={{fontSize:9,fontWeight:700,color:d.sc,padding:'2px 7px',borderRadius:7,background:`${d.sc}0d`,border:`1px solid ${d.sc}1e`}}>View</div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
function Appts(){
  return(
    <div>
      <div className="mh-lbl">Appointments</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div className="mh-card" style={{padding:'14px 16px'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#64748b,#94a3b8)',borderRadius:'22px 22px 0 0'}}/>
          <div style={{fontSize:9,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Past Appointments</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {pastA.map((a,i)=>(<motion.div key={a.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:.06*i}} whileHover={{x:3}}
              style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:12,background:'var(--accent-surface)',border:'1px solid var(--border-color)'}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${a.color}0e`,border:`1.5px solid ${a.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{a.emoji}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{a.doc}</div><div style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>{a.spec} · {a.date}</div></div>
              <div style={{padding:'2px 8px',borderRadius:20,background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.2)',fontSize:8,fontWeight:700,color:'#10b981'}}>✓ Done</div>
            </motion.div>))}
          </div>
        </div>
        <div className="mh-card" style={{padding:'14px 16px'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#10b981,#06b6d4)',borderRadius:'22px 22px 0 0'}}/>
          <div style={{fontSize:9,fontWeight:800,color:'var(--text-muted)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Upcoming Appointments</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {nextA.map((a,i)=>(<motion.div key={a.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:.06*i}} whileHover={{x:-3}}
              style={{display:'flex',alignItems:'center',gap:9,padding:'9px 11px',borderRadius:12,background:`${a.color}07`,border:`1px solid ${a.color}1e`}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${a.color}10`,border:`1.5px solid ${a.color}24`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{a.emoji}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{a.doc}</div><div style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>{a.spec} · {a.date} · {a.time}</div></div>
              <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                <div style={{fontSize:8,fontWeight:700,color:a.color,padding:'2px 7px',borderRadius:20,background:`${a.color}14`,border:`1px solid ${a.color}28`,whiteSpace:'nowrap'}}>{a.status==='confirmed'?'✅ Confirmed':'📅 Sched.'}</div>
                <motion.button whileHover={{scale:1.06}} whileTap={{scale:.95}} style={{fontSize:8,fontWeight:800,padding:'3px 8px',borderRadius:7,background:'linear-gradient(135deg,#06b6d4,#0284c7)',color:'white',border:'none',cursor:'pointer',boxShadow:'0 2px 8px rgba(6,182,212,.3)',whiteSpace:'nowrap'}}>📹 Join</motion.button>
              </div>
            </motion.div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
function Timeline(){
  return(
    <div>
      <div className="mh-lbl">Medical History</div>
      <div style={{position:'relative'}}>
        <div style={{position:'absolute',left:16,top:0,bottom:0,width:2,background:'var(--border-color)',borderRadius:2}}/>
        {medTimeline.map((item,i)=>(
          <motion.div key={item.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:.06*i}} style={{display:'flex',gap:12,paddingBottom:12,position:'relative'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:`${item.color}14`,border:`2px solid ${item.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,boxShadow:`0 0 8px ${item.color}28`,zIndex:1}}>{item.icon}</div>
            <motion.div whileHover={{x:4}} style={{flex:1,background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:13,padding:'8px 13px',transition:'all .18s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:3}}>
                <div><div style={{fontSize:11,fontWeight:700,color:'var(--text-primary)'}}>{item.type}</div><div style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>{item.doctor} · {item.hospital}</div></div>
                <div style={{display:'flex',gap:5,alignItems:'center',flexShrink:0}}>
                  <div style={{fontSize:9,color:'var(--text-muted)'}}>{item.date}</div>
                  {item.has&&<motion.button whileHover={{scale:1.06}} whileTap={{scale:.95}} style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:7,background:`${item.color}10`,color:item.color,border:`1px solid ${item.color}24`,cursor:'pointer'}}>📄 View</motion.button>}
                </div>
              </div>
              <div style={{fontSize:9,color:'var(--text-muted)',lineHeight:1.5}}>{item.note}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════ MAIN ══════════════════════════════════ */
export default function MyHealthModule(){
  const {user,theme,setTheme}=useAppStore();
  const [view,setView]=useState<'front'|'back'>('front');
  const [tip,setTip]=useState<TipState|null>(null);
  const [sel,setSel]=useState<BPart|null>(null);
  const [sos,setSos]=useState(false);

  const handleHover=(part:BPart,e:React.MouseEvent)=>{setTip({part,x:e.clientX,y:e.clientY});setSel(part);};
  const handleLeave=()=>setTip(null);

  return(
    <>
      <style>{MH_CSS}</style>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',flexDirection:'column',gap:16}}>

        {/* TOP BAR */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif',letterSpacing:'-.03em',lineHeight:1}}>My Health — Body Map</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>3D anatomical muscle diagram · <strong style={{color:'var(--text-primary)'}}>Ajay Kumar Sharma</strong></div>
          </div>
          <div style={{display:'flex',gap:9,alignItems:'center'}}>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:.96}} onClick={()=>setTheme(theme==='dark'?'light':'dark')}
              style={{padding:'7px 14px',borderRadius:30,border:'1px solid var(--border-color)',background:'var(--bg-card)',color:'var(--text-primary)',fontWeight:700,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5,boxShadow:'var(--shadow-xs)'}}>
              {theme==='dark'?'☀️ Light':'🌙 Dark'}
            </motion.button>
            <motion.button whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>setSos(p=>!p)}
              style={{padding:'8px 16px',borderRadius:30,border:'none',background:sos?'rgba(224,60,60,.9)':'linear-gradient(135deg,#ef4444,#b91c1c)',color:'white',fontWeight:800,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:6,animation:sos?'mhSos 1.8s infinite':'none',boxShadow:'0 4px 14px rgba(239,68,68,.35)'}}>
              🆘 SOS Emergency
            </motion.button>
          </div>
        </div>

        {/* MAIN SPLIT */}
        <div style={{display:'grid',gridTemplateColumns:'295px 1fr',gap:16,alignItems:'start'}}>

          {/* ════ LEFT — ANATOMY PANEL ════ */}
          <div style={{position:'sticky',top:16}}>
            <div className="mh-card" style={{padding:'16px 12px',display:'flex',flexDirection:'column',alignItems:'center',gap:12,background:'var(--bg-card)'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3.5,background:'linear-gradient(90deg,#4E7890,#7AAAC4,#4E7890)',borderRadius:'22px 22px 0 0'}}/>

              <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif'}}>3D Muscle Map</div>
                  <div style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>Hover muscle groups · Front &amp; Back</div>
                </div>
                <ECGLine color="#D44040"/>
              </div>

              {/* Toggle */}
              <div style={{display:'flex',gap:5,background:'var(--accent-surface)',padding:3,borderRadius:30,border:'1px solid var(--border-color)'}}>
                <button className={`mh-vbtn ${view==='front'?'act':''}`} onClick={()=>setView('front')}>▶ Front</button>
                <button className={`mh-vbtn ${view==='back'?'act':''}`}  onClick={()=>setView('back')}>◀ Back</button>
              </div>

              {/* SVG body */}
              <div style={{lineHeight:0}}>
                <AnimatePresence mode="wait">
                  {view==='front'
                    ?<motion.div key="f" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}} transition={{duration:.22}}>
                       <FrontBodySVG parts={FRONT} onHover={handleHover} onLeave={handleLeave}/>
                     </motion.div>
                    :<motion.div key="b" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}} transition={{duration:.22}}>
                       <BackBodySVG parts={BACK} onHover={handleHover} onLeave={handleLeave}/>
                     </motion.div>
                  }
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div style={{width:'100%'}}><BodyLegend sel={sel}/></div>
            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}><HealthCard user={user}/></motion.div>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.07}}><AIInsights/></motion.div>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.13}}><Trends/></motion.div>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.18}}><OrganExplorer/></motion.div>
          </div>
        </div>

        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.23}}><Appts/></motion.div>
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.27}}><Timeline/></motion.div>
      </motion.div>

      {/* TOOLTIP */}
      <AnimatePresence>
        {tip&&(
          <motion.div className="mh-tip" initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.9}} style={{left:tip.x+14,top:tip.y-10}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:SEV_COLOR[tip.part.sev],flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:800,color:'var(--text-primary)',fontFamily:'Space Grotesk,sans-serif'}}>{tip.part.label}</span>
            </div>
            <div style={{fontSize:11,fontWeight:600,color:SEV_COLOR[tip.part.sev],marginBottom:3}}>{tip.part.condition}</div>
            <div style={{fontSize:10,color:'var(--text-muted)',lineHeight:1.5}}>📋 {tip.part.report}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
