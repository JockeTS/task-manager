import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/helper";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthForm from "./AuthForm";

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <h1>Register</h1>

        <AuthForm handleSubmit={handleSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword}/>

        <p className="text-center text-sm text-muted-foreground">Already have an account? Log in <Link to="/login" className="text-blue-600 underline">here</Link>.</p>

        {/** 
        <form className="grid gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
          </div>

          <button type="submit">Register</button>
        </form>
        */}
      </main>

      <Footer />
    </div>

    /*
    <>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">OK</button>
      </form>
    </>
    */
  );
}
