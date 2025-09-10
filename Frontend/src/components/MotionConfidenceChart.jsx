import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MotionConfidenceChart({ data }) {
  const chartData = data.map((sample) => ({
    time: new Date(sample.timestamp_unix * 1000).toLocaleTimeString(),
    idle: sample.motion?.confidence?.idle ?? 0,
    normal: sample.motion?.confidence?.normal ?? 0,
    shake: sample.motion?.confidence?.shake ?? 0,
    tilt: sample.motion?.confidence?.tilt ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="idle" stroke="#8884d8" name="Idle" />
        <Line type="monotone" dataKey="normal" stroke="#82ca9d" name="Normal" />
        <Line type="monotone" dataKey="shake" stroke="#ff0000" name="Shake" />
        <Line type="monotone" dataKey="tilt" stroke="#ffaa00" name="Tilt" />
      </LineChart>
    </ResponsiveContainer>
  );
}
