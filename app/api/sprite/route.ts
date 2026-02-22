import { NextResponse } from "next/server";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

type PokemonSprites = {
  id: number;
  sprites?: {
    front_default?: string | null;
    front_shiny?: string | null;
  };
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const species = url.searchParams
    .get("species")
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-");
  const shiny = url.searchParams.get("shiny") === "1" || url.searchParams.get("shiny") === "true";
  if (!species) {
    return NextResponse.json({ error: "species requis" }, { status: 400 });
  }
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(species)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ error: "Inconnu" }, { status: 404 });
    const data = (await res.json()) as PokemonSprites;
    let spriteUrl: string;
    if (shiny) {
      spriteUrl =
        data.sprites?.front_shiny ?? `${SPRITE_BASE}/shiny/${data.id}.png`;
    } else {
      spriteUrl =
        data.sprites?.front_default ?? `${SPRITE_BASE}/${data.id}.png`;
    }
    const redirect = NextResponse.redirect(spriteUrl);
    redirect.headers.set("Cache-Control", "public, max-age=86400");
    return redirect;
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
