import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import { apiFetch } from "./api/helper";
import Register from "./components/Register";
import Login from "./components/Login";
import TodoApp from "./components/TodoApp";
import PageLayout from "./components/PageLayout";

function App() {
  const [user, setUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {

      const data = await apiFetch("/me");

      setUser(data.user ? data.user : null);
    }

    checkAuth();
  }, []);

  /*
  const handleRegister = async () => {
    navigate("/login")
  };
  */

  const handleLogout = async () => {
    await apiFetch("/logout", { method: "POST" });
    setUser(null);
    navigate("/login");
  };

  if (user === undefined) return <div>Loading...</div>

  return (
    <Routes>
      <Route 
        path="/register"
        element={
          user ? <Navigate to="/" /> : <PageLayout><Register onRegister={setUser} /></PageLayout>
        }
      />

      <Route
        path="/login"
        element={
          user ? <Navigate to="/" /> : <PageLayout><Login onLogin={setUser} /></PageLayout>
        }
      />

      <Route 
        path="/"
        element={
          // Navigate to login page if no user
          user ? <PageLayout user={user} onLogout={() => handleLogout()}><TodoApp /></PageLayout> : <Navigate to="/login" />
        }
      />
    </Routes>

    /*
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />

      <Route 
        path="/"
        element={
          // Navigate to login page if no user
          user ? <TodoApp /> : <Navigate to="/login" />
        }
      />
    </Routes>
    */
  );

  /*
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {

      // const res = await apiFetch("/me");
      // setIsAuthenticated(res.ok);

      const data = await apiFetch("/me");

      if (data.userId) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  if (!isAuthenticated) {
    // Set user as authenticated if login successful
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return <TodoApp />;
  */
}

export default App;
