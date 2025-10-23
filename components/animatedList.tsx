import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInLeft, LinearTransition } from 'react-native-reanimated';
import Text from './Text';

interface AnimatedListProps<T> {
    data: T[];
    noItemsKey?: string;
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey: (item: T) => string;
    getItemType?: (item: T) => string;
}
const AnimatedList = <T,>({ data, noItemsKey, renderItem, getKey, getItemType }: AnimatedListProps<T>) => {
    return (
        <>
            {data.length > 0 &&
                <FlashList
                    data={data}
                    // getItemType={getItemType}
                    keyExtractor={(item) => getKey(item)}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            // entering={FadeInLeft.delay(index * 50).duration(500)}
                            // exiting={FadeOutRight.duration(500)}
                            // key={getKey(item)}
                            // layout={LinearTransition}
                            className={'flex'}
                        >
                            {renderItem(item, index)}
                        </Animated.View>
                    )}
                />
            }
            {data.length === 0 && (
                <Text
                    text={noItemsKey || 'no_items'}
                    className='text-base-content text-2xl text-center py-8'
                />
            )}
        </>
    );
}

export default AnimatedList;
