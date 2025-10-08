import { ChevronDown } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import Text from '../Text';

interface DropdownProps {
    label: string;
    text: string;
    onPress: () => void;
    disabled?: boolean;
    prefixLabelIcon?: React.ReactNode;
    suffixLabelIcon?: React.ReactNode;
    avoidTranslationLabel?: boolean;
    avoidTranslationText?: boolean;
    translateLabelData?: Record<string, string>;
    translateTextData?: Record<string, string>;
}
const Dropdown = ({ label, text, onPress, disabled, prefixLabelIcon, suffixLabelIcon, avoidTranslationLabel, avoidTranslationText, translateLabelData, translateTextData }: DropdownProps) => {
    return (
        <View className='flex flex-col gap-y-1'>
            <Text
                text={label}
                avoidTranslation={avoidTranslationLabel}
                translateData={translateLabelData}
                className={`${disabled ? 'text-base-content/40' : 'text-base-content'} text-xl`}
            />
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`border ${disabled ? 'border-base-content/40' : 'border-base-content'} rounded-xl px-6 py-4 flex flex-row items-center gap-2`}
            >
                {!!prefixLabelIcon && prefixLabelIcon}
                <Text
                    text={text}
                    avoidTranslation={avoidTranslationText}
                    translateData={translateTextData}
                    className={`text-xl  flex-1 ${disabled ? 'text-base-content/40' : 'text-base-content'}`}
                />
                {!!suffixLabelIcon && suffixLabelIcon}
                {!suffixLabelIcon && <ChevronDown size={24} className={`${disabled ? 'text-base-content/40' : 'text-base-content'}`} />}
            </TouchableOpacity>
        </View>
    );
}

export default Dropdown;
