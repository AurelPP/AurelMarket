import { NextResponse } from "next/server";

type PokeName = { language: { name: string }; name: string };

async function getFrenchName(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { names?: PokeName[] };
    const fr = data.names?.find((n) => n.language?.name === "fr");
    return fr?.name ?? null;
  } catch {
    return null;
  }
}

function slug(name: string): string {
  return (name || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/_/g, "-").replace(/-+/g, "-");
}

function slugAbilityOrMove(name: string): string {
  const s = (name || "").trim();
  if (!s) return "";
  const withHyphen = s
    .replace(/(?!^)([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-"); // collapse multiple hyphens (e.g. "Sludge  Bomb" -> "sludge-bomb")
  return withHyphen;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const name = url.searchParams.get("name")?.trim();
  if (!type || !name) {
    return NextResponse.json({ error: "type et name requis" }, { status: 400 });
  }
  const base = "https://pokeapi.co/api/v2";
  const s =
    type === "ability" || type === "move" ? slugAbilityOrMove(name) : slug(name);
  if (!s) return NextResponse.json({ fr: null });

  let apiUrl: string;
  switch (type) {
    case "species":
      apiUrl = `${base}/pokemon-species/${s}`;
      break;
    case "ability":
      apiUrl = `${base}/ability/${s}`;
      break;
    case "nature":
      apiUrl = `${base}/nature/${s}`;
      break;
    case "move":
      apiUrl = `${base}/move/${s}`;
      break;
    default:
      return NextResponse.json({ error: "type invalide" }, { status: 400 });
  }

  let fr = await getFrenchName(apiUrl);
  if (fr) return NextResponse.json({ fr });
  // PokeAPI slugs use hyphens (e.g. huge-power). Try common word boundaries.
  if ((type === "ability" || type === "move") && !s.includes("-")) {
    const suffixes = ["power", "eye", "armor", "body", "skin", "scale", "slap", "shot", "attack", "beam", "wave", "blast", "storm", "fang", "tail", "sight", "guard", "boost", "cutter", "sweep", "punch", "kick", "throw", "bomb", "link"];
    const path = type === "ability" ? "ability" : "move";
    for (const suf of suffixes) {
      if (s.endsWith(suf) && s.length > suf.length) {
        const withHyphen = `${s.slice(0, -suf.length)}-${suf}`;
        fr = await getFrenchName(`${base}/${path}/${withHyphen}`);
        if (fr) return NextResponse.json({ fr });
      }
    }
  }
  return NextResponse.json({ fr: null });
}
