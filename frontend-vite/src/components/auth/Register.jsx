import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/helper";
import AuthForm from "./AuthForm";

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register - Recurso";
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || password.trim().length < 6) {
      setError("Email and password are required. Password must be at least 6 characters long.");
      return;
    }

    setError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      // No catch: registration succeeded
      const data = await apiFetch("/auth/me");
      onRegister(data.user);

      navigate("/");
    } catch (error) {
      alert("Registration failed");
    }
  }

  return (
    <>
      <h2 className="text-3xl font-semibold text-center">
        Create account
      </h2>

      <AuthForm handleSubmit={handleSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} buttonText="Create account" />

      <p className="text-center text-sm text-muted-foreground">Already have an account? Log in <Link to="/login" className="text-blue-600 underline hover:text-blue-900">here</Link>.</p>
    </>
  );
}

export default Register;