import {
  collection, getDocs, addDoc, setDoc, doc,
  query, where, orderBy, limit
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Medicine {
  id?: string;
  name: string;
  generic: string;
  composition: string;
  use: string;
  price: number;
  generic_price: number;
  similarity: number;
  category?: string;
  dosage?: string;
  side_effects?: string[];
}

export interface MedicalShop {
  id?: string;
  name: string;
  type: 'Jan Aushadhi' | 'Private' | 'Chain';
  distance: string;
  distance_km: number;
  address: string;
  phone: string;
  open: boolean;
  lat: number;
  lng: number;
  stock?: string[];
}

// ─── Static fallback data (used when Firebase is not configured) ────────────
export const STATIC_MEDICINES: Medicine[] = [
  { id:'1',  name:'Pantokind',       generic:'Pantoprazole',                  composition:'Pantoprazole Sodium',        use:'Acidity, GERD',          price:120, generic_price:25,  similarity:98, category:'Proton Pump Inhibitor',    dosage:'1 tablet before meal, twice daily',  side_effects:['Headache','Nausea','Diarrhoea'] },
  { id:'2',  name:'Dolo 650',        generic:'Paracetamol',                   composition:'Paracetamol 650mg',          use:'Fever, pain relief',      price:30,  generic_price:10,  similarity:99, category:'Analgesic / Antipyretic',  dosage:'1 tablet every 6–8 hours',           side_effects:['Rare liver stress on overdose'] },
  { id:'3',  name:'Azithral',        generic:'Azithromycin',                  composition:'Azithromycin 500mg',         use:'Bacterial infections',    price:150, generic_price:40,  similarity:95, category:'Antibiotic',               dosage:'500mg once daily for 3 days',       side_effects:['Nausea','Diarrhea','Stomach pain'] },
  { id:'4',  name:'Augmentin',       generic:'Amoxicillin + Clavulanic Acid', composition:'Amoxicillin + Clavulanate',  use:'Bacterial infection',     price:220, generic_price:80,  similarity:94, category:'Antibiotic',               dosage:'1 tablet twice daily after meals',  side_effects:['Diarrhoea','Rash','Nausea'] },
  { id:'5',  name:'Crocin',          generic:'Paracetamol',                   composition:'Paracetamol 500mg',          use:'Fever, headache',         price:35,  generic_price:10,  similarity:99, category:'Analgesic / Antipyretic',  dosage:'1–2 tablets every 4–6 hours',       side_effects:['Generally well tolerated'] },
  { id:'6',  name:'Zerodol',         generic:'Aceclofenac',                   composition:'Aceclofenac 100mg',          use:'Pain relief, arthritis',  price:110, generic_price:30,  similarity:96, category:'NSAID',                    dosage:'1 tablet twice daily after meals',  side_effects:['Stomach upset','Dizziness'] },
  { id:'7',  name:'Ecosprin',        generic:'Aspirin',                       composition:'Aspirin 75mg',               use:'Blood thinner, cardiac',  price:20,  generic_price:5,   similarity:99, category:'Antiplatelet',             dosage:'1 tablet once daily with meals',    side_effects:['GI irritation','Bleeding risk'] },
  { id:'8',  name:'Shelcal',         generic:'Calcium + Vitamin D3',          composition:'Calcium 500mg + Vit D3',     use:'Bone health, calcium',    price:150, generic_price:60,  similarity:97, category:'Supplement',               dosage:'1 tablet twice daily',              side_effects:['Constipation','Bloating'] },
  { id:'9',  name:'Glycomet',        generic:'Metformin',                     composition:'Metformin HCl 500mg',        use:'Type 2 Diabetes',         price:90,  generic_price:25,  similarity:98, category:'Anti-diabetic',            dosage:'1 tablet twice daily with meals',   side_effects:['Nausea','Diarrhoea','Metallic taste'] },
  { id:'10', name:'Telma',           generic:'Telmisartan',                   composition:'Telmisartan 40mg',           use:'Blood pressure control',  price:140, generic_price:50,  similarity:96, category:'ARB / Antihypertensive',  dosage:'1 tablet once daily',               side_effects:['Dizziness','Headache'] },
  { id:'11', name:'Montek LC',       generic:'Montelukast + Levocetirizine',  composition:'Montelukast 10mg + LC 5mg', use:'Allergy, rhinitis',       price:180, generic_price:70,  similarity:95, category:'Antihistamine',            dosage:'1 tablet once daily at night',      side_effects:['Drowsiness','Dry mouth'] },
  { id:'12', name:'Rantac',          generic:'Ranitidine',                    composition:'Ranitidine 150mg',           use:'Acidity, ulcers',         price:25,  generic_price:8,   similarity:98, category:'H2 Blocker',               dosage:'1 tablet twice daily',              side_effects:['Headache','Dizziness','Constipation'] },
  { id:'13', name:'Neurobion Forte', generic:'Vitamin B Complex',             composition:'Vitamin B1, B6, B12',        use:'Nerve health, weakness',  price:120, generic_price:40,  similarity:97, category:'Vitamin Supplement',       dosage:'1 tablet once daily',               side_effects:['Generally well tolerated'] },
  { id:'14', name:'Liv 52',          generic:'Herbal Liver Tonic',            composition:'Caper Bush + Chicory',       use:'Liver health, tonic',     price:140, generic_price:60,  similarity:85, category:'Hepatoprotective',         dosage:'2 tablets twice daily',             side_effects:['Rare GI discomfort'] },
  { id:'15', name:'ORS',             generic:'Oral Rehydration Salts',        composition:'Sodium + Glucose + Potassium', use:'Dehydration, diarrhea', price:20,  generic_price:10,  similarity:100, category:'Electrolyte',             dosage:'1 sachet in 200ml water as needed', side_effects:['None known'] },
];

export const STATIC_SHOPS: MedicalShop[] = [
  { id:'s1', name:'Sharma Medical Store',     type:'Private',       distance:'380m',  distance_km:0.38, address:'Gandhi Chowk, Near Civil Hospital, Indore', phone:'9876543210', open:true,  lat:22.7196, lng:75.8577, stock:['Pantokind','Crocin','Augmentin','Glycomet','Dolo 650'] },
  { id:'s2', name:'Jan Aushadhi Kendra #12',  type:'Jan Aushadhi',  distance:'720m',  distance_km:0.72, address:'Sector 4, Near Bus Stand, Indore',          phone:'9811223344', open:true,  lat:22.7210, lng:75.8601, stock:['Pantoprazole','Paracetamol','Glycomet','Telma','ORS'] },
  { id:'s3', name:'LifeCare Pharmacy',        type:'Private',       distance:'1.2km', distance_km:1.20, address:'MG Road, Opp. Police Station, Indore',      phone:'9988776655', open:false, lat:22.7180, lng:75.8620, stock:['Pantokind','Dolo 650','Azithral','Montek LC'] },
  { id:'s4', name:'Prakash Medical',          type:'Private',       distance:'1.8km', distance_km:1.80, address:'Railway Road, Platform No. 2 Side, Indore', phone:'9922334455', open:true,  lat:22.7230, lng:75.8559, stock:['Crocin','Glycomet','Pantokind','Shelcal'] },
  { id:'s5', name:'Jan Aushadhi Kendra #08',  type:'Jan Aushadhi',  distance:'2.4km', distance_km:2.40, address:'PHC Building, Sector 11, Indore',           phone:'9800012345', open:true,  lat:22.7170, lng:75.8640, stock:['Pantoprazole','Glycomet','Telma','ORS','Ecosprin'] },
  { id:'s6', name:'Apollo Pharmacy',          type:'Chain',         distance:'3.1km', distance_km:3.10, address:'City Mall, Ground Floor, AB Road, Indore',  phone:'9900112233', open:true,  lat:22.7250, lng:75.8650, stock:['Pantokind','Dolo 650','Azithral','Crocin','Augmentin','Shelcal'] },
  { id:'s7', name:'MedPlus Pharmacy',         type:'Chain',         distance:'4.2km', distance_km:4.20, address:'Vijay Nagar, Near D-Mart, Indore',          phone:'9933445566', open:true,  lat:22.7260, lng:75.8530, stock:['Pantokind','Zerodol','Neurobion Forte','Rantac','Liv 52'] },
];

// ─── Firestore functions ───────────────────────────────────────────────────────
const isFirebaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your_project_id');

export async function getMedicines(): Promise<Medicine[]> {
  if (!isFirebaseConfigured()) return STATIC_MEDICINES;
  try {
    const snap = await getDocs(collection(db, 'medicines'));
    if (snap.empty) return STATIC_MEDICINES;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Medicine));
  } catch {
    console.warn('[Firebase] Using static medicines fallback');
    return STATIC_MEDICINES;
  }
}

