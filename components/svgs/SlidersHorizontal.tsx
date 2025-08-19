import Svg, { Path, SvgProps } from "react-native-svg";

const SlidersHorizontal = (props: SvgProps & { size?: number }) => (
    <Svg
        width={props.size || 24}
        height={props.size || 24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        {...props}
    >
        <Path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
    </Svg>
);

export default SlidersHorizontal;
