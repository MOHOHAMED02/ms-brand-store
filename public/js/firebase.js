const firebaseConfig = window.MS_CONFIG.firebase;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const auth = getAuth(app);
