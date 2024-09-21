// utils/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIk8VABbkV7nspsxiXSZJreV_DvJvpuSY",
  authDomain: "genni-8fdd5.firebaseapp.com",
  projectId: "genni-8fdd5",
  storageBucket: "genni-8fdd5.appspot.com",
  messagingSenderId: "338578963323",
  appId: "1:338578963323:web:cf1c4871e114ad511f1bde",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
};
