import { Trans } from "react-i18next";
import { Text as RNText, StyleProp, TextProps, TextStyle } from "react-native";

const Text = ({ text, style, avoidTranslation = false, className, translateData, ...props }: { text: string, style?: StyleProp<TextStyle>, avoidTranslation?: boolean, className?: string, translateData?: Record<string, string> } & TextProps) => {
    const finalText = avoidTranslation
        ? text
        : <Trans
            i18nKey={text}
            values={translateData}
            count={translateData?.count as any || 0}
            components={{
                bold: <RNText className='font-bold' />,
                underline: <RNText className='underline' />
            }}
        />
    return (
        <RNText className={className} style={style} {...props}>{finalText}</RNText>
    );
}

export default Text;
