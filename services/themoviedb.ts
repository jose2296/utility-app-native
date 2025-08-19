import { ProvidersResult, ThemoviedbFixedItem, ThemoviedbFixedItemDetails, ThemoviedbItem, ThemoviedbProvider } from '@/models/themovieddb';
import { CollectionDataResponse, RecommendationsMoviesResult, ThemoviedbMovieDetail } from '@/models/themovieddb/movies';
import { RecommendationsSeriesResult, ThemoviedbSeriesDetail } from '@/models/themovieddb/series';

const API_KEY = process.env.EXPO_PUBLIC_THEMOVIEDB_API_KEY;
const API_URL = 'https://api.themoviedb.org/3';
const API_IMAGE_URL = 'https://image.tmdb.org/t/p/original';
const YOUTUBE_EMBEBED_URL = 'https://www.youtube.com/embed';

const searchTypes = {
    all: 'multi',
    movies: 'movie',
    series: 'tv'
};

export const searchMoviesOrSeriesItem = async (search: string, type: 'movies' | 'series' | 'all') => {
    const url = `${API_URL}/search/${searchTypes[type]}?api_key=${API_KEY}&query=${search}&language=es-ES`;
    const items = (await (await fetch(url)).json()).results;

    return parseItemsFromApi(items, type !== 'all' ? type : undefined);
};

export const getItemToSaveByThemoviedbId = async (type: 'movies' | 'series', themoviedbId: number): Promise<ThemoviedbFixedItem> => {
    const url = `${API_URL}/${searchTypes[type]}/${themoviedbId}?api_key=${API_KEY}&language=es-ES`;
    const item = (await (await fetch(url)).json()) as ThemoviedbMovieDetail | ThemoviedbSeriesDetail;

    return {
        themoviedbId: item.id,
        title: (item as ThemoviedbMovieDetail).title || (item as ThemoviedbSeriesDetail).name,
        image: item.poster_path ? `${API_IMAGE_URL}/${item.poster_path}` : '/item-placeholder.png',
        released: (item as ThemoviedbMovieDetail).release_date || (item as ThemoviedbSeriesDetail).first_air_date,
        type,
        checked: false
    };
};

export const getItemDetails = async (type: 'movies' | 'series', themoviedbId: number): Promise<ThemoviedbFixedItemDetails> => {
    const url = `${API_URL}/${searchTypes[type]}/${themoviedbId}?api_key=${API_KEY}&append_to_response=credits,videos,images,recommendations,similar,keywords&include_image_language=undefined,null,en&language=es-ES`;
    const response = await fetch(url);

    if (!response.ok) {
        throw {
            message: (await response.json())?.status_message || 'Error getting item details',
            status: response.status,
        };
    }

    const item = await response.json() as ThemoviedbMovieDetail | ThemoviedbSeriesDetail;

    const imagesSorted = item.images.posters.sort((a, b) => b.vote_average - a.vote_average);
    const imagesSortedBackdrops = item.images.backdrops.sort((a, b) => b.vote_average - a.vote_average);
    const images = imagesSorted.slice(0, 10).map(image => `${API_IMAGE_URL}/${image.file_path}`);
    const imagesBackdrops = imagesSortedBackdrops.slice(0, 10).map(image => `${API_IMAGE_URL}/${image.file_path}`);
    const videosTrailers = item.videos.results.filter((video) => (video.type === 'Trailer') && video.site === 'YouTube');
    const videosTeasers = item.videos.results.filter((video) => (video.type === 'Teaser') && video.site === 'YouTube');
    const videos = (videosTrailers.length ? videosTrailers : videosTeasers).map(video => ({
        src: `${YOUTUBE_EMBEBED_URL}/${video.key}`,
        name: video.name
    }));
    const genres = item.genres.map(genre => genre.name).join(', ');

    const commonData = {
        themoviedbId,
        title: (item as ThemoviedbMovieDetail).title || (item as ThemoviedbSeriesDetail).name,
        synopsis: item.overview,
        status: item.status,
        tagline: item.tagline,
        genres,
        image: item.poster_path ? `${API_IMAGE_URL}/${item.poster_path}` : '/item-placeholder.png',
        released: (item as ThemoviedbMovieDetail).release_date || (item as ThemoviedbSeriesDetail).first_air_date,
        images,
        imagesBackdrops,
        videos,
        recommendations: item.recommendations.results.map(recommendation => ({
            themoviedbId: recommendation.id,
            title: (recommendation as RecommendationsMoviesResult).title || (recommendation as RecommendationsSeriesResult).name,
            image: recommendation.poster_path ? `${API_IMAGE_URL}/${recommendation.poster_path}` : '/item-placeholder.png',
            released: (recommendation as RecommendationsMoviesResult).release_date || (recommendation as RecommendationsSeriesResult).first_air_date,
            type: type
        })),
        score: item.vote_count > 0 ? Math.round((item.vote_average / 10) * 100) : undefined
    };

    if (type === 'movies') {
        const movie = item as ThemoviedbMovieDetail;
        const belongsToCollection = movie.belongs_to_collection;
        let collection: ThemoviedbFixedItemDetails['collection'];
        if (belongsToCollection) {
            const collectionUrl = await fetch(`${API_URL}/collection/${belongsToCollection.id}?api_key=${API_KEY}&language=es-ES`);
            const collectionData = (await collectionUrl.json()) as CollectionDataResponse;

            const movies = collectionData.parts.sort((a, b) => a.release_date?.localeCompare(b.release_date)).map(part => ({
                themoviedbId: part.id,
                title: part.title,
                image: part.poster_path ? `${API_IMAGE_URL}/${part.poster_path}` : '/item-placeholder.png',
                released: part.release_date,
                type: 'movies' as const
            }));
            const data = {
                id: collectionData.id,
                name: collectionData.name,
                overview: collectionData.overview,
                poster_path: `${API_IMAGE_URL}/${belongsToCollection.poster_path}`,
                backdrop_path: `${API_IMAGE_URL}/${belongsToCollection.backdrop_path}`,
                movies
            };

            collection = data;
        }

        return {
            ...commonData,
            time: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : undefined,
            collection
        };
    }

    if (type === 'series') {
        const series = item as ThemoviedbSeriesDetail;

        return {
            ...commonData,
            nextEpisodeToAir: series.next_episode_to_air,
            numberOfEpisodes: series.number_of_episodes,
            numberOfSeasons: series.number_of_seasons
        };
    }

    return commonData;
};

export const getItemProviders = async (type: 'movies' | 'series', themoviedbId: number): Promise<ThemoviedbProvider[]> => {
    const url = `${API_URL}/${searchTypes[type]}/${themoviedbId}/watch/providers?api_key=${API_KEY}`;

    const data = (await (await fetch(url)).json()).results?.ES as ProvidersResult;

    return data?.flatrate?.map((flatrate: { logo_path: string; provider_name: string; }) => ({
        logo: `https://image.tmdb.org/t/p/original${flatrate.logo_path}`,
        name: flatrate.provider_name
    })) ?? [];
};

const parseItemsFromApi = (data: ThemoviedbItem[], type?: 'movies' | 'series') => {
    const _items = data.map(item => ({
        themoviedbId: item.id,
        title: item.title || item.name,
        image: item.poster_path ? `${API_IMAGE_URL}/${item.poster_path}` : '/item-placeholder.png',
        released: item.release_date || item.first_air_date,
        type: type || item.media_type === 'tv' ? 'series' : (item.media_type === 'movie' ? 'movies' : ''),
        checked: false
    } as ThemoviedbFixedItem)).filter(item => !!item.type);

    return _items;
};
