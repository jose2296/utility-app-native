import Loader from '@/components/loader';
import Text from '@/components/Text';
import { BookFixedItem } from '@/models/books';
import { FixedItemList } from '@/models/list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import MovieSeriesItem from '../movieSerieItem';

const BooksList = ({ books, handleItemSelected }: { books: FixedItemList<BookFixedItem>[]; handleItemSelected: (item: FixedItemList<BookFixedItem>) => void }) => {
    const [loadingSearch, setLoadingSearch] = useState(false);
    const router = useRouter();
    const { workspaceId } = useLocalSearchParams();

    return (
        <View className='flex flex-1'>

            {loadingSearch &&
                <View className='flex-1 items-center justify-center'>
                    <Loader />
                </View>
            }
            {!loadingSearch && books.length > 0 &&
                <View className='flex flex-row flex-wrap gap-6 gap-y-10 justify-center'>
                    {books.map((book, index) => (
                        <View className='w-[45%]' key={'book-item-' + index}>
                            <MovieSeriesItem
                                itemId={book.id}
                                title={book.data.title}
                                image={book.data.image}
                                placeholderImage='books'
                                released={book.data.released}
                                checked={book.data.checked}
                                onPress={() => null}
                                onLongPress={() => handleItemSelected(book)}
                            />
                        </View>
                    ))}
                </View>
                // <Carousel
                //     data={books}
                //     keyExtractor={(item: FixedItemList<BookFixedItem>) => `${item.data.externalId}`}
                //     renderItem={(item: FixedItemList<BookFixedItem>) => (
                //         <MovieSeriesItem
                //             itemId={item.id}
                //             title={item.data.title}
                //             image={item.data.image}
                //             released={item.data.released}
                //             checked={item.data.checked}
                //             onPress={() => null}
                //             onLongPress={() => setItemSelected(item)}
                //         />
                //     )}
                // />
            }
            {!loadingSearch && !books.length &&
                <View className='flex-1 items-center justify-center'>
                    <Text text='no_items' className='text-2xl text-base-content' />
                </View>
            }
        </View>
    );
}

export default BooksList;
