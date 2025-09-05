import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-cradle-fbb4a-default-rtdb.firebaseio.com"
});

const db = admin.database();
export { db, admin };
