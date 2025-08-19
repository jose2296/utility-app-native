import Svg, { Path, SvgProps } from "react-native-svg";

const X = (props: SvgProps & { size?: number }) => (
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
        <Path d="M18 6 6 18M6 6l12 12" />
    </Svg>
);

export default X;
