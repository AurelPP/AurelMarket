"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const out = await res.json();
      if (!res.ok) {
        setError(out?.error || "Identifiant ou mot de passe incorrect");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <h1 className="text-xl font-semibold">Connexion admin</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Identifiants définis dans les variables d’environnement (ADMIN_USER / ADMIN_PASSWORD).
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-300">Identifiant</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              placeholder="admin"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-300">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </label>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-700 px-4 py-3 font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <a href="/" className="text-sm text-zinc-400 hover:text-white underline">
            Retour à la vitrine
          </a>
        </p>
      </div>
    </main>
  );
}
