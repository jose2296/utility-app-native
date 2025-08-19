import MovieSeriesItemDetails from '@/components/lists/movieSeriesItemDetails';
import { useLocalSearchParams } from "expo-router";

const ThemeMovieDbItem = () => {
    const { listId, themoviedbId, itemType, workspaceId } = useLocalSearchParams();

    return <MovieSeriesItemDetails
        type={itemType as 'movies' | 'series'}
        workspaceId={Number(workspaceId)}
        themoviedbId={Number(themoviedbId)}
        listId={Number(listId)}
    />;

}

export default ThemeMovieDbItem;