export async function getShops(): Promise<MedicalShop[]> {
  if (!isFirebaseConfigured()) return STATIC_SHOPS;
  try {
    const snap = await getDocs(collection(db, 'medical_shops'));
    if (snap.empty) return STATIC_SHOPS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalShop));
  } catch {
    console.warn('[Firebase] Using static shops fallback');
    return STATIC_SHOPS;
  }
}

export async function searchMedicines(query: string): Promise<Medicine[]> {
  const all = await getMedicines();
  const q = query.toLowerCase().trim();
  return all.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.generic.toLowerCase().includes(q) ||
    m.composition.toLowerCase().includes(q) ||
    m.use.toLowerCase().includes(q)
  );
}

// ─── Seed Firestore (run once) ────────────────────────────────────────────────
export async function seedFirestore() {
  if (!isFirebaseConfigured()) {
    console.warn('[Seed] Firebase not configured — skipping seed');
    return;
  }
  try {
    // Seed medicines
    for (const med of STATIC_MEDICINES) {
      const { id, ...data } = med;
      await setDoc(doc(db, 'medicines', id!), data);
    }
    // Seed shops
    for (const shop of STATIC_SHOPS) {
      const { id, ...data } = shop;
      await setDoc(doc(db, 'medical_shops', id!), data);
    }
    console.log('[Seed] ✅ Firestore seeded successfully!');
  } catch (e) {
    console.error('[Seed] ❌ Failed:', e);
  }
}
