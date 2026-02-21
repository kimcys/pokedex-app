export interface NamedAPIResource {
    name: string;
    url: string;
}

export interface NamedAPIResourceList<T = NamedAPIResource> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
export interface PokemonListItem {
    name: string;
    url: string;
}

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: {
        front_default: string;
        other: {
            'official-artwork': {
                front_default: string;
            };
            showdown?: {
                front_default: string | null;
                front_shiny?: string | null;
                back_default?: string | null;
                back_shiny?: string | null;
            };
        };
    };
    types: {
        slot: number;
        type: NamedAPIResource;
    }[];
    stats: {
        base_stat: number;
        stat: NamedAPIResource;
    }[];
    abilities: {
        ability: NamedAPIResource;
    }[];
    species: NamedAPIResource;
}

export type PokemonTypeListResponse = NamedAPIResourceList<NamedAPIResource>;

export interface PokemonByTypeEntry {
    slot: number;
    pokemon: NamedAPIResource;
}

export interface PokemonTypeResponse {
    id: number;
    name: string;
    pokemon: PokemonByTypeEntry[];
}

export interface PokemonSpeciesResponse {
    id: number;
    name: string;
    evolution_chain: {
        url: string;
    };
}

export interface EvolutionDetail {
    min_level?: number | null;
    item?: NamedAPIResource | null;
    trigger?: NamedAPIResource | null;
    min_happiness?: number | null;
    min_beauty?: number | null;
    min_affection?: number | null;
    time_of_day?: string;
    known_move?: NamedAPIResource | null;
    known_move_type?: NamedAPIResource | null;
    location?: NamedAPIResource | null;
}

export interface EvolutionChainLink {
    species: NamedAPIResource;
    evolution_details: EvolutionDetail[];
    evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
    id: number;
    chain: EvolutionChainLink;
}

export interface EvolutionChain {
    name: string;
    url: string;
    level: number;
    minLevel: number | null;
    item: string | null;
}