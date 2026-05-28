/// <reference types="node" />

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
const identityToolkitBaseUrl = 'https://identitytoolkit.googleapis.com/v1';

const defaultStoreId = 'store-mr-tao-q1';
const adminRoleCode = 'CHU_CUA_HANG';

const staffCollection = 'staff';
const rolesCollection = 'roles';
const permissionsCollection = 'staff_permissions';

const adminRole = {
  id: `ROLE-${adminRoleCode}`,
  storeId: defaultStoreId,
  code: adminRoleCode,
  name: 'Chu cua hang',
  status: 'active',
};

const adminStaff = {
  id: 'NV-001',
  storeId: defaultStoreId,
  fullName: 'Nguyen Minh Duc',
  role: adminRoleCode,
  roleId: adminRole.id,
  username: 'admin',
  usernameNormalized: 'admin',
  authEmail: 'admin1@mrtaocoop.com',
  phone: '0912345678',
  status: 'active',
  joinedDate: '2024-01-15',
  email: 'admin1@mrtaocoop.com',
  password: 'admin123',
  pin: '1234',
  department: 'Ban Dieu Hanh',
  position: 'Quan Truong Showroom',
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
  storeId: defaultStoreId,
  roleCode: adminRoleCode,
  roleId: adminRole.id,
  module: item.module,
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  canApprove: true,
}));

type IdentityToolkitAuthResponse = {
  localId: string;
};

class IdentityToolkitError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'IdentityToolkitError';
    this.code = code;
  }
}

async function postToIdentityToolkit<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing environment variable: VITE_FIREBASE_API_KEY');
  }

  const response = await fetch(`${identityToolkitBaseUrl}/${path}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as {
    error?: {
      message?: string;
    };
  };

  if (!response.ok) {
    const errorCode = json.error?.message ?? `HTTP_${response.status}`;
    throw new IdentityToolkitError(
      errorCode,
      `Identity Toolkit request "${path}" failed with code ${errorCode}.`,
    );
  }

  return json as T;
}

async function ensurePasswordAuthUser(email: string, password: string): Promise<{
  uid: string;
  status: 'verified' | 'created';
}> {
  try {
    const created = await postToIdentityToolkit<IdentityToolkitAuthResponse>('accounts:signUp', {
      email,
      password,
      returnSecureToken: true,
    });

    return { uid: created.localId, status: 'created' };
  } catch (error) {
    if (!(error instanceof IdentityToolkitError)) {
      throw error;
    }

    if (error.code === 'EMAIL_EXISTS') {
      try {
        const signedIn = await postToIdentityToolkit<IdentityToolkitAuthResponse>(
          'accounts:signInWithPassword',
          {
            email,
            password,
            returnSecureToken: true,
          },
        );

        return { uid: signedIn.localId, status: 'verified' };
      } catch (signInError) {
        if (signInError instanceof IdentityToolkitError) {
          if (
            signInError.code === 'INVALID_PASSWORD' ||
            signInError.code === 'INVALID_LOGIN_CREDENTIALS'
          ) {
            throw new Error(
              `Firebase Auth user "${email}" already exists with a different password. Reset password to "${password}" in Firebase Auth console, then run the seed again.`,
            );
          }
        }

        throw signInError;
      }
    }

    if (
      error.code === 'EMAIL_NOT_FOUND' ||
      error.code === 'INVALID_LOGIN_CREDENTIALS'
    ) {
      const created = await postToIdentityToolkit<IdentityToolkitAuthResponse>('accounts:signUp', {
        email,
        password,
        returnSecureToken: true,
      });

      return { uid: created.localId, status: 'created' };
    }

    if (error.code === 'INVALID_PASSWORD') {
      throw new Error(
        `Firebase Auth user "${email}" already exists with a different password. Reset password to "${password}" in Firebase Auth console, then run the seed again.`,
      );
    }

    throw error;
  }
}

async function seedAdmin() {
  const authResult = await ensurePasswordAuthUser(adminStaff.authEmail, adminStaff.password);
  const auth = getAuth(app);

  await signInWithEmailAndPassword(auth, adminStaff.authEmail, adminStaff.password);

  try {
    await setDoc(
      doc(db, rolesCollection, adminRole.id),
      adminRole,
      { merge: true },
    );
  } catch (error) {
    if ((error as { code?: string })?.code === 'permission-denied') {
      throw new Error(
        'Firestore denied write to collection "roles". Update Firestore rules to allow authenticated admin writes to /roles/{docId}.',
      );
    }
    throw error;
  }

  await setDoc(
    doc(db, staffCollection, adminStaff.id),
    {
      ...adminStaff,
      firebaseUid: authResult.uid,
    },
    { merge: true },
  );

  for (const permission of fullAccessPermissions) {
    await setDoc(doc(db, permissionsCollection, permission.id), permission, { merge: true });
  }

  console.log('Seeded admin role + staff + full-access permissions successfully.');
  console.log(`Firebase Auth account status: ${authResult.status} (uid: ${authResult.uid})`);
  console.log('Role document: roles/ROLE-CHU_CUA_HANG');
  console.log('Login username: admin');
  console.log(`Auth email for Firebase Auth: ${adminStaff.authEmail}`);
}

seedAdmin().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
