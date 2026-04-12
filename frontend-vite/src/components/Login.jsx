import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import AuthForm from "./AuthForm";

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

        <AuthForm handleSubmit={handleSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword}/>

        <p className="text-center text-sm text-muted-foreground">No account? Sign up <Link to="/register" className="text-blue-600 underline">here</Link>.</p>
      </main>

      <Footer />
    </>
  );
}
