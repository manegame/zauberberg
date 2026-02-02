import type { APIRoute } from "astro";

export const prerender = false;

export const POST = (async ({ request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        const body = await request.json();
        const videoUrl = body.video;

        const response = await fetch(videoUrl);

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    message: "Failed to fetch video",
                }),
                {
                    status: 500,
                },
            );
        }

        const blob = await response.blob();

        return new Response(blob, {
            status: 200,
            headers: {
                "Content-Type": blob.type,
            },
        });
    }

    return new Response(null, { status: 400 });
}) satisfies APIRoute;
