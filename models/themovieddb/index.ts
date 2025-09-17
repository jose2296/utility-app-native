
export interface ThemoviedbItem {
    adult: boolean
    backdrop_path: string
    id: number
    title?: string
    name?: string
    original_language: string
    original_name: string
    overview: string
    poster_path: string
    media_type: string
    genre_ids: number[]
    popularity: number
    release_date?: string
    first_air_date?: string
    vote_average: number
    vote_count: number
    origin_country: string[]
}

export type ThemoviedbFixedItem = {
    themoviedbId: number,
    title: string;
    checked: boolean;
    image: string;
    type: 'movies' | 'series';
    released: string;
}

export type ThemoviedbFixedItemDetails = {
    themoviedbId: number;
    title: string;
    synopsis: string;
    tagline: string;
    status: string;
    image?: string;
    released: string;
    genres: string;

    time?: string;
    collection?: {
        id: number;
        name: string;
        overview: string;
        poster_path?: string;
        backdrop_path?: string;
        movies: {
            themoviedbId: number;
            title: string;
            image?: string;
            released: string;
            type: 'movies' | 'series';
        }[];
    }
    nextEpisodeToAir?: string;
    numberOfEpisodes?: number;
    numberOfSeasons?: number;
    images: string[];
    imagesBackdrops: string[];
    videos: {
        src: string;
        name: string;
    }[];
    score?: number;
    recommendations: {
        themoviedbId: number;
        title: string;
        image: string;
        released: string;
        type: 'movies' | 'series';
    }[];
}

export interface Genre {
    id: number
    name: string
}

export interface ProductionCompany {
    id: number
    logo_path?: string
    name: string
    origin_country: string
}

export interface ProductionCountry {
    iso_3166_1: string
    name: string
}

export interface SpokenLanguage {
    english_name: string
    iso_639_1: string
    name: string
}

export interface Credits {
    cast: Cast[]
    crew: Crew[]
}

export interface Cast {
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path?: string
    cast_id: number
    character: string
    credit_id: string
    order: number
}

export interface Crew {
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path?: string
    credit_id: string
    department: string
    job: string
}

export interface Videos {
    results: Result[]
}

export interface Result {
    iso_639_1: string
    iso_3166_1: string
    name: string
    key: string
    site: string
    size: number
    type: string
    official: boolean
    published_at: string
    id: string
}

export interface Images {
    backdrops: Backdrop[]
    logos: Logo[]
    posters: Poster[]
}

export interface Backdrop {
    aspect_ratio: number
    height: number
    iso_639_1?: string
    file_path: string
    vote_average: number
    vote_count: number
    width: number
}

export interface Logo {
    aspect_ratio: number
    height: number
    iso_639_1?: string
    file_path: string
    vote_average: number
    vote_count: number
    width: number
}

export interface Poster {
    aspect_ratio: number
    height: number
    iso_639_1?: string
    file_path: string
    vote_average: number
    vote_count: number
    width: number
}

export interface Keywords {
    keywords: Keyword[]
}

export interface Keyword {
    id: number
    name: string
}

export interface ThemoviedbProvider {
    logo: string;
    name: string;
}

export interface ProvidersResult {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
}

export interface Flatrate {
    logo_path: string
    provider_id: number
    provider_name: string
    display_priority: number
}

export interface Buy {
    logo_path: string
    provider_id: number
    provider_name: string
    display_priority: number
}

export interface Rent {
    logo_path: string
    provider_id: number
    provider_name: string
    display_priority: number
}
