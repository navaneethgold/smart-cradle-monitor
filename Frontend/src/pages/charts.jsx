import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Chart = ({ data }) => {
  // Format data: sort by timestamp
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <LineChart width={850} height={300} data={sorted}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
      <YAxis />
      <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
      <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
      <Line type="monotone" dataKey="humidity" stroke="#387908" />
    </LineChart>
  );
};
export default Chart;