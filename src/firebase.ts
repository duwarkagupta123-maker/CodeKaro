import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation constants synchronized with firebase-blueprint.json
const UID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const MAX_UID_LEN = 128;
const MAX_USERNAME_LEN = 60;
const MAX_DISPLAY_NAME_LEN = 100;
const MAX_PHOTO_URL_LEN = 500;
const MAX_EMAIL_LEN = 254;

export interface SyncedUserProfile {
  id: string;
  uid: string;
  username: string;
  name: string;
  email: string;
  picture: string;
  avatar: string;
  provider: 'google' | 'github' | 'email';
  otpVerified: boolean;
}

export async function syncUserProfileToFirestore(
  user: User,
  provider: 'google' | 'github' | 'email',
  otpVerified: boolean,
  overrideName?: string,
  overrideEmail?: string
): Promise<SyncedUserProfile> {
  const rawUid = (user.uid || '').trim().slice(0, MAX_UID_LEN);
  if (!rawUid || !UID_REGEX.test(rawUid)) {
    throw new Error('Invalid Firebase UID format.');
  }

  const email = (overrideEmail || user.email || `${rawUid}@users.codekaro.dev`)
    .trim()
    .slice(0, MAX_EMAIL_LEN);
  const rawHandle = (
    overrideName ||
    user.displayName ||
    (email.includes('@') ? email.split('@')[0] : 'coder')
  )
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '') || 'coder';

  const username = rawHandle.slice(0, MAX_USERNAME_LEN);
  const displayName = (overrideName || user.displayName || username)
    .trim()
    .slice(0, MAX_DISPLAY_NAME_LEN) || username;
  const photoURL = (user.photoURL || '').trim().slice(0, MAX_PHOTO_URL_LEN);

  const userDocRef = doc(db, 'users', rawUid);
  const privateDocRef = doc(db, 'users', rawUid, 'private', 'info');

  let exists = false;
  try {
    const snap = await getDoc(userDocRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${rawUid}`);
  }

  try {
    const batch = writeBatch(db);
    if (!exists) {
      batch.set(userDocRef, {
        uid: rawUid,
        username,
        displayName,
        photoURL,
        provider,
        otpVerified: Boolean(otpVerified),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(privateDocRef, {
        uid: rawUid,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.update(userDocRef, {
        username,
        displayName,
        photoURL,
        otpVerified: Boolean(otpVerified),
        updatedAt: serverTimestamp(),
      });
      batch.update(privateDocRef, {
        email,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      exists ? OperationType.UPDATE : OperationType.CREATE,
      `users/${rawUid}`
    );
  }

  return {
    id: rawUid,
    uid: rawUid,
    username,
    name: displayName,
    email,
    picture: photoURL,
    avatar: photoURL,
    provider,
    otpVerified: Boolean(otpVerified),
  };
}

export {
  firebaseConfig,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
};
