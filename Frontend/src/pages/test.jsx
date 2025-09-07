import React, { useState } from "react";
import axios from "axios";

const Test = () => {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/test", {
        temperature,
        humidity,
      });
      setResponse("✅ " + res.data.message + " (ID: " + res.data.id + ")");
      setTemperature("");
      setHumidity("");
    } catch (err) {
      setResponse("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Send</button>
      </form>
      {response && <p>{response}</p>}
    </div>
  );
};

export default Test;
