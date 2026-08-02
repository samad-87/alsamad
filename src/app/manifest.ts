import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alsamad",
    short_name: "Alsamad",
    description: "A calm Islamic daily companion",
    start_url: "/ar",
    display: "standalone",
    background_color: "#f8fbf9",
    theme_color: "#0f5b43",
    icons: [],
  };
}
