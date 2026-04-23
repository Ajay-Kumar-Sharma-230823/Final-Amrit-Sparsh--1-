'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, MapPin, Search, ShoppingCart, Clock, Package, Star, Check } from 'lucide-react';

const pharmacies = [
  { name: 'Jan Aushadhi Kendra', distance: '0.5 km', rating: 4.5, open: true, type: 'Government' },
  { name: 'MedPlus Pharmacy', distance: '0.9 km', rating: 4.3, open: true, type: 'Private' },
  { name: 'Apollo Pharmacy', distance: '1.4 km', rating: 4.7, open: true, type: 'Chain' },
  { name: 'Kumbh Medical Store', distance: '0.2 km', rating: 4.1, open: false, type: 'Local' },
];

const medicines = [
  { name: 'Paracetamol 500mg', category: 'Pain Relief', price: '₹12', available: true, generic: true },
  { name: 'ORS Sachets (Pack of 10)', category: 'Rehydration', price: '₹45', available: true, generic: true },
  { name: 'Electral Powder', category: 'Electrolyte', price: '₹28', available: true, generic: false },
  { name: 'Dolo 650', category: 'Fever', price: '₹30', available: true, generic: false },
  { name: 'Crocin Advance', category: 'Pain Relief', price: '₹35', available: false, generic: false },
  { name: 'Bandage Roll (Sterile)', category: 'First Aid', price: '₹15', available: true, generic: true },
  { name: 'Betadine Solution', category: 'Antiseptic', price: '₹65', available: true, generic: false },
  { name: 'Cetrizine 10mg', category: 'Allergy', price: '₹8', available: true, generic: true },
];

export default function MKPharmacy() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

  const toggleCart = (name: string) => {
    setCart(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💊 Pharmacy & Medicine
        {cart.length > 0 && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '4px 12px', borderRadius: 10 }}>
            <ShoppingCart size={12} /> {cart.length} items
          </span>
        )}
      </div>

      {/* Nearby Pharmacies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {pharmacies.map(p => (
          <motion.div key={p.name} whileHover={{ y: -3, scale: 1.01 }} className="glass-card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -15, right: -10, width: 50, height: 50, borderRadius: '50%', background: p.open ? 'radial-gradient(circle,rgba(16,185,129,0.15),transparent)' : 'radial-gradient(circle,rgba(239,68,68,0.1),transparent)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 24, marginBottom: 8 }}>🏪</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{p.type}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
              <MapPin size={10} /> {p.distance}
              <Star size={10} color="#f59e0b" fill="#f59e0b" /> {p.rating}
            </div>
            <span style={{
              display: 'inline-block', marginTop: 8, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: p.open ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: p.open ? '#10b981' : '#ef4444',
            }}>
              {p.open ? '● Open Now' : '● Closed'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '0 14px', height: 42 }}>
        <Search size={16} color="var(--text-muted)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines, categories..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)' }} />
      </div>

      {/* Medicine Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {filtered.map(med => {
          const inCart = cart.includes(med.name);
          return (
            <motion.div key={med.name} whileHover={{ y: -3 }} className="glass-card" style={{ padding: 14, opacity: med.available ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'var(--accent-surface)', color: 'var(--text-muted)' }}>{med.category}</span>
                {med.generic && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>Generic</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{med.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{med.price}</span>
                {med.available ? (
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleCart(med.name)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                      background: inCart ? '#10b981' : 'var(--gradient-primary)',
                      color: 'white', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    {inCart ? <><Check size={10} /> Added</> : <><ShoppingCart size={10} /> Add</>}
                  </motion.button>
                ) : (
                  <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>Out of stock</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Order */}
      {cart.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card"
          style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Quick Order</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cart.length} items · Nearest pharmacy: Jan Aushadhi (0.5 km)</div>
          </div>
          <button style={{ padding: '10px 24px', borderRadius: 12, background: '#10b981', border: 'none', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            Place Order →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
