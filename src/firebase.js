import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2IGOdYBleGqQHyBBd_Dwhg86Tst1XWok",
  authDomain: "ap-project-e5f18.firebaseapp.com",
  projectId: "ap-project-e5f18",
  storageBucket: "ap-project-e5f18.firebasestorage.app",
  messagingSenderId: "817346522528",
  appId: "1:817346522528:web:c11bedf1d525c12bed88c5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);