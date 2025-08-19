import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RatingProps {
    score: number;          // 0-100
    size?: "sm" | "md" | "lg";
    style?: StyleProp<ViewStyle>;
    duration?: number;      // ms
    className?: string;
}

const circleSizes = {
    sm: 48,
    md: 64,
    lg: 80,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Rating = ({ score, size = "md", style, duration = 1000, className = 'text-neutral' }: RatingProps) => {
    const stroke = 8;
    const diameter = circleSizes[size];
    const radius = diameter / 2 - stroke / 2;
    const circumference = 2 * Math.PI * radius;

    // Animación
    const progress = useRef(new Animated.Value(0)).current; // 0..100
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const target = Math.max(0, Math.min(100, score));

        // Escuchamos el valor para el contador
        const id = progress.addListener(({ value }) => {
            setDisplay(Math.round(value));
        });

        // Animación
        Animated.timing(progress, {
            toValue: target,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false, // strokeDashoffset necesita false
        }).start();

        return () => {
            progress.removeListener(id);
        };
    }, [score, duration]);

    // Círculo progresivo
    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
        extrapolate: "clamp",
    });

    const color = getStrokeColor(score);

    return (
        <View style={[styles.container, style]}>
            <View style={{ width: diameter, height: diameter }}>
                <Svg width={diameter} height={diameter} className={className}>
                    {/* Fondo */}
                    <Circle
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                    />
                    {/* Progreso */}
                    <AnimatedCircle
                        cx={diameter / 2}
                        cy={diameter / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`} // empieza arriba
                    />
                </Svg>

                {/* Texto */}
                <View style={styles.textWrapper}>
                    <Text style={[styles.text, { color }]}>
                        {display}
                        <Text style={styles.percent}>%</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

function getStrokeColor(score: number): string {
    if (score >= 80) return "#22c55e"; // verde
    if (score >= 60) return "#eab308"; // amarillo
    return "#ef4444"; // rojo
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    textWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontWeight: "bold",
        fontSize: 18,
    },
    percent: {
        fontSize: 12,
    },
});

export default Rating;
