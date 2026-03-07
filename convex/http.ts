import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Return share link metadata as JSON (for OG tag generation)
http.route({
  path: "/share-meta",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "missing token" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await ctx.runQuery(api.shareLinks.getByToken, { token });

    if (!data) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const cdnHost = process.env.BUNNY_CDN_HOSTNAME || "vz-e32a4325-ad1.b-cdn.net";
    const thumbnail = data.video.thumbnailUrl ||
      (data.video.bunnyVideoId ? `https://${cdnHost}/${data.video.bunnyVideoId}/thumbnail.jpg` : null);

    return new Response(JSON.stringify({
      title: data.video.title,
      client: data.client?.company || data.client?.name || "",
      idea: data.idea?.title || "",
      status: data.video.status,
      thumbnail,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

export default http;
