'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Upload, MessageCircle, Send, Loader, CheckCircle, AlertTriangle, TrendingUp, FileText } from 'lucide-react';

type Message = { role: 'user' | 'ai'; content: string };

const symptomResponses: Record<string, { diagnosis: string; risk: string; advice: string; color: string }> = {
  headache: {
    diagnosis: 'Tension Headache / Possible Migraine',
    risk: 'Low–Medium',
    advice: 'Rest in a dark room, stay hydrated, take paracetamol if severe. If pain is sudden and severe ("thunderclap"), seek emergency care immediately.',
    color: '#f59e0b',
  },
  fever: {
    diagnosis: 'Viral / Bacterial Infection suspected',
    risk: 'Medium',
    advice: 'Monitor temperature every 2 hours. Take paracetamol for fever >38.5°C. If fever >39.5°C or lasts >3 days, see a doctor urgently. With MDR alerts in your area, malaria/dengue testing recommended.',
    color: '#ef4444',
  },
  cough: {
    diagnosis: 'Upper Respiratory Infection / possible Bronchitis',
    risk: 'Medium — MDR-TB Area Alert',
    advice: '⚠️ Given active MDR-TB alerts in your area, persistent cough >2 weeks requires immediate TB screening. Sputum test recommended. Avoid crowded areas.',
    color: '#ef4444',
  },
  chest: {
    diagnosis: 'Possible Cardiac Event / Angina',
    risk: 'HIGH — Seek Immediate Care',
    advice: '🚨 Chest pain is a medical emergency. Call 112 immediately. Do NOT drive yourself. Sit down and rest. If prescribed, take nitroglycerin. I am sending your location to nearest cardiac center.',
    color: '#dc2626',
  },
};

const reportResults = {
  CBC: [
    { test: 'Hemoglobin', value: '13.2 g/dL', normal: '13.5–17.5', status: 'low', interpretation: 'Slightly below normal — possible mild anemia' },
    { test: 'WBC Count', value: '7,800 /µL', normal: '4,500–11,000', status: 'normal', interpretation: 'Normal — no infection markers' },
    { test: 'Platelet Count', value: '245,000 /µL', normal: '150,000–400,000', status: 'normal', interpretation: 'Normal range' },
    { test: 'RBC', value: '4.8 M/µL', normal: '4.7–6.1', status: 'normal', interpretation: 'Normal' },
  ],
};

