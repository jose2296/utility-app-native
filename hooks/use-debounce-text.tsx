import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";

const useDebouncedText = (onDebouncedChange: (text: string) => void, delay = 500) => {
    const [text, setText] = useState("");
    const [debouncedText, setDebouncedText] = useState("");

    useFocusEffect(
        useCallback(() => {
            setText('');
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
