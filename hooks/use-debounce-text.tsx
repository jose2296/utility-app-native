import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";

const useDebouncedText = (defaultText: string, onDebouncedChange: (text: string) => void, delay = 500) => {
    const [text, setText] = useState(defaultText);
    const [debouncedText, setDebouncedText] = useState(defaultText);

    useFocusEffect(
        useCallback(() => {
            setText(defaultText);
        }, [])
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedText(text);
            onDebouncedChange(text);
        }, delay);

        return () => clearTimeout(handler);
    }, [text, delay]);

    return { text, setText, debouncedText };
}

export default useDebouncedText;
