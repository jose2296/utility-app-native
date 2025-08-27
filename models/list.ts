import { BookFixedItem } from './books';

export interface List {
    id: number;
    name: string;
    type: string;
    user_id: number;
    isOwner?: boolean;
    created_at: string;
    updated_at: string;
}


export interface FixedItemList<T = ThemoviedbFixedItem | BookFixedItem> {
    id?: number;
    list_id?: number;
    user?: {
        id: number;
        email: string;
        name: string;
        created_at: string;
        updated_at: string;
    };
    data: T;
    created_at: string;
    updated_at: string;
};


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
    image: string;
    released: string;
    genres: string;

    time?: string;
    collection?: {
        id: number;
        name: string;
        overview: string;
        poster_path: string;
        backdrop_path: string;
        movies: {
            themoviedbId: number;
            title: string;
            image: string;
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
