import React, { useState } from "react";
import { login } from "./Authentication";  // your email/pass login
import { auth,googleProvider } from "../fireBase";
import { signInWithPopup } from "firebase/auth";   // 👈 Google login function
import "../Styles/signup.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await login(email, password); // email/pass login
      setSuccess("Logged in successfully 🎉");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 Google login handler
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSuccess(`Welcome ${result.user.displayName} 🎉`);
      console.log("Google user:", result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Login</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {/* 🔹 Google Login Button */}
        <button type="button" onClick={handleGoogleLogin} className="google-btn">
          Login with Google
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>
    </div>
  );
};

export default Login;
