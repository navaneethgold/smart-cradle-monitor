import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import session from 'express-session';
import { db } from './config/fireBase.js';
import express from 'express';
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("trust proxy", 1);
const sessionOptions={
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        sameSite:"none",
        secure:true,
        domain:"localhost:5000",
        maxAge:7 * 24 * 60 * 60 * 1000,
    },
};
const allowedOrigins=[
    "http://localhost:5173",
    "http://localhost:5174"
]
app.use(cors({
    origin:(origin,callback)=>{
        console.log("CORS request from:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
    },
    credentials:true
}))
app.use(session(sessionOptions));
const port=5000;

app.post("/blynk-data", (req, res) => {
  const { temperature, humidity, cry, unsafemovement, timestamp } = req.body;

  const ref = db.ref("sensorData").push();
  ref.set({
    temperature,
    humidity,
    cry,
    unsafemovement,
    timestamp
  })
  .then(() => res.status(200).json({ success: true }))
  .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/api/test", async (req, res) => {
  try {
    const { temperature, humidity } = req.body;

    // Push to Firebase under /testData
    const ref = db.ref("testData").push();
    await ref.set({
      temperature,
      humidity,
      timestamp: Date.now()
    });

    res.status(200).json({ message: "Data added!", id: ref.key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// server.js (Express route to fetch all test data)
app.get("/api/test", async (req, res) => {
  try {
    const snapshot = await db.ref("testData").once("value");
    const data = snapshot.val();
    res.status(200).json(data || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching data" });
  }
});


app.listen(port, () => {
  console.log("Server started at port ", port);
});


app.get("/ping",(req,res)=>{
  res.send("backend is live");
})

//Root directory................................................................
app.get("/",(req,res)=>{
  res.send("Root directory");
});
