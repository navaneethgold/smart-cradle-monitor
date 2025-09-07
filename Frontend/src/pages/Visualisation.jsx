import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../fireBase.js"; // your firebaseConfig file
import axios from "axios";
import Chart from "./charts.jsx";

const db = getDatabase(app);

const DataViewer = () => {
  const [data, setData] = useState([]);
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
  useEffect(() => {
    const dataRef = ref(db, "testData");

    // Realtime listener
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Convert object into array of {id, ...values}
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
  }, []);

  return (
    <div style={{ padding: "20px" }}>

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
      <h2>Live Firebase Data</h2>
      <Chart data={data} />
    </div>
  );
};

export default DataViewer;
