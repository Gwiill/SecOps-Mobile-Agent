// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLENIJ9gvdtqAv1xGhZJly6z1d6UaysKk",
  authDomain: "agenteredteam.firebaseapp.com",
  projectId: "agenteredteam",
  storageBucket: "agenteredteam.firebasestorage.app",
  messagingSenderId: "762707940036",
  appId: "1:762707940036:web:89afd8aef2aa264495af91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Banco de Dados (Firestore) e o exporta para usarmos no App.js
export const db = getFirestore(app);