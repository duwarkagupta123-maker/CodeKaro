import {
  auth,
  db,
  firebaseConfig,
  googleProvider,
  githubProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  syncUserProfileToFirestore,
  type SyncedUserProfile,
} from './firebase';

export interface CodeKaroAuthAPI {
  auth: typeof auth;
  db: typeof db;
  firebaseConfig: typeof firebaseConfig;
  signInWithGoogle: () => Promise<SyncedUserProfile>;
  signInWithGitHub: () => Promise<SyncedUserProfile>;
  signUpWithEmailAfterOtp: (
    name: string,
    email: string,
    password: string
  ) => Promise<SyncedUserProfile>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<SyncedUserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CodeKaroAuth: CodeKaroAuthAPI = {
  auth,
  db,
  firebaseConfig,

  async signInWithGoogle(): Promise<SyncedUserProfile> {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfileToFirestore(
      cred.user,
      'google',
      true,
      cred.user.displayName || undefined,
      cred.user.email || undefined
    );
    return profile;
  },

  async signInWithGitHub(): Promise<SyncedUserProfile> {
    const cred = await signInWithPopup(auth, githubProvider);
    const reloadInfo = (cred.user as unknown as { reloadUserInfo?: { screenName?: string } })
      .reloadUserInfo;
    const ghName =
      cred.user.displayName ||
      reloadInfo?.screenName ||
      (cred.user.email ? cred.user.email.split('@')[0] : 'GitHub Coder');
    const profile = await syncUserProfileToFirestore(
      cred.user,
      'github',
      true,
      ghName,
      cred.user.email || `${reloadInfo?.screenName || cred.user.uid}@users.noreply.github.com`
    );
    return profile;
  },

  async signUpWithEmailAfterOtp(
    name: string,
    email: string,
    password: string
  ): Promise<SyncedUserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(cred.user, { displayName: name });
    } catch (err) {
      console.warn('Could not update Firebase Auth displayName:', err);
    }
    const profile = await syncUserProfileToFirestore(
      cred.user,
      'email',
      true,
      name,
      email
    );
    return profile;
  },

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<SyncedUserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncUserProfileToFirestore(
      cred.user,
      'email',
      true,
      cred.user.displayName || undefined,
      email
    );
    return profile;
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};

declare global {
  interface Window {
    CodeKaroAuth: CodeKaroAuthAPI;
  }
}

window.CodeKaroAuth = CodeKaroAuth;
window.dispatchEvent(new CustomEvent('codekaro-firebase-ready', { detail: CodeKaroAuth }));

onAuthStateChanged(auth, (user) => {
  window.dispatchEvent(new CustomEvent('codekaro-auth-changed', { detail: { user } }));
});

export default CodeKaroAuth;
