import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Signup from "./pages/SignUp";
import Login from "./pages/login";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signUp" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
