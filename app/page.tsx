"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filters, FiltersState } from "@/components/Filters";
import { PokemonCard } from "@/components/PokemonCard";
import { buildQuery, parseQuery } from "@/lib/filters";
import type { PokemonListing } from "@/types/pokemon";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters = useMemo(() => parseQuery(searchParams), [searchParams]);
  const urlKey = searchParams.toString();
  const initialFiltersRef = useRef(initialFilters);
  initialFiltersRef.current = initialFilters;

  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [data, setData] = useState<PokemonListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(
    () => buildQuery(filters ?? initialFilters),
    [filters, urlKey]
  );

  const handleFiltersChange = useCallback(
    (f: FiltersState) => {
      setFilters(f);
      setError(null);
      const query = buildQuery(f);
      const path = query ? `?${query}` : window.location.pathname;
      router.replace(path, { scroll: false });
    },
    [router]
  );

  // Sync page filters when URL changes (e.g. browser back)
  useEffect(() => {
    setFilters(initialFiltersRef.current);
  }, [urlKey]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pokemon?${qs}`);
        const out = await res.json();
        if (!res.ok) throw new Error(out?.error || `Erreur ${res.status}`);
        if (!cancelled) setData(out?.data || []);
      } catch (e) {
        if (!cancelled) {
          setData([]);
          setError(e instanceof Error ? e.message : "Impossible de charger les Pokémon.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  const showEmpty = !loading && !error && data.length === 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Cobblemon Market</h1>
          <p className="text-zinc-300 mt-1">
            Vitrine des cobblemons vendus par Ruael
          </p>
        </div>
        <a className="text-sm text-zinc-300 hover:text-white underline" href="/admin">
          Admin
        </a>
      </header>

      <section className="mt-6">
        <Filters
          initialFilters={initialFilters}
          urlKey={urlKey}
          onChange={handleFiltersChange}
        />
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between text-sm text-zinc-300">
          <div>
            {loading && "Chargement..."}
            {error && <span className="text-red-400">{error}</span>}
            {!loading && !error && `${data.length} résultat(s)`}
          </div>
          {error && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-zinc-300 hover:text-white underline"
            >
              Réessayer
            </button>
          )}
        </div>

        {showEmpty && (
          <p className="mt-4 text-zinc-400">
            Aucun Pokémon ne correspond à ces critères.
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((p) => (
            <PokemonCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-zinc-400">Chargement...</p>
        </main>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
