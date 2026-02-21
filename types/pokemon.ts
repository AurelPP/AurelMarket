export type PokemonListing = {
  id: string;
  exportUuid: string | null;
  species: string;
  nickname: string | null;
  level: number;
  shiny: boolean;
  gender: string | null;
  ability: string | null;
  isHiddenAbility: boolean | null;
  nature: string | null;
  friendship: number | null;
  caughtBall: string | null;

  iv_hp: number | null;
  iv_atk: number | null;
  iv_def: number | null;
  iv_spa: number | null;
  iv_spd: number | null;
  iv_spe: number | null;

  ev_hp: number | null;
  ev_atk: number | null;
  ev_def: number | null;
  ev_spa: number | null;
  ev_spd: number | null;
  ev_spe: number | null;

  movesJson: string;
};
