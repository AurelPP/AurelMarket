"use client";

import { useEffect, useState } from "react";
import type { PokemonListing } from "@/types/pokemon";
import { useTranslation, displayName } from "@/hooks/useTranslation";

function cap(s?: string | null) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Couleur IV : 0 = rouge → 31 = vert (HSL)
function ivColor(iv: number | null): string {
  if (iv === null || typeof iv !== "number") return "rgb(113 113 122)";
  const t = Math.max(0, Math.min(31, iv)) / 31;
  const hue = t * 120;
  return `hsl(${hue}, 70%, 45%)`;
}

function ivLine(p: PokemonListing) {
  const stats = [
    { key: "hp", v: p.iv_hp },
    { key: "atk", v: p.iv_atk },
    { key: "def", v: p.iv_def },
    { key: "spa", v: p.iv_spa },
    { key: "spd", v: p.iv_spd },
    { key: "spe", v: p.iv_spe },
  ] as const;
  const sum = stats.reduce((a, { v }) => a + (typeof v === "number" ? v : 0), 0);
  return { stats, sum };
}

function evLine(p: PokemonListing) {
  const v = [p.ev_hp, p.ev_atk, p.ev_def, p.ev_spa, p.ev_spd, p.ev_spe].map((x) => (x ?? "?"));
  const sum = [p.ev_hp, p.ev_atk, p.ev_def, p.ev_spa, p.ev_spd, p.ev_spe]
    .map((x) => (typeof x === "number" ? x : 0))
    .reduce((a, b) => a + b, 0);
  return `EV ${v.join("/")} • Total ${sum}`;
}

function spriteApiUrl(species: string, shiny: boolean): string {
  const name = (species || "").trim();
  if (!name) return "";
  const params = new URLSearchParams({ species: name });
  if (shiny) params.set("shiny", "1");
  return `/api/sprite?${params.toString()}`;
}

const STAT_LABELS: Record<string, string> = {
  hp: "PV",
  atk: "Atq",
  def: "Déf",
  spa: "Atq.Sp",
  spd: "Déf.Sp",
  spe: "Vit",
};

export function PokemonCard({ p }: { p: PokemonListing }) {
  const [spriteError, setSpriteError] = useState(false);
  const [speciesFr, setSpeciesFr] = useState<string | null>(null);
  const [abilityFr, setAbilityFr] = useState<string | null>(null);
  const [natureFr, setNatureFr] = useState<string | null>(null);
  const [movesFr, setMovesFr] = useState<Record<string, string>>({});
  const [computedHiddenAbility, setComputedHiddenAbility] = useState<boolean | null>(null);

  const { load } = useTranslation();

  const isHiddenAbility = p.isHiddenAbility === true || computedHiddenAbility === true;

  const moves: string[] = (() => {
    try {
      return JSON.parse(p.movesJson || "[]");
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    load("species", p.species).then(setSpeciesFr);
    load("ability", p.ability).then(setAbilityFr);
    load("nature", p.nature).then(setNatureFr);
  }, [p.species, p.ability, p.nature, load]);

  useEffect(() => {
    moves.slice(0, 8).forEach((m) => {
      if (m && !movesFr[m]) {
        load("move", m).then((fr) => {
          if (fr) setMovesFr((prev) => ({ ...prev, [m]: fr }));
        });
      }
    });
  }, [moves.join(","), load]);

  useEffect(() => {
    if (p.isHiddenAbility !== null || !p.species || !p.ability) return;
    fetch(
      `/api/ability-is-hidden?species=${encodeURIComponent(p.species)}&ability=${encodeURIComponent(p.ability)}`
    )
      .then((r) => r.json())
      .then((data: { hidden?: boolean }) => setComputedHiddenAbility(!!data.hidden))
      .catch(() => setComputedHiddenAbility(false));
  }, [p.species, p.ability, p.isHiddenAbility]);

  const { stats: ivStats, sum: ivSum } = ivLine(p);
  const spriteUrl = spriteApiUrl(p.species, p.shiny);

  const displaySpecies = displayName(speciesFr, p.species);
  const displayAbility = displayName(abilityFr, p.ability);
  const displayNature = displayName(natureFr, p.nature);

  return (
    <div
      className={`rounded-2xl border p-4 transition hover:bg-zinc-900/60 ${
        p.shiny
          ? "border-amber-400/60 bg-amber-950/30 ring-1 ring-amber-400/30"
          : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {spriteUrl && !spriteError ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-900">
              <img
                key={`${p.id}-${p.shiny}`}
                src={spriteUrl}
                alt={displaySpecies || cap(p.species)}
                className="h-full w-full object-contain"
                onError={() => setSpriteError(true)}
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-800 text-2xl text-zinc-500">
              ?
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">
                {displaySpecies || cap(p.species)} {p.shiny ? "✨" : ""}
              </div>
              <div className="text-sm text-zinc-300">
                {p.nickname ? <span className="text-zinc-200">« {p.nickname} »</span> : null}
                {p.nickname ? " • " : ""}
                Nv. {p.level}
                {p.gender ? ` • ${p.gender === "MALE" ? "Mâle" : p.gender === "FEMALE" ? "Femelle" : "Sans genre"}` : ""}
              </div>
              {p.caughtBall ? (
                <div className="mt-1 text-xs text-zinc-400">Poké Ball : {p.caughtBall}</div>
              ) : null}
            </div>

            <div className="text-right text-sm text-zinc-300">
              {p.ability ? (
                <div>
                  Talent :{" "}
                  {isHiddenAbility ? (
                    <span
                      className="inline-flex items-center gap-1 rounded bg-amber-500/25 px-1.5 py-0.5 font-medium text-amber-300"
                      title="Talent caché"
                    >
                      {displayAbility || cap(p.ability)} ★
                    </span>
                  ) : (
                    <span className="text-zinc-100">{displayAbility || cap(p.ability)}</span>
                  )}
                </div>
              ) : null}
              {p.nature ? (
                <div>
                  Nature : <span className="text-zinc-100">{displayNature || cap(p.nature)}</span>
                </div>
              ) : null}
              {typeof p.friendship === "number" ? (
                <div className="text-xs text-zinc-400">Bonheur : {p.friendship}</div>
              ) : null}
            </div>
          </div>

          {/* IV : une ligne simple, espace garanti entre libellé et valeur */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-zinc-300">
            {ivStats.map(({ key, v }) => (
              <span key={key} className="shrink-0">
                <span className="text-zinc-500">{STAT_LABELS[key]}</span>{" "}
                <span
                  className="tabular-nums font-medium"
                  style={{ color: ivColor(v) }}
                  title={`IV ${key} = ${v ?? "?"}`}
                >
                  {v ?? "?"}
                </span>
              </span>
            ))}
            <span className="shrink-0 text-zinc-400">Total {ivSum}</span>
          </div>
          <div className="mt-1 text-xs text-zinc-400">{evLine(p)}</div>

          {moves.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {moves.slice(0, 8).map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-200"
                  title={m}
                >
                  {movesFr[m] ? cap(movesFr[m]) : cap(m)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
