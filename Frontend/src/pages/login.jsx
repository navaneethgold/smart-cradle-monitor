import React, { useState } from "react";
import "../Styles/signup.css";
import { useAuth } from "../contexts/Authentication";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await login(email, password);
      setSuccess("Logged in successfully 🎉");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      const result = await loginWithGoogle();
      setSuccess(`Welcome ${result.user.displayName} 🎉`);
      console.log("Google user:", result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
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

          <button type="submit" className="login-btn">Login</button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSubmit}
            className="google-btn"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
            />
            Login with Google
          </button>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}
        </form>
        <button
          type="button"
          className="guest-btn"
          onClick={() => (window.location.href = "/visualisation")}
        >
          Continue as Guest
        </button>

        <p className="redirect-text">
          Don’t have an account?{" "}
          <span
            className="redirect-link"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
