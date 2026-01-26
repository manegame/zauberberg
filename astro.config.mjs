// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

const env = loadEnv("", process.cwd(), ["DATO", "NETLIFY"]);
const isPreview = env.DATO_PREVIEW === "true";

const adapter =
    env.NETLIFY === "true"
        ? netlify({ imageCDN: false })
        : node({ mode: "standalone" });

// https://astro.build/config
export default defineConfig({
    output: isPreview ? "server" : "static",
    site: "https://www.example.com",
    integrations: [sitemap()],
    vite: {
        plugins: [tailwindcss()],
    },
    adapter: isPreview ? adapter : undefined,
});
