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
            }
        }
    };
    types: {
        slot: number;
        type: {
            name: string;
        }
    }[];
    stats: {
        base_stat: number;
        stat: {
            name: string;
        }
    }[];
    abilities: {
        ability: {
            name: string;
        }
    }[];
    species: {
        name: string;
        url: string;
    };
}

export interface EvolutionChain {
    name: string;
    url: string;
    level: number;
    minLevel: number | null;
    item: string | null;
}


export interface EvolutionDetail {
    min_level?: number;
    item?: {
        name: string;
        url: string;
    };
    trigger?: {
        name: string;
        url: string;
    };
}

export interface EvolutionChainResponse {
    chain: {
        species: {
            name: string;
            url: string;
        };
        evolves_to: any[];
        evolution_details: EvolutionDetail[];
    };
}