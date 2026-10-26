import { getFirestore, type Firestore } from "firebase/firestore";
import { app, isFirebaseConfigured } from "./firebase";

export const db: Firestore | undefined =
  isFirebaseConfigured && app ? getFirestore(app) : undefined;
