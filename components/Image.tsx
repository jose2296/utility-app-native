import { Image } from "expo-image";
import { cssInterop } from "nativewind";

// Mapea className -> style para expo-image
cssInterop(Image, { className: "style" });

export default Image;
