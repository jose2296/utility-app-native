import Svg, { Path, Rect, SvgProps } from "react-native-svg";

const Tv = (props: SvgProps & { size?: number }) => (
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
        <Path d="m17 2-5 5-5-5" />
        <Rect width={20} height={15} x={2} y={7} rx={2} />
    </Svg>
);

export default Tv;
