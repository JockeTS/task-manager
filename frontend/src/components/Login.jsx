import { useState } from "react";
import { apiFetch } from "../api/helper";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      onLogin();
    } else {
      alert("Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">OK</button>
    </form>
  );
}