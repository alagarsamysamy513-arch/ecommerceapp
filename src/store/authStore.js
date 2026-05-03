import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,

  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || email.split('@')[0],
          role: 'Admin',
          avatar: userCredential.user.photoURL || 'https://i.pravatar.cc/150?u=admin'
        },
        isAuthenticated: true 
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: email.split('@')[0],
          role: 'Admin',
          avatar: 'https://i.pravatar.cc/150?u=admin'
        },
        isAuthenticated: true 
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      throw error;
    }
  },

  loginWithFacebook: async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },

  initAuthListener: () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({ 
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'Admin',
            avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?u=admin'
          },
          isAuthenticated: true,
          isAuthInitialized: true
        });
      } else {
        set({ user: null, isAuthenticated: false, isAuthInitialized: true });
      }
    });
  }
}));
