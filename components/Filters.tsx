"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type FiltersState = {
  q: string;
  species: string;
  shiny: "any" | "true" | "false";
  hiddenAbility: "any" | "true" | "false";
  gender: string;
  nature: string;
  move: string;
  minIv: number;
  minTotalIv: number;
  sort: "new" | "level_desc" | "level_asc" | "iv_desc";
};

const DEBOUNCE_MS = 400;
const TEXT_KEYS = new Set(["q", "species", "move", "nature"]);

function isOnlyTextPatch(patch: Partial<FiltersState>): boolean {
  return Object.keys(patch).every((k) => TEXT_KEYS.has(k));
}

export function Filters({
  initialFilters,
  urlKey,
  onChange,
}: {
  initialFilters: FiltersState;
  urlKey: string;
  onChange: (f: FiltersState) => void;
}) {
  const [f, setF] = useState<FiltersState>(initialFilters);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setF(initialFilters);
  }, [urlKey]);

  const scheduleOnChange = useCallback(
    (next: FiltersState) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        onChange(next);
      }, DEBOUNCE_MS);
    },
    [onChange]
  );

  function update(patch: Partial<FiltersState>) {
    const next = { ...f, ...patch };
    setF(next);
    if (isOnlyTextPatch(patch)) {
      scheduleOnChange(next);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onChange(next);
    }
  }

  const canIv = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  const canTotal = useMemo(() => Array.from({ length: 187 }, (_, i) => i), []);

  const reset: FiltersState = useMemo(
    () => ({
      q: "",
      species: "",
      shiny: "any",
      hiddenAbility: "any",
      gender: "",
      nature: "",
      move: "",
      minIv: 0,
      minTotalIv: 0,
      sort: "new",
    }),
    []
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label htmlFor="filter-q" className="sr-only">
          Recherche
        </label>
        <input
          id="filter-q"
          value={f.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Recherche (espèce, surnom, nature...)"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Recherche"
        />

        <label htmlFor="filter-species" className="sr-only">
          Espèce
        </label>
        <input
          id="filter-species"
          value={f.species}
          onChange={(e) => update({ species: e.target.value })}
          placeholder="Espèce (ex: sneasel)"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Espèce"
        />

        <label htmlFor="filter-move" className="sr-only">
          Attaque contient
        </label>
        <input
          id="filter-move"
          value={f.move}
          onChange={(e) => update({ move: e.target.value })}
          placeholder="Attaque contient (ex: ruse)"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Attaque contient"
        />

        <label htmlFor="filter-nature" className="sr-only">
          Nature
        </label>
        <input
          id="filter-nature"
          value={f.nature}
          onChange={(e) => update({ nature: e.target.value })}
          placeholder="Nature (ex: naive)"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Nature"
        />

        <label htmlFor="filter-gender" className="sr-only">
          Genre
        </label>
        <select
          id="filter-gender"
          value={f.gender}
          onChange={(e) => update({ gender: e.target.value })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Genre"
        >
          <option value="">Genre (tous)</option>
          <option value="MALE">Mâle</option>
          <option value="FEMALE">Femelle</option>
          <option value="GENDERLESS">Sans genre</option>
        </select>

        <label htmlFor="filter-shiny" className="sr-only">
          Chromatique
        </label>
        <select
          id="filter-shiny"
          value={f.shiny}
          onChange={(e) => update({ shiny: e.target.value as FiltersState["shiny"] })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Chromatique"
        >
          <option value="any">Chromatique (tous)</option>
          <option value="true">Chromatique uniquement</option>
          <option value="false">Non chromatique</option>
        </select>

        <label htmlFor="filter-hiddenAbility" className="sr-only">
          Talent caché
        </label>
        <select
          id="filter-hiddenAbility"
          value={f.hiddenAbility}
          onChange={(e) => update({ hiddenAbility: e.target.value as FiltersState["hiddenAbility"] })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Talent caché"
        >
          <option value="any">Talent caché (tous)</option>
          <option value="true">Talent caché uniquement</option>
          <option value="false">Sans talent caché</option>
        </select>

        <label htmlFor="filter-minIv" className="sr-only">
          IV minimum par stat
        </label>
        <select
          id="filter-minIv"
          value={String(f.minIv)}
          onChange={(e) => update({ minIv: Number(e.target.value) })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="IV minimum (toutes stats)"
        >
          {canIv.map((i) => (
            <option key={i} value={i}>
              IV min (toutes stats) ≥ {i}
            </option>
          ))}
        </select>

        <label htmlFor="filter-minTotalIv" className="sr-only">
          IV total minimum
        </label>
        <select
          id="filter-minTotalIv"
          value={String(f.minTotalIv)}
          onChange={(e) => update({ minTotalIv: Number(e.target.value) })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="IV total minimum"
        >
          {canTotal.map((i) => (
            <option key={i} value={i}>
              IV total ≥ {i}
            </option>
          ))}
        </select>

        <label htmlFor="filter-sort" className="sr-only">
          Tri
        </label>
        <select
          id="filter-sort"
          value={f.sort}
          onChange={(e) => update({ sort: e.target.value as FiltersState["sort"] })}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          aria-label="Tri"
        >
          <option value="new">Tri: plus récents</option>
          <option value="level_desc">Tri: niveau décroissant</option>
          <option value="level_asc">Tri: niveau croissant</option>
          <option value="iv_desc">Tri: IV attaque décroissant</option>
        </select>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          onClick={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setF(reset);
            onChange(reset);
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
