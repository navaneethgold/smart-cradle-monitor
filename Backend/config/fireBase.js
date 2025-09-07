import admin from "firebase-admin";
// import serviceAccountKey from "../serviceAccountKey.json" assert { type: "json" };
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccountKey = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: "https://smart-cradle-fbb4a-default-rtdb.firebaseio.com"
});

const db = admin.database();
export { db, admin };