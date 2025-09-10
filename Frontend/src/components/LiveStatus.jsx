import React from "react";

export default function LiveStatus({ latest }) {
  if (!latest) return <p>⏳ Waiting for data...</p>;

  const { environment, motion, anomalies } = latest;

  return (
    <div className="card">
      <h2>🔴 Live Status</h2>
      <p>🌡 Temperature: <b>{environment?.temperature ?? "--"} °C</b></p>
      <p>💧 Humidity: <b>{environment?.humidity ?? "--"} %</b></p>
      <p>📡 Motion: <b>{motion?.state ?? "Unknown"}</b></p>
      <p>
        ⚠️ Anomaly:{" "}
        {anomalies?.overall ? (
          <span style={{ color: "red", fontWeight: "bold" }}>YES</span>
        ) : (
          <span style={{ color: "green" }}>No</span>
        )}
      </p>
    </div>
  );
}
