import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import session from 'express-session';
import {createServer} from "node:http";
import express from 'express';
const app=express();
const server=createServer(app);
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


server.listen(port,()=>{
  console.log("Server started at port ",port)
});


app.get("/ping",(req,res)=>{
  res.send("backend is live");
})
app.use("/",(req,res)=>{
  res.send("Page not found");
})

//Root directory................................................................
app.get("/",(req,res)=>{
  res.send("Root directory");
});
