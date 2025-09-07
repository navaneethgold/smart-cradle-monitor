import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Signup from "./pages/SignUp";
import Login from "./pages/login";
import Test from "./pages/test";
import DataViewer from "./pages/Visualisation";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signUp" element={<Signup />} />
        <Route path="/visualisation" element={<DataViewer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
