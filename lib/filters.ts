import type { FiltersState } from "@/components/Filters";

const defaultFilters: FiltersState = {
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
};

export function buildQuery(f: FiltersState): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.species) sp.set("species", f.species);
  if (f.nature) sp.set("nature", f.nature);
  if (f.gender) sp.set("gender", f.gender);
  if (f.move) sp.set("move", f.move);
  if (f.shiny !== "any") sp.set("shiny", f.shiny);
  if (f.hiddenAbility !== "any") sp.set("hiddenAbility", f.hiddenAbility);
  if (f.minIv > 0) sp.set("minIv", String(f.minIv));
  if (f.minTotalIv > 0) sp.set("minTotalIv", String(f.minTotalIv));
  sp.set("sort", f.sort);
  return sp.toString();
}

function toInt(v: string | null): number {
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseQuery(searchParams: URLSearchParams): FiltersState {
  const sort = searchParams.get("sort");
  const validSort: FiltersState["sort"] =
    sort === "level_desc" || sort === "level_asc" || sort === "iv_desc" ? sort : "new";

  const hiddenAbility = searchParams.get("hiddenAbility");
  const validHidden: FiltersState["hiddenAbility"] =
    hiddenAbility === "true" || hiddenAbility === "false" ? hiddenAbility : "any";

  return {
    q: searchParams.get("q") ?? "",
    species: searchParams.get("species") ?? "",
    shiny: searchParams.get("shiny") === "true" ? "true" : searchParams.get("shiny") === "false" ? "false" : "any",
    hiddenAbility: validHidden,
    gender: searchParams.get("gender") ?? "",
    nature: searchParams.get("nature") ?? "",
    move: searchParams.get("move") ?? "",
    minIv: toInt(searchParams.get("minIv")),
    minTotalIv: toInt(searchParams.get("minTotalIv")),
    sort: validSort,
  };
}

export { defaultFilters };
