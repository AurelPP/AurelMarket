"use client";

import { useCallback, useEffect, useState } from "react";

type AdminPokemon = {
  id: string;
  species: string;
  nickname: string | null;
  level: number;
  shiny: boolean;
  exportUuid: string | null;
  createdAt: string;
};

const fetchOpts: RequestInit = { credentials: "include" };

export default function AdminPage() {
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<AdminPokemon[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/pokemon", fetchOpts);
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Erreur");
      setList(out.data || []);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Impossible de charger la liste");
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function onUpload(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMsg("");

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Échec de l'import");

      setMsg(`✅ Import OK : ${out.upserted} Pokémon ajoutés ou mis à jour`);
      loadList();
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Erreur"}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer ce Pokémon du site ?")) return;
    try {
      const res = await fetch(`/api/admin/pokemon/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Erreur");
      setList((prev) => prev.filter((x) => x.id !== id));
      setMsg("✅ Pokémon supprimé.");
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Erreur"}`);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin • Upload et gestion</h1>
        <div className="flex items-center gap-4">
          <a className="text-sm text-zinc-300 hover:text-white underline" href="/">
            Voir la vitrine
          </a>
          <a className="text-sm text-zinc-400 hover:text-white underline" href="/api/admin/logout">
            Déconnexion
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-zinc-300">
          Envoie le JSON exporté par Cobblemon (tableau de Pokémon).
        </p>

        <label className="mt-4 block">
          <span className="text-sm text-zinc-200">Fichier JSON</span>
          <input
            disabled={busy}
            type="file"
            accept="application/json,.json"
            className="mt-2 block w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </label>

        {msg && <div className="mt-4 text-sm">{msg}</div>}

        <div className="mt-5 text-xs text-zinc-400">
          Tu peux importer plusieurs fichiers à la suite ; les doublons sont évités par UUID ou empreinte.
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold">Gérer les Pokémon</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Derniers 500 enregistrements. Clique sur « Supprimer » pour retirer un Pokémon du site.
        </p>

        {listLoading && <p className="mt-4 text-sm text-zinc-400">Chargement…</p>}
        {listError && <p className="mt-4 text-sm text-red-400">{listError}</p>}

        {!listLoading && !listError && list.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-400">
                  <th className="pb-2 pr-4">Espèce</th>
                  <th className="pb-2 pr-4">Surnom</th>
                  <th className="pb-2 pr-4">Niv.</th>
                  <th className="pb-2 pr-4">Chromatique</th>
                  <th className="pb-2 pr-4">UUID</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800">
                    <td className="py-2 pr-4 font-medium">{row.species}</td>
                    <td className="py-2 pr-4 text-zinc-300">{row.nickname ?? "—"}</td>
                    <td className="py-2 pr-4">{row.level}</td>
                    <td className="py-2 pr-4">{row.shiny ? "✨" : "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                      {row.exportUuid ? `${row.exportUuid.slice(0, 8)}…` : "—"}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="rounded border border-red-900/50 bg-red-950/30 px-2 py-1 text-xs text-red-300 hover:bg-red-900/40"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!listLoading && !listError && list.length === 0 && (
          <p className="mt-4 text-zinc-500">Aucun Pokémon en base.</p>
        )}
      </div>
    </main>
  );
}
