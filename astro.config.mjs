// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

const env = loadEnv("", process.cwd(), ["DATO", "NETLIFY", "VERCEL"]);
const isPreview = env.DATO_PREVIEW === "true";

const adapter = env.VERCEL === "1" ? vercel() : node({ mode: "standalone" });

// https://astro.build/config
export default defineConfig({
    output: isPreview ? "server" : "static",
    site: "https://www.example.com",
    integrations: [sitemap(), icon()],
    vite: {
        plugins: [tailwindcss()],
    },
    adapter,
});
