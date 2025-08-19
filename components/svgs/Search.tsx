import Svg, { Path, SvgProps } from "react-native-svg";

const Search = (props: SvgProps & { size?: number }) => (
    <Svg
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 64 64"
        stroke="currentColor"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        {...props}
    >
        <Path d="M27 9C17.075 9 9 17.075 9 27s8.075 18 18 18c4.13 0 7.926-1.413 10.967-3.76l13.082 13.082a2.315 2.315 0 1 0 3.273-3.273L41.24 37.967C43.587 34.927 45 31.129 45 27c0-9.925-8.075-18-18-18zm0 4c7.719 0 14 6.281 14 14s-6.281 14-14 14-14-6.281-14-14 6.281-14 14-14z" />
    </Svg>
);

export default Search;
