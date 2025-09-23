import React from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../Styles/liveStatus.css";
export default function AnomalyCard({ anomalies }) {
  if (!anomalies) return null;

  const renderStatus = (flag) => ({
    text: flag ? "Detected" : "Normal",
    icon: flag ? (
      <ErrorIcon fontSize="inherit" />
    ) : (
      <CheckCircleIcon fontSize="inherit" />
    ),
    className: flag ? "detected" : "normal",
  });

  return (
    <div>
      <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <BoltIcon style={{ marginRight: 8 }} /> Anomaly Breakdown
      </h3>

      <div className="status-grid">
        {["overall", "temperature", "humidity", "motion"].map((key) => {
          const { text, icon, className } = renderStatus(anomalies[key]);
          return (
            <div key={key} className={`status-card ${className}`}>
              <div className="icon">{icon}</div>
              <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
              <div className="status">{text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
