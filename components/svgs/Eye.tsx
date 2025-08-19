import Svg, { Circle, Path, SvgProps } from "react-native-svg";

const Eye = (props: SvgProps & { size?: number }) => (
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
        <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <Circle cx={12} cy={12} r={3} />
    </Svg>
);

export default Eye;
