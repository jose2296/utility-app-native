import { Credits, Genre, Images, Keywords, ProductionCompany, ProductionCountry, SpokenLanguage, Videos } from '.'

export interface ThemoviedbSeriesDetail {
    adult: boolean
    backdrop_path?: string
    created_by: CreatedBy[]
    episode_run_time: any[]
    first_air_date: string
    genres: Genre[]
    homepage: string
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: string
    last_episode_to_air: LastEpisodeToAir
    name: string
    next_episode_to_air: any
    networks: Network[]
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path?: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    seasons: Season[]
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string
    type: string
    vote_average: number
    vote_count: number
    credits: Credits
    videos: Videos
    images: Images
    recommendations: Recommendations
    similar: Similar
    keywords: Keywords
}

export interface CreatedBy {
    id: number
    credit_id: string
    name: string
    original_name: string
    gender: number
    profile_path: string
}


export interface LastEpisodeToAir {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: string
    episode_number: number
    episode_type: string
    production_code: string
    runtime: number
    season_number: number
    show_id: number
    still_path: string
}

export interface Network {
    id: number
    logo_path: string
    name: string
    origin_country: string
}


export interface Season {
    air_date: string
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
    vote_average: number
}


export interface Recommendations {
    page: number
    results: RecommendationsSeriesResult[]
    total_pages: number
    total_results: number
}

export interface RecommendationsSeriesResult {
    adult: boolean
    backdrop_path: string
    id: number
    name: string
    original_name: string
    overview: string
    poster_path: string
    media_type: string
    original_language: string
    genre_ids: number[]
    popularity: number
    first_air_date: string
    vote_average: number
    vote_count: number
    origin_country: string[]
}

export interface Similar {
    page: number
    results: SimilarResult[]
    total_pages: number
    total_results: number
}

export interface SimilarResult {
    adult: boolean
    backdrop_path?: string
    genre_ids: number[]
    id: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    first_air_date: string
    name: string
    vote_average: number
    vote_count: number
}
