/// <reference types="node" />

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

for (const envKey of requiredEnvKeys) {
  if (!process.env[envKey]) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
});

const db = getFirestore(app);

const staffCollection = 'staff';
const permissionsCollection = 'staff_permissions';

const adminStaff = {
  id: 'NV-001',
  storeId: 'store-mr-tao-q1',
  fullName: 'Nguyễn Minh Đức',
  role: 'CHU_CUA_HANG',
  username: 'admin',
  phone: '0912345678',
  status: 'active',
  joinedDate: '2024-01-15',
  email: 'admin@mrtaocoop.com',
  password: 'admin123',
  pin: '1234',
  department: 'Ban Điều Hành',
  position: 'Quầy Trưởng Showroom',
  employeeCode: 'MNS-001',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
};

const fullAccessPermissions = [
  { id: 'PQ-ADM-001', module: 'HOM_NAY' },
  { id: 'PQ-ADM-002', module: 'CHECKLIST' },
  { id: 'PQ-ADM-003', module: 'GIAO_VIEC' },
  { id: 'PQ-ADM-004', module: 'KPI' },
  { id: 'PQ-ADM-005', module: 'LOI_SOP' },
  { id: 'PQ-ADM-006', module: 'BAO_CAO' },
  { id: 'PQ-ADM-007', module: 'SO_TAY' },
].map((item) => ({
  id: item.id,
  storeId: 'store-mr-tao-q1',
  roleCode: 'CHU_CUA_HANG',
  module: item.module,
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  canApprove: true,
}));

async function seedAdmin() {
  await setDoc(doc(db, staffCollection, adminStaff.id), adminStaff, { merge: true });

  for (const permission of fullAccessPermissions) {
    await setDoc(doc(db, permissionsCollection, permission.id), permission, { merge: true });
  }

  console.log('Seeded admin staff + full-access permissions successfully.');
  console.log('Login username: admin');
  console.log('Login password: admin123');
}

seedAdmin().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
