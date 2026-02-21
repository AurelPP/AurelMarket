import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

type ExportPokemon = {
  uuid?: string;
  species: string;
  nickname?: string | Record<string, unknown>;
  level: number;
  shiny: boolean;
  gender?: string;
  ability?: string;
  abilityType?: string; // "hidden" = talent caché
  isHiddenAbility?: boolean;
  nature?: string;
  friendship?: number;
  caughtBall?: string;
  current_hp?: number;
  max_hp?: number;
  stats?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  ivs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  evs?: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  moves?: string[];
};

/** Extrait le surnom affichable : string ou objet Cobblemon (ex. field_39005.comp_737). */
function nicknameString(nickname: string | Record<string, unknown> | null | undefined): string | null {
  if (nickname == null) return null;
  if (typeof nickname === "string") return nickname.trim() || null;
  if (typeof nickname !== "object") return null;
  const f = (nickname as Record<string, unknown>).field_39005 as Record<string, unknown> | undefined;
  const comp = f?.comp_737;
  if (typeof comp === "string") return comp.trim() || null;
  return null;
}

function fingerprintOf(p: ExportPokemon) {
  const payload = {
    uuid: p.uuid || null,
    species: p.species,
    level: p.level,
    shiny: !!p.shiny,
    nature: p.nature || null,
    ability: p.ability || null,
    gender: p.gender || null,
    nickname: nicknameString(p.nickname),
    ivs: p.ivs || {},
    evs: p.evs || {},
    moves: (p.moves || []).slice().sort(),
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const arr: ExportPokemon[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.pokemon)
      ? body.pokemon
      : null;

    if (!arr) {
      return NextResponse.json({ ok: false, error: "JSON invalide: attendu un tableau de Pokémon." }, { status: 400 });
    }

    let upserted = 0;

    for (const p of arr) {
      if (!p?.species || typeof p.level !== "number") continue;

      const fp = fingerprintOf(p);
      const moves = Array.isArray(p.moves) ? p.moves : [];
      const raw = JSON.stringify(p);

      // Prefer upsert by exportUuid when present
      if (p.uuid && typeof p.uuid === "string") {
        await prisma.pokemonListing.upsert({
          where: { exportUuid: p.uuid },
          update: {
            fingerprint: fp,
            species: p.species,
            nickname: nicknameString(p.nickname),
            level: p.level,
            shiny: !!p.shiny,
            gender: p.gender || null,
            ability: p.ability || null,
            isHiddenAbility: p.isHiddenAbility === true || p.abilityType === "hidden" ? true : null,
            nature: p.nature || null,
            friendship: typeof p.friendship === "number" ? p.friendship : null,
            caughtBall: p.caughtBall || null,
            current_hp: typeof p.current_hp === "number" ? p.current_hp : null,
            max_hp: typeof p.max_hp === "number" ? p.max_hp : null,

            hp: p.stats?.hp ?? null,
            atk: p.stats?.atk ?? null,
            def: p.stats?.def ?? null,
            spa: p.stats?.spa ?? null,
            spd: p.stats?.spd ?? null,
            spe: p.stats?.spe ?? null,

            iv_hp: p.ivs?.hp ?? null,
            iv_atk: p.ivs?.atk ?? null,
            iv_def: p.ivs?.def ?? null,
            iv_spa: p.ivs?.spa ?? null,
            iv_spd: p.ivs?.spd ?? null,
            iv_spe: p.ivs?.spe ?? null,

            ev_hp: p.evs?.hp ?? null,
            ev_atk: p.evs?.atk ?? null,
            ev_def: p.evs?.def ?? null,
            ev_spa: p.evs?.spa ?? null,
            ev_spd: p.evs?.spd ?? null,
            ev_spe: p.evs?.spe ?? null,

            movesJson: JSON.stringify(moves),
            rawJson: raw,
          },
          create: {
            exportUuid: p.uuid,
            fingerprint: fp,
            species: p.species,
            nickname: nicknameString(p.nickname),
            level: p.level,
            shiny: !!p.shiny,
            gender: p.gender || null,
            ability: p.ability || null,
            isHiddenAbility: p.isHiddenAbility === true || p.abilityType === "hidden" ? true : null,
            nature: p.nature || null,
            friendship: typeof p.friendship === "number" ? p.friendship : null,
            caughtBall: p.caughtBall || null,
            current_hp: typeof p.current_hp === "number" ? p.current_hp : null,
            max_hp: typeof p.max_hp === "number" ? p.max_hp : null,

            hp: p.stats?.hp ?? null,
            atk: p.stats?.atk ?? null,
            def: p.stats?.def ?? null,
            spa: p.stats?.spa ?? null,
            spd: p.stats?.spd ?? null,
            spe: p.stats?.spe ?? null,

            iv_hp: p.ivs?.hp ?? null,
            iv_atk: p.ivs?.atk ?? null,
            iv_def: p.ivs?.def ?? null,
            iv_spa: p.ivs?.spa ?? null,
            iv_spd: p.ivs?.spd ?? null,
            iv_spe: p.ivs?.spe ?? null,

            ev_hp: p.evs?.hp ?? null,
            ev_atk: p.evs?.atk ?? null,
            ev_def: p.evs?.def ?? null,
            ev_spa: p.evs?.spa ?? null,
            ev_spd: p.evs?.spd ?? null,
            ev_spe: p.evs?.spe ?? null,

            movesJson: JSON.stringify(moves),
            rawJson: raw,
          },
        });
      } else {
        await prisma.pokemonListing.upsert({
          where: { fingerprint: fp },
          update: {
            species: p.species,
            nickname: nicknameString(p.nickname),
            level: p.level,
            shiny: !!p.shiny,
            gender: p.gender || null,
            ability: p.ability || null,
            isHiddenAbility: p.isHiddenAbility === true || p.abilityType === "hidden" ? true : null,
            nature: p.nature || null,
            friendship: typeof p.friendship === "number" ? p.friendship : null,
            caughtBall: p.caughtBall || null,
            current_hp: typeof p.current_hp === "number" ? p.current_hp : null,
            max_hp: typeof p.max_hp === "number" ? p.max_hp : null,

            hp: p.stats?.hp ?? null,
            atk: p.stats?.atk ?? null,
            def: p.stats?.def ?? null,
            spa: p.stats?.spa ?? null,
            spd: p.stats?.spd ?? null,
            spe: p.stats?.spe ?? null,

            iv_hp: p.ivs?.hp ?? null,
            iv_atk: p.ivs?.atk ?? null,
            iv_def: p.ivs?.def ?? null,
            iv_spa: p.ivs?.spa ?? null,
            iv_spd: p.ivs?.spd ?? null,
            iv_spe: p.ivs?.spe ?? null,

            ev_hp: p.evs?.hp ?? null,
            ev_atk: p.evs?.atk ?? null,
            ev_def: p.evs?.def ?? null,
            ev_spa: p.evs?.spa ?? null,
            ev_spd: p.evs?.spd ?? null,
            ev_spe: p.evs?.spe ?? null,

            movesJson: JSON.stringify(moves),
            rawJson: raw,
          },
          create: {
            fingerprint: fp,
            species: p.species,
            nickname: nicknameString(p.nickname),
            level: p.level,
            shiny: !!p.shiny,
            gender: p.gender || null,
            ability: p.ability || null,
            isHiddenAbility: p.isHiddenAbility === true || p.abilityType === "hidden" ? true : null,
            nature: p.nature || null,
            friendship: typeof p.friendship === "number" ? p.friendship : null,
            caughtBall: p.caughtBall || null,
            current_hp: typeof p.current_hp === "number" ? p.current_hp : null,
            max_hp: typeof p.max_hp === "number" ? p.max_hp : null,

            hp: p.stats?.hp ?? null,
            atk: p.stats?.atk ?? null,
            def: p.stats?.def ?? null,
            spa: p.stats?.spa ?? null,
            spd: p.stats?.spd ?? null,
            spe: p.stats?.spe ?? null,

            iv_hp: p.ivs?.hp ?? null,
            iv_atk: p.ivs?.atk ?? null,
            iv_def: p.ivs?.def ?? null,
            iv_spa: p.ivs?.spa ?? null,
            iv_spd: p.ivs?.spd ?? null,
            iv_spe: p.ivs?.spe ?? null,

            ev_hp: p.evs?.hp ?? null,
            ev_atk: p.evs?.atk ?? null,
            ev_def: p.evs?.def ?? null,
            ev_spa: p.evs?.spa ?? null,
            ev_spd: p.evs?.spd ?? null,
            ev_spe: p.evs?.spe ?? null,

            movesJson: JSON.stringify(moves),
            rawJson: raw,
          },
        });
      }

      upserted++;
    }

    return NextResponse.json({ ok: true, upserted });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}
