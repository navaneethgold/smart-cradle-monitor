import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../fireBase.js";
import { useAuth } from "../contexts/Authentication";
import { useNavigate } from "react-router-dom";
import { notify } from "../Features/toastManager.jsx";
import "../Styles/Visualisation.css";

import LiveStatus from "../components/LiveStatus";
import AnomalyCard from "../components/AnomalyCard";
import EnvChart from "../components/EnvChart";
import MotionConfidenceChart from "../components/MotionConfidenceChart";

// ✅ Import MUI icons
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

const DataViewer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cradleData, setCradleData] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (!user) {
      notify.error("User should log in to monitor the cradle");
      navigate("/login");
      return;
    }

    const dataRef = ref(db, `cradleData`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([id, item]) => ({
          id,
          ...item,
        }));
        const sortedArr = arr.sort((a, b) => a.timestamp_unix - b.timestamp_unix);
        setCradleData(sortedArr);
        setLatest(sortedArr[sortedArr.length - 1]);
      } else {
        setCradleData([]);
        setLatest(null);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  return (
    <div className="dashboard-page">
      <header className="header-page">
        <h1 className="welcome-text">
          Welcome, {user ? user.displayName || user.email : "Guest"}
        </h1>
        <div className="header-buts">
          {user ? (
            <button onClick={logout} className="logout-btn">
              Log Out
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="logout-btn">
                Log In
              </button>
              <button onClick={() => navigate("/signUp")} className="logout-btn">
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <main className="dashboard-card">
        <h2>
          <InsertChartIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
          Smart Cradle Dashboard
        </h2>

        <p>Recent most logged data:</p> <br />

        <section>
          <LiveStatus latest={latest} />
        </section>

        {latest && (
          <section>
            <AnomalyCard anomalies={latest.anomalies} />
          </section>
        )}

        <section>
          <h3>
            <ThermostatIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
            Environment Trends
          </h3>
          <EnvChart data={cradleData} />
        </section>

        <section>
          <h3>
            <TrackChangesIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
            Motion Confidence
          </h3>
          <MotionConfidenceChart data={cradleData} />
        </section>
      </main>
    </div>
  );
};

export default DataViewer;
