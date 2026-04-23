'use client';

import { MedicalProfile, SOSEvent } from './emergencyData';

// Dynamic import to avoid SSR issues
let jsPDFModule: typeof import('jspdf') | null = null;

async function getJsPDF() {
  if (!jsPDFModule) {
    jsPDFModule = await import('jspdf');
  }
  return jsPDFModule.jsPDF;
}

function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function uniqueId(): string {
  return `AS-ER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ── Colour palette ────────────────────────────────────────────────────────────
const RED    = [220, 38, 38]  as [number, number, number];
const DARK   = [15,  23, 42]  as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];
const GRAY   = [100, 116, 139] as [number, number, number];
const LIGHT  = [241, 245, 249] as [number, number, number];
const GREEN  = [16, 185, 129]  as [number, number, number];
const ORANGE = [245, 158, 11]  as [number, number, number];

export async function generateEmergencyPDF(
  profile: MedicalProfile,
  sosEvent?: Partial<SOSEvent>
): Promise<Blob> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const docId = uniqueId();
  const now = new Date();

  // ── HEADER ────────────────────────────────────────────────────────────────
  // Red banner
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 42, 'F');

  // Logo area (circle)
  doc.setFillColor(...WHITE);
  doc.circle(18, 21, 10, 'F');
  doc.setTextColor(...RED);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AS', 18, 24.5, { align: 'center' });

  // App title
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Amrit Sparsh', 33, 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Emergency Medical Report', 33, 24);

  // Emergency badge top-right
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(W - 52, 8, 46, 12, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('🚨 EMERGENCY DOCUMENT', W - 29, 16.5, { align: 'center' });

  // Subtitle strip
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDateTime(now)}   |   Doc ID: ${docId}`, W / 2, 35, { align: 'center' });

  let y = 50;

  // ── PATIENT IDENTITY CARD ─────────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y - 4, W - 28, 42, 3, 3, 'F');
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y - 4, W - 28, 42, 3, 3, 'S');

  // Avatar placeholder
  doc.setFillColor(...RED);
  doc.circle(27, y + 15, 10, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.patientName.charAt(0), 27, 19, { align: 'center' });

  // Patient info
  doc.setTextColor(...DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.patientName, 41, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Age: ${profile.age} yrs  |  Gender: ${profile.gender}  |  Phone: ${profile.phone}`, 41, y + 16);
  doc.text(`Address: ${profile.address}`, 41, y + 23);
  doc.text(`ABHA ID: ${profile.abhaId}`, 41, y + 30);

  // Blood group badge
  doc.setFillColor(...RED);
  doc.roundedRect(W - 38, y + 4, 24, 22, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.bloodGroup, W - 26, y + 14, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Blood Group', W - 26, y + 21, { align: 'center' });

  y += 50;

  // ── SOS EVENT INFO (if provided) ──────────────────────────────────────────
  if (sosEvent) {
    doc.setFillColor(255, 237, 213);
    doc.roundedRect(14, y, W - 28, 22, 2, 2, 'F');
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, W - 28, 22, 2, 2, 'S');

    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('🚨 SOS ACTIVATION DETAILS', 20, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(`Emergency Type: ${sosEvent.emergencyType || 'Not specified'}`, 20, y + 15);
    if (sosEvent.location) {
      doc.text(`Location: ${sosEvent.location.address || `${sosEvent.location.lat}, ${sosEvent.location.lng}`}`, 100, y + 15);
    }
    if (sosEvent.hospitalAlerted) {
      doc.text(`Hospital Alerted: ${sosEvent.hospitalAlerted}`, 20, y + 20);
    }
    y += 30;
  }

  // Helper: section header
  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(...DARK);
    doc.rect(14, yPos, W - 28, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 18, yPos + 5.5);
    return yPos + 14;
  };

  // Helper: info row
  const infoRow = (label: string, value: string, yPos: number, col: number = 0) => {
    const xBase = col === 0 ? 18 : W / 2 + 5;
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label + ':', xBase, yPos);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(value, xBase + doc.getStringUnitWidth(label + ': ') * 8 * 0.35 + 2, yPos);
  };

  // ── ALLERGIES ─────────────────────────────────────────────────────────────
  y = sectionHeader('⚠️  Critical Allergies', y);
  if (profile.allergies.length > 0) {
    profile.allergies.forEach((allergy, i) => {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(18 + i * 42, y - 4, 38, 10, 2, 2, 'F');
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(allergy, 18 + i * 42 + 19, y + 1.5, { align: 'center' });
    });
    y += 14;
  } else {
    doc.setTextColor(...GRAY); doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    doc.text('No known allergies', 18, y); y += 10;
  }

  // ── CURRENT MEDICATIONS ───────────────────────────────────────────────────
  y = sectionHeader('💊  Current Medications', y);
  profile.currentMedications.forEach((med) => {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(16, y - 3, W - 32, 10, 2, 2, 'F');
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(med.name, 20, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.text(`${med.dosage}  —  ${med.frequency}  —  Since ${med.since}`, 70, y + 3.5);
    y += 13;
  });
  y += 4;

  // ── DISEASES / CONDITIONS ─────────────────────────────────────────────────
  y = sectionHeader('🩺  Medical Conditions', y);
  const current = profile.diseases.filter(d => d.type === 'current');
  const past    = profile.diseases.filter(d => d.type === 'past');

  const printDiseases = (list: typeof current, yP: number) => {
    list.forEach((d) => {
      const color: [number, number, number] = d.type === 'current' ? RED : GREEN;
      doc.setFillColor(color[0], color[1], color[2], 0.12);
      doc.roundedRect(16, yP - 3, W - 32, 10, 2, 2, 'F');
      doc.setTextColor(...color);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(d.type === 'current' ? '● ACTIVE' : '✓ PAST', 20, yP + 3.5);
      doc.setTextColor(...DARK);
      doc.text(d.name, 50, yP + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.setFontSize(7.5);
      doc.text(`Since ${d.since}  |  Severity: ${d.severity}`, W - 80, yP + 3.5);
      yP += 12;
    });
    return yP;
  };

  if (current.length > 0) {
    doc.setTextColor(...GRAY); doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.text('Active Conditions:', 18, y); y += 6;
    y = printDiseases(current, y);
  }
  if (past.length > 0) {
    doc.setTextColor(...GRAY); doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.text('Past Conditions:', 18, y + 2); y += 8;
    y = printDiseases(past, y);
  }
  y += 4;

  // ── Check page overflow before doctors ───────────────────────────────────
  if (y > H - 80) { doc.addPage(); y = 20; }

  // ── TREATING DOCTORS ──────────────────────────────────────────────────────
  y = sectionHeader('👨‍⚕️  Treating Doctors', y);
  profile.doctors.forEach((dr) => {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(16, y - 3, W - 32, 12, 2, 2, 'F');
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(dr.name, 20, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.text(`${dr.specialization}  —  ${dr.hospital}`, 20, y + 8.5);
    doc.setTextColor(...RED);
    doc.text(`📞 ${dr.phone}`, W - 58, y + 5.5);
    y += 16;
  });
  y += 4;

  // ── REPORTS SUMMARY ───────────────────────────────────────────────────────
  if (y > H - 80) { doc.addPage(); y = 20; }
  y = sectionHeader('📋  Medical Reports Summary', y);
  profile.reports.forEach((rep) => {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(16, y - 2, W - 32, 9, 2, 2, 'F');
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(rep.name, 20, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.text(`${rep.type}  |  Date: ${rep.date}`, 80, y + 4);
    const statusColor: [number, number, number] = rep.status === 'Normal' ? GREEN : rep.status === 'Borderline' ? ORANGE : RED;
    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(rep.status, W - 30, y + 4);
    y += 12;
  });
  y += 6;

  // ── EMERGENCY CONTACTS ────────────────────────────────────────────────────
  if (y > H - 60) { doc.addPage(); y = 20; }
  y = sectionHeader('📞  Emergency Contacts', y);
  profile.emergencyContacts.forEach((c) => {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(16, y - 2, W - 32, 9, 2, 2, 'F');
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${c.name} (${c.relation})`, 20, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...RED);
    doc.setFontSize(8);
    doc.text(`📞 ${c.phone}`, W - 60, y + 4);
    y += 12;
  });

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerY = H - 28;
  doc.setFillColor(...DARK);
  doc.rect(0, footerY, W, H - footerY, 'F');

  // Verified badge
  doc.setFillColor(...GREEN);
  doc.circle(25, footerY + 12, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('✓', 25, footerY + 15, { align: 'center' });

  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Verified by Amrit Sparsh', 38, footerY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(`Doc ID: ${docId}  |  Generated: ${formatDateTime(now)}`, 38, footerY + 17);

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text('This document is auto-generated for emergency use only. For accuracy, verify with treating physician.', W / 2, footerY + 24, { align: 'center' });

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename = 'emergency-medical-report.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
