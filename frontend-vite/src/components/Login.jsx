import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import AuthForm from "./AuthForm";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Set page title when component mounts
  useEffect(() => {
    document.title = "Login - Recurso";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setError("");

    try {
      await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      // No catch: login succeeded
      const data = await apiFetch("/me");
      onLogin(data.user);

      navigate("/");
    } catch (error) {
      alert("Login failed");
    }
  }

  return (
    <>
      <h2 className="text-3xl font-semibold text-center">
        Log in
      </h2>

      <AuthForm handleSubmit={handleSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} buttonText="Log in" />

      <p className="text-center text-sm text-muted-foreground">No account? Sign up <Link to="/register" className="text-blue-600 underline hover:text-blue-900">here</Link>.</p>
    </>
  );
}

export default Login;