import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Flower Pot",
    short_name: "Flower Pot",
    description: "Monitor your plant's health in real time.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#F5A623",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
