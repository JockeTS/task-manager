import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import Header from "./Header";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

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
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-4 space-y-8 py-12">
        <h2 className="text-3xl font-semibold text-center m-0">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-6 max-w-md w-full mx-auto rounded-lg p-6 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
          </div>

          <Button type="submit" className="w-full transition-colors hover:bg-primary/90">Login</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">No account? Sign up <Link to="/register" className="text-blue-600 underline">here</Link>.</p>
      </main>

      <footer className="border-b">
        Footer
      </footer>
    </>
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