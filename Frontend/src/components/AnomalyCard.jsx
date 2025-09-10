import React from "react";

export default function AnomalyCard({ anomalies }) {
  if (!anomalies) return null;

  const renderStatus = (flag) =>
    flag ? "⚠️ Detected" : "✅ Normal";

  return (
    <div className="card">
      <h3>⚡ Anomaly Breakdown</h3>
      <ul>
        <li>Overall: {renderStatus(anomalies.overall)}</li>
        <li>Temperature: {renderStatus(anomalies.temperature)}</li>
        <li>Humidity: {renderStatus(anomalies.humidity)}</li>
        <li>Motion: {renderStatus(anomalies.motion)}</li>
      </ul>
    </div>
  );
}
