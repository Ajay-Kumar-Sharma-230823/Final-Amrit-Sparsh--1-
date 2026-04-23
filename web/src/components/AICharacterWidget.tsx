'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';

interface Message { role: 'user' | 'ai'; content: string; }

const aiResponses: Record<string, string> = {
  'check my vitals': '📊 Your vitals: Heart Rate 72 bpm ✅ | BP 128/82 mmHg ⚠️ (slightly high) | SpO2 98% ✅ | Temp 36.8°C ✅. I recommend monitoring your BP — it has been elevated 3 days in a row.',
  'book a consultation': '📅 I found Dr. Priya Sharma (Cardiologist) with slots tomorrow at 10 AM and 2 PM. Your ABHA health records will be shared securely. Shall I book 10 AM?',
  'mdr alerts near me': '🦠 3 MDR-TB cases detected within 2 km of your location in the last 48 hours. Please wear a mask in crowded areas and avoid close contact with unknown individuals.',
  'my medications': '💊 Today: Amlodipine 5mg at 8 AM ✅ (taken) | Vitamin D3 at 2 PM ⏰ (due soon) | Omega-3 at 9 PM 🔔 (reminder set).',
  'sos': '🆘 Activating emergency mode. Your location is being shared with nearest hospitals. Emergency contacts are being notified. Stay calm — help is on the way.',
};

const quickPrompts = ['Check my vitals', 'Book a consultation', 'MDR alerts near me', 'My medications', 'SOS'];

export default function AICharacterWidget() {
  const { user, aiCharacterOpen, toggleAICharacter, aiMessages, addAIMessage } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Auto-hide greeting bubble after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = (text: string = input) => {
    if (!text.trim()) return;
    addAIMessage('user', text);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const key = text.toLowerCase();
      const match = Object.keys(aiResponses).find(k => key.includes(k));
      const response = match ? aiResponses[match]
        : `Based on your health profile, I'm analyzing "${text}"...\n\nYour health score of 78/100 is good overall. Your BP is slightly elevated — I recommend reducing sodium intake and getting adequate rest. Would you like me to book a doctor consultation?`;
      addAIMessage('ai', response);
      setIsTyping(false);
    }, 1200);
  };

  const greeting = `Namaste, ${user?.name?.split(' ')[0] || 'Ajay'} 🙏\nYour BP is slightly high. Want to consult a doctor?`;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>

      {/* Greeting Bubble — shows when chat is closed */}
      <AnimatePresence>
        {showBubble && !aiCharacterOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            style={{ position: 'absolute', bottom: '78px', right: 0, zIndex: 10 }}
          >
            <div className="speech-bubble" style={{ whiteSpace: 'pre-line' }}>
              {greeting}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {aiCharacterOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'absolute', bottom: '78px', right: 0,
              width: 356, maxHeight: '72vh',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <img src="/robot-namaste.png" alt="AI Assistant" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Amrit AI</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Your personal health guardian</div>
              </div>
              <button onClick={toggleAICharacter} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'white' }}>
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'ai' && (
                    <img src="/robot-namaste.png" alt="AI" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }} />
                  )}
                  <div style={{
                    maxWidth: '78%',
                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--accent-surface)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                    border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-line',
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: 5, padding: '9px 14px', background: 'var(--accent-surface)', borderRadius: 16, width: 'fit-content', border: '1px solid var(--border-color)' }}>
                  {[0,1,2].map(i => (
                    <motion.span key={i} animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i*0.15 }}
                      style={{ width: 6, height: 6, background: 'var(--accent-primary)', borderRadius: '50%', display: 'block' }} />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{ padding: '8px 14px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid var(--border-color)' }}>
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => sendMessage(p)} style={{
                  background: 'var(--accent-surface)', border: '1px solid var(--border-color)', borderRadius: 999,
                  padding: '5px 12px', fontSize: 11, whiteSpace: 'nowrap', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Amrit AI..."
                style={{
                  flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: '10px 14px', fontSize: 13,
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', color: 'white' }}>
                <Send size={15} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => { toggleAICharacter(); setShowBubble(false); }}
        className="animate-namaste"
        style={{
          width: 64, height: 64, borderRadius: '50%', border: 'none',
          cursor: 'pointer', padding: 0, overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
      >
        <img src="/robot-namaste.png" alt="AI Assistant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Online dot */}
        <span style={{
          position: 'absolute', top: 3, right: 3,
          width: 13, height: 13, background: 'var(--color-success)',
          borderRadius: '50%', border: '2px solid white',
        }} />
      </motion.button>
    </div>
  );
}
