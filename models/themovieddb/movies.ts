import { Credits, Genre, Images, Keywords, ProductionCompany, ProductionCountry, SpokenLanguage, Videos } from '.'

export interface ThemoviedbMovieDetail {
    adult: boolean
    backdrop_path: string
    belongs_to_collection: {
        backdrop_path: string
        id: number
        name: string
        poster_path: string
    }
    budget: number
    genres: Genre[]
    homepage: string
    id: number
    imdb_id: string
    origin_country: string[]
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    release_date: string
    revenue: number
    runtime: number
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
    credits: Credits
    videos: Videos
    images: Images
    recommendations: Recommendations
    similar: Similar
    keywords: Keywords
}

export interface Recommendations {
    page: number
    results: RecommendationsMoviesResult[]
    total_pages: number
    total_results: number
}

export interface RecommendationsMoviesResult {
    adult: boolean
    backdrop_path: string
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string
    media_type: string
    original_language: string
    genre_ids: number[]
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
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
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path?: string
    release_date: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
}

export interface CollectionDataResponse {
    id: number
    name: string
    overview: string
    poster_path: string
    backdrop_path: string
    parts: CollectionPart[]
}

export interface CollectionPart {
    adult: boolean
    backdrop_path: string
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string
    media_type: string
    original_language: string
    genre_ids: number[]
    popularity: number
    release_date: string
    video: boolean
    vote_average: number
    vote_count: number
}
