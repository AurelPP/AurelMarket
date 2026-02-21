/**
 * Mapping des noms d'espèces français (slug, minuscules) vers le slug anglais PokeAPI.
 * Utilisé quand l'API pokemon/{slug} renvoie 404 (PokeAPI n'accepte que l'anglais ou l'id).
 * On peut étendre cette liste au besoin ou la générer via PokeAPI pokemon-species.
 */
const speciesFrToEn: Record<string, string> = {
  sapereau: "bunnelby",
  saperaud: "diggersby",
  flabébé: "flabebe",
  // À compléter au besoin (ex: script qui interroge PokeAPI pokemon-species)
};

export function getEnglishSpeciesSlug(speciesSlug: string): string | undefined {
  const key = speciesSlug.toLowerCase().trim();
  return speciesFrToEn[key];
}
