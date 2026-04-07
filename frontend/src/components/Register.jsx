import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import { Link } from "react-router-dom";

export default function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      // No catch: registration succeeded
      const data = await apiFetch("/me");
      onRegister(data.user);

      navigate("/");
    } catch (error) {
      alert("Registration failed");
    }
  }

  return (
    <>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">OK</button>
      </form>
    </>
  );
}
