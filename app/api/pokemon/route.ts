import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEnglishSpeciesSlug } from "@/lib/species-fr-to-en";

export const dynamic = "force-dynamic";

function toInt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slug(s: string): string {
  return (s || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/_/g, "-");
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q = url.searchParams.get("q")?.trim().toLowerCase() || "";
  const speciesParam = url.searchParams.get("species")?.trim() || "";
  const shiny = url.searchParams.get("shiny");
  const hiddenAbility = url.searchParams.get("hiddenAbility");
  const gender = url.searchParams.get("gender") || "";
  const nature = url.searchParams.get("nature")?.trim().toLowerCase() || "";
  const move = url.searchParams.get("move")?.trim().toLowerCase() || "";

  const minIvAll = toInt(url.searchParams.get("minIv"));      // all stats >=
  const minTotalIv = toInt(url.searchParams.get("minTotalIv")); // sum >=
  const sort = url.searchParams.get("sort") || "new";

  const where: any = {};

  if (q) {
    const qSlug = slug(q);
    const enSlug = getEnglishSpeciesSlug(qSlug);
    where.OR = [
      { species: { contains: q } },
      { nickname: { contains: q } },
      { nature: { contains: q } },
    ];
    if (enSlug) {
      where.OR.push({ species: { contains: enSlug } });
    }
  }
  if (speciesParam) {
    const speciesSlug = slug(speciesParam);
    const enSlug = getEnglishSpeciesSlug(speciesSlug);
    where.species = enSlug
      ? { contains: enSlug }
      : { contains: speciesSlug };
  }
  if (nature) where.nature = { contains: nature };
  if (gender) where.gender = gender;
  if (shiny === "true") where.shiny = true;
  if (shiny === "false") where.shiny = false;
  if (hiddenAbility === "true") where.isHiddenAbility = true;
  if (hiddenAbility === "false") where.NOT = { isHiddenAbility: true };

  if (move) where.movesJson = { contains: move };

  const and: any[] = [];

  if (minIvAll !== null) {
    and.push(
      { iv_hp: { gte: minIvAll } },
      { iv_atk: { gte: minIvAll } },
      { iv_def: { gte: minIvAll } },
      { iv_spa: { gte: minIvAll } },
      { iv_spd: { gte: minIvAll } },
      { iv_spe: { gte: minIvAll } },
    );
  }

  // Prisma SQLite doesn't do computed sum easily; we can filter client-side later.
  if (and.length) where.AND = and;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "level_desc") orderBy = { level: "desc" };
  if (sort === "level_asc") orderBy = { level: "asc" };
  if (sort === "iv_desc") orderBy = { iv_atk: "desc" };

  let data = await prisma.pokemonListing.findMany({
    where,
    orderBy,
    take: 1000,
  });

  if (minTotalIv !== null) {
    data = data.filter((p) => {
      const vals = [p.iv_hp, p.iv_atk, p.iv_def, p.iv_spa, p.iv_spd, p.iv_spe].map((x: any) => (typeof x === "number" ? x : 0));
      const sum = vals.reduce((a, b) => a + b, 0);
      return sum >= minTotalIv;
    });
  }

  return NextResponse.json({ ok: true, data });
}
