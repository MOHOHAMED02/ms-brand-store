// Shop + Firebase settings. Example settings. Copy this file to config.js and fill in your own values.
// config.js is in .gitignore, so your real keys and contacts are never committed.
window.MS_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId: "YOUR_APP_ID"
  },
  adminEmail: "owner@example.com",          // the shop owner's login (Firebase Authentication)
  whatsapp: "972500000000",           // orders are sent here, international format without +
  instagram: "your_instagram",
  waze: "https://waze.com/ul/your_place"
};
