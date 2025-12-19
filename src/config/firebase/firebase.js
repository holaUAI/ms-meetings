import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccountPath = process.env.RENDER === 'true'
    ? '/etc/secrets/serviceAccountKey.json'
    : './src/config/firebase/serviceAccountKey.json';

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export default db;
