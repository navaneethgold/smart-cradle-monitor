import React from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../Styles/liveStatus.css";

export default function AnomalyCard({ anomalies }) {
  if (!anomalies) return null;

  const renderStatus = (flag) => ({
    text: flag ? "Detected" : "Normal",
    icon: flag ? <ErrorIcon fontSize="inherit" /> : <CheckCircleIcon fontSize="inherit" />,
    className: flag ? "detected" : "normal",
  });

  const overall = renderStatus(anomalies.overall);

  return (
    <div>

      {/* Breakdown grid (excluding overall) */}
      <h3 style={{ margin: "1rem 0", display: "flex", alignItems: "center" }}>
        <BoltIcon style={{ marginRight: 8 }} /> Anomaly Breakdown
      </h3>

      {/* Overall anomaly as a banner */}
      <div className={`overall-anomaly-banner ${overall.className}`}>
        <div className="icon">{overall.icon}</div>
        <span className="text">
          Overall Anomaly: {overall.text}
        </span>
      </div>

      <div className="status-grid">
        {["temperature", "humidity", "motion", "noise"].map((key) => {
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
