import MovieSeriesItemDetails from '@/components/lists/movieSeriesItemDetails';
import { useLocalSearchParams } from "expo-router";

const MovieOrSerieItemPage = () => {
    const { listId, itemType, itemId, workspaceId } = useLocalSearchParams();

    return (
        <MovieSeriesItemDetails
            type={itemType as 'movies' | 'series'}
            itemId={Number(itemId)}
            listId={Number(listId)}
            workspaceId={Number(workspaceId)}
        />
    );
}

export default MovieOrSerieItemPage;
