import Svg, { SvgProps, Path } from "react-native-svg";

const CloudCheck = (props: SvgProps & { size?: number }) => (
    <Svg
        width={props.size || 24}
        height={props.size || 24}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="lucie lucide-cloud-check-icon lucide-cloud-check"
        {...props}
    >
        <Path d="m17 15-5.5 5.5L9 18" />
        <Path d="M5 17.743A7 7 0 1 1 15.71 10h1.79a4.5 4.5 0 0 1 1.5 8.742" />
    </Svg>
);
export default CloudCheck;
