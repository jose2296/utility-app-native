import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import Text from './Text';

const AnimatedList = <T,>({ data, renderItem, getKey }: { data: T[], renderItem: (item: T, index: number) => React.ReactNode, getKey: (item: T) => string }) => {
    return (
        <>
            {/* {data.length > 0 && data.map((item, index) => (
                <Animated.View
                    entering={FadeInLeft.delay(index * 50).duration(500)}
                    // exiting={FadeOutRight.duration(500)}
                    key={getKey(item)}
                    className={'flex'}
                >
                    {renderItem(item, index)}
                </Animated.View>
            ))} */}
            {data.length > 0 &&
                <FlashList
                    data={data}
                    keyExtractor={(item) => getKey(item)}
                    scrollEventThrottle={16}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={FadeInLeft.delay(index * 50).duration(500)}
                            // exiting={FadeOutRight.duration(500)}
                            // key={getKey(item)}
                            className={'flex'}
                        >
                            {renderItem(item, index)}
                        </Animated.View>
                    )}
                />
            }
            {data.length === 0 && (
                <Text
                    text="no_items"
                    className='text-base-content text-2xl text-center py-8'
                />
            )}
        </>
    );
}

export default AnimatedList;
