import Svg, { Path, SvgProps } from "react-native-svg"

const ArrowDownWideNarrow = (props: SvgProps & { size?: number }) => (
    <Svg
        viewBox='0 0 24 24'
        width={props.size || 24}
        height={props.size || 24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        {...props}
    >
        <Path d="m3 16 4 4 4-4M7 20V4M11 4h10M11 8h7M11 12h4" />
    </Svg>
)
export default ArrowDownWideNarrow
