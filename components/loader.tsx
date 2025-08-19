import { cssInterop } from 'nativewind'
import React, { useEffect, useRef } from 'react'
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native'
import Svg, { Path } from 'react-native-svg'

interface LoaderProps {
    size?: number
    className?: string
    style?: StyleProp<ViewStyle>
}

const Loader = ({ size = 40, className, style }: LoaderProps) => {
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 750,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start()
    }, [rotateAnim])

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    })

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    transform: [{ rotate: rotateInterpolate }],
                },
                style,
            ]}
        >
            <Svg viewBox="0 0 24 24" width={size} height={size} className={`fill-primary ${className}`}>
                <Path d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z" />
            </Svg>
        </Animated.View>
    )
}
cssInterop(Svg, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        fill: 'fill',
        stroke: 'stroke',
      },
    },
  })
export default Loader
