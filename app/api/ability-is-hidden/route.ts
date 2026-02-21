import { NextResponse } from "next/server";
import { getEnglishSpeciesSlug } from "@/lib/species-fr-to-en";

type PokeName = { language: { name: string }; name: string };

function slug(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-");
}

function normalizeForCompare(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const species = url.searchParams.get("species")?.trim();
  const ability = url.searchParams.get("ability")?.trim();
  if (!species || !ability) {
    return NextResponse.json({ error: "species et ability requis" }, { status: 400 });
  }
  const speciesSlug = slug(species);
  const abilityNorm = normalizeForCompare(ability);
  if (!speciesSlug || !abilityNorm) return NextResponse.json({ hidden: false });

  try {
    let slugToUse = speciesSlug;
    let res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(slugToUse)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) {
      const enSlug = getEnglishSpeciesSlug(speciesSlug);
      if (enSlug) {
        res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(enSlug)}`,
          { next: { revalidate: 86400 } }
        );
        if (res.ok) slugToUse = enSlug;
      }
    }
    if (!res.ok) return NextResponse.json({ hidden: false });
    const data = (await res.json()) as {
      abilities?: Array<{
        is_hidden?: boolean;
        ability?: { name?: string; url?: string };
      }>;
    };
    const hiddenAbilities = data.abilities?.filter((a) => a.is_hidden) ?? [];
    for (const a of hiddenAbilities) {
      if (normalizeForCompare(a.ability?.name ?? "") === abilityNorm) {
        return NextResponse.json({ hidden: true });
      }
      if (!a.ability?.url) continue;
      const ar = await fetch(a.ability.url, { next: { revalidate: 86400 } });
      if (!ar.ok) continue;
      const abilityData = (await ar.json()) as { names?: PokeName[] };
      const frName = abilityData.names?.find((n) => n.language?.name === "fr")?.name;
      if (frName && normalizeForCompare(frName) === abilityNorm) {
        return NextResponse.json({ hidden: true });
      }
    }
    return NextResponse.json({ hidden: false });
  } catch {
    return NextResponse.json({ hidden: false });
  }
}