export default function AIDoctorModule() {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'ai', content: '🏥 Hello! I\'m your AI Medical Assistant. Describe your symptoms and I\'ll provide an initial assessment. Remember, this is not a replacement for professional medical advice.\n\nTry typing: "I have a headache", "fever", "cough", or "chest pain"' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'report' | 'predict'>('chat');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportAnalyzed, setReportAnalyzed] = useState(false);
  const [riskScore] = useState(32);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const key = Object.keys(symptomResponses).find(k => userMsg.includes(k));
      if (key) {
        const r = symptomResponses[key];
        const response = `**AI Assessment: ${r.diagnosis}**\n\n⚠️ Risk Level: ${r.risk}\n\n📋 Advice:\n${r.advice}\n\n💡 Based on your ABHA health records and current location alerts, I recommend scheduling a consultation. Shall I book one for you?`;
        setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', content: `Based on your description and health profile, I'm analyzing... 🔍\n\nFor more accurate assessment, please describe:\n• Duration of symptoms\n• Severity (1–10)\n• Any associated symptoms\n• Recent travel history\n\nYour current vitals: HR 72bpm ✅ | BP 128/82 ⚠️ | Temp 36.8°C ✅` }]);
      }
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = () => {
    setUploadedFile('CBC_Report_March_2024.pdf');
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setReportAnalyzed(true); }, 2500);
  };

  const predictions = [
    { condition: 'Type 2 Diabetes', risk: 18, timeframe: '5 years', factors: ['BMI 22.4 ✅', 'Family history: None ✅', 'Blood sugar: 95 ✅'], color: '#10b981' },
    { condition: 'Hypertension Complications', risk: 42, timeframe: '2 years', factors: ['BP trending up ⚠️', 'Age 22 ✅', 'Stress: High ⚠️'], color: '#f59e0b' },
    { condition: 'Anemia', risk: 35, timeframe: '6 months', factors: ['Hgb slightly low ⚠️', 'Diet: Vegetarian', 'Iron intake: Low ⚠️'], color: '#f59e0b' },
    { condition: 'Cardiac Event', risk: 8, timeframe: '10 years', factors: ['No smoking ✅', 'Active lifestyle ✅', 'BP concern ⚠️'], color: '#10b981' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)', borderRadius: 24, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
          🤖 AI Medical Intelligence
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          Symptom checker, report analyzer, disease prediction — powered by clinical AI
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'chat', label: '💬 Symptom Checker', icon: MessageCircle },
          { id: 'report', label: '📋 Report Analyzer', icon: FileText },
          { id: 'predict', label: '🔮 Disease Prediction', icon: TrendingUp },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${activeTab === tab.id ? 'transparent' : 'var(--border-color)'}`,
              borderRadius: 12, padding: '10px 20px', cursor: 'pointer',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Symptom Checker */}
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card" style={{ padding: 0, overflow: 'hidden', height: 560, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} color="#8b5cf6" /> AI Symptom Analyzer
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>⚕️ For informational purposes only — not a substitute for medical advice</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px', fontSize: 13, lineHeight: 1.6,
                    border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-line',
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 16, width: 'fit-content', border: '1px solid var(--border-color)' }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, background: '#8b5cf6', borderRadius: '50%', display: 'block' }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Describe your symptoms..."
                style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
              <button onClick={sendMessage} style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', color: 'white' }}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'report' && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!uploadedFile ? (
              <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={36} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Upload Medical Report</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Supports PDF, JPG, PNG — Blood test, X-ray, ECG, MRI reports</div>
                </div>
                <button onClick={handleFileUpload}
                  style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 12, padding: '12px 32px', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 14 }}>
                  Upload Report (Demo)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{uploadedFile}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CBC Blood Test Report • March 2024</div>
                  </div>
                  {analyzing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: 13 }}>
                      <Loader size={16} className="animate-spin" /> Analyzing...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={16} /> Analysis Complete
                    </div>
                  )}
                </div>
                {reportAnalyzed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>📋 AI Report Analysis — CBC</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {reportResults.CBC.map((row) => (
                          <div key={row.test} style={{
                            background: 'var(--bg-glass)', border: `1px solid ${row.status === 'low' ? '#ef444440' : '#10b98140'}`,
                            borderRadius: 10, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr', gap: 12, alignItems: 'center',
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.test}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: row.status === 'low' ? '#ef4444' : '#10b981' }}>{row.value}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Normal: {row.normal}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{row.interpretation}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
                        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <strong>AI Summary:</strong> Hemoglobin is slightly below normal range, suggesting mild iron deficiency anemia. All other CBC parameters are within normal range. Recommend iron-rich diet and follow-up in 3 months.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'predict' && (
          <motion.div key="predict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🔮 AI Disease Risk Prediction</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Based on your health profile, vitals history, ABHA records and genetic indicators</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {predictions.map((p) => (
                  <div key={p.condition} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{p.condition}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, color: p.color }}>{p.risk}%</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>risk in {p.timeframe}</span>
                      </div>
                    </div>
                    <div className="health-progress-track" style={{ marginBottom: 12 }}>
                      <motion.div className="health-progress-fill"
                        initial={{ width: 0 }} animate={{ width: `${p.risk}%` }}
                        transition={{ delay: 0.3, duration: 1.2 }}
                        style={{ background: p.color }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {p.factors.map((f) => (
                        <span key={f} style={{ background: 'var(--border-color)', borderRadius: 999, padding: '3px 10px', fontSize: 11, color: 'var(--text-secondary)' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
