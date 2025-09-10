import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue ,push,set} from "firebase/database";
import { app } from "../fireBase.js"; // your firebaseConfig file
import axios from "axios";
import Chart from "./charts.jsx";
import { useAuth } from "../contexts/Authentication";
import "../Styles/Visualisation.css";
import { useNavigate } from "react-router-dom";
import {notify} from "../Features/toastManager.jsx"

// Initialize Realtime Database and get a reference to the service

const db = getDatabase(app);
const DataViewer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [response, setResponse] = useState("");

  function sendSensorLog(e) {
    e.preventDefault();
    if (!user) {
      notify.error("You must be logged in to send data!");
      return;
    }

    const userRef = ref(db, `users/${user.uid}/testData`);

    push(userRef, {
      temperature,
      humidity,
      timestamp: Date.now(),
    })
      .then(() => {
        setResponse("Data sent successfully!");
        notify.success("Data sent successfully!");
        setTemperature("");
        setHumidity("");
      })
      .catch((err) => {
        setResponse("Error: " + err.message);
        notify.error("Error: " + err.message);
      });
  }

  useEffect(() => {
    if (!user) return; // don’t fetch if not logged in
  
    const dataRef = ref(db, `users/${user.uid}/testData`);
  
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([id, item]) => ({
          id,
          ...item,
        }));
        setData(arr);
      } else {
        setData([]);
      }
    });
  
    return () => unsubscribe();
  }, [user]);
  

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="header-page">
          <h1 className="welcome-text">
            Welcome, {user ? user.displayName || user.email : "Guest"}
          </h1>
          <div className="header-buts">
            {user ? (
              <button onClick={logout} className="logout-btn">
                Log Out
              </button>
            ) : (<>
              <button onClick={() => navigate("/login")} className="logout-btn">
                Log In
              </button>
              <button onClick={() => navigate("/signUp")} className="logout-btn">
                Sign Up
              </button></>
            )}
          </div>
        </div>
    
        <div className="test-card">
          <h2>Test Page</h2>
          <form onSubmit={sendSensorLog} className="test-form">
            <input
              type="text"
              placeholder="Temperature"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Humidity"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              required
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
          {response && <p className="response-msg">{response}</p>}
        </div>
      
        <h2 className="live-data-title">📊 Live Firebase Data</h2>
        <div className="chart-container">
          <Chart data={data} />
        </div>
      </div>
    </div>
    
  );
};

export default DataViewer;
