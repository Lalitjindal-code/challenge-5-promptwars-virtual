import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserPassword: (newPass: string) => Promise<void>;
  enterDemoWorkspace: () => void;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = "planora_demo_workspace_active";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // Remove any stray demo session if real Firebase user is active
          localStorage.removeItem(DEMO_USER_KEY);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            photoURL: fbUser.photoURL,
            emailVerified: fbUser.emailVerified,
            isDemo: false
          });
        } else {
          // Check if an explicit demo workspace session was active
          const demoActive = localStorage.getItem(DEMO_USER_KEY);
          if (demoActive === "true") {
            setUser({
              uid: "demo-alex-morgan",
              email: "test@planora.ai",
              displayName: "Alex Morgan (Demo Studio)",
              photoURL: null,
              emailVerified: true,
              isDemo: true
            });
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If Firebase is not configured at all, check if demo workspace was opened
      const demoActive = localStorage.getItem(DEMO_USER_KEY);
      if (demoActive === "true") {
        setUser({
          uid: "demo-alex-morgan",
          email: "test@planora.ai",
          displayName: "Alex Morgan (Demo Studio)",
          photoURL: null,
          emailVerified: true,
          isDemo: true
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Firebase is not configured. Please supply valid Firebase credentials in .env to use live authentication, or enter Demo Mode."
      );
    }

    const cred = await signInWithEmailAndPassword(auth, email, pass);
    localStorage.removeItem(DEMO_USER_KEY);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split("@")[0],
      photoURL: cred.user.photoURL,
      emailVerified: cred.user.emailVerified,
      isDemo: false
    });
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Firebase is not configured. Real account creation requires live Firebase configuration."
      );
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    // Send real Firebase email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (verErr) {
      console.warn("Could not dispatch email verification immediately:", verErr);
    }

    localStorage.removeItem(DEMO_USER_KEY);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name || email.split("@")[0],
      photoURL: cred.user.photoURL,
      emailVerified: false,
      isDemo: false
    });
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Google Sign-In requires active Firebase credentials.");
    }

    const cred = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem(DEMO_USER_KEY);
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
      emailVerified: cred.user.emailVerified,
      isDemo: false
    });
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Password reset requires live Firebase Authentication.");
    }
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error("No active authenticated session found.");
    }
  };

  const updateUserPassword = async (newPass: string) => {
    if (auth && auth.currentUser) {
      await updatePassword(auth.currentUser, newPass);
    } else {
      throw new Error("No active user session to update password.");
    }
  };

  const enterDemoWorkspace = () => {
    localStorage.setItem(DEMO_USER_KEY, "true");
    setUser({
      uid: "demo-alex-morgan",
      email: "test@planora.ai",
      displayName: "Alex Morgan (Demo Studio)",
      photoURL: null,
      emailVerified: true,
      isDemo: true
    });
  };

  const logOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        sendVerificationEmail,
        updateUserPassword,
        enterDemoWorkspace,
        logOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
