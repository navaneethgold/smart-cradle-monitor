import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import session from 'express-session';
import { db } from './config/fireBase';
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

app.listen(port,()=>{
  console.log("Server started at port ",port)
});


app.get("/ping",(req,res)=>{
  res.send("backend is live");
})

//Root directory................................................................
app.get("/",(req,res)=>{
  res.send("Root directory");
});
