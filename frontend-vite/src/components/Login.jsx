import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

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
    <main className="content">
      <h1 className="text-4xl">Login</h1>

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <Button type="submit">OK</Button>
      </form>

      <p>No account? Sign up <Link to="/register">here</Link>.</p>
    </main>
  );
}

/*
export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    console.log("json: ", JSON.stringify({ email, password }));

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
*/