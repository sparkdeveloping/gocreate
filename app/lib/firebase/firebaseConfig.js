import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage methods

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf8WNv07FO4Z30EBHKrOu8OsSl_cph6SU",
  authDomain: "school-d09aa.firebaseapp.com",
  databaseURL: "https://school-d09aa.firebaseio.com",
  projectId: "school-d09aa",
  storageBucket: "school-d09aa.firebasestorage.app",
  messagingSenderId: "467373754147",
  appId: "1:467373754147:web:0ec80db8b2ecf9c7546e96",
  measurementId: "G-V1MHNJBLZQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export Firebase services and methods
export {
  db,
  auth,
  storage, // Export Storage
  collection,
  query,
  where,
  getDocs,
  addDoc,
  createUserWithEmailAndPassword,
  doc,
  getDoc,
  updateDoc,
  onAuthStateChanged,
  ref, // Export `ref` for storage references
  uploadBytes, // Export `uploadBytes` for uploading files
  getDownloadURL, // Export `getDownloadURL` for getting file URLs
};
