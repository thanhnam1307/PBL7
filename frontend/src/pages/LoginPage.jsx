import { useState } from "react";
import { login } from "../api/authApi";

export default function LoginPage({ onAuthenticated }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const token = await login(username, password);
      onAuthenticated(token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-md border border-white/10 bg-bg-2 p-5">
        <h1 className="font-display text-xl font-bold text-white">Operator Login</h1>
        <label className="mt-4 block text-[11px] uppercase tracking-widest text-white/35">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-bg px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="mt-3 block text-[11px] uppercase tracking-widest text-white/35">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-bg px-3 py-2 text-sm text-white"
          />
        </label>
        <button className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-bg">
          Sign In
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      </form>
    </div>
  );
}
