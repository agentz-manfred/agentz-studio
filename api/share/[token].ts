import type { VercelRequest, VercelResponse } from "@vercel/node";

const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot|Googlebot|bingbot|Embedly|Quora Link Preview|Pinterest|Applebot/i;

const CONVEX_URL = process.env.VITE_CONVEX_SITE_URL || "https://sleek-goat-172.eu-west-1.convex.site";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.query.token as string;
  if (!token) return res.redirect(302, "/");

  const ua = req.headers["user-agent"] || "";
  const isBot = BOT_UA.test(ua);

  // For humans, redirect to the SPA hash route
  if (!isBot) {
    return res.redirect(302, `/#/share/${token}`);
  }

  // For bots, fetch metadata from Convex and return OG HTML
  try {
    const metaRes = await fetch(`${CONVEX_URL}/share-meta?token=${encodeURIComponent(token)}`);
    
    if (!metaRes.ok) {
      return res.status(200).send(fallbackHtml(token));
    }

    const meta = await metaRes.json();
    const title = meta.title || "Video";
    const description = [meta.client, meta.idea].filter(Boolean).join(" · ") || "Video-Review auf AgentZ Studio";
    const image = meta.thumbnail || "https://agentz-studio.vercel.app/og-image.png";

    return res.status(200).send(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${esc(title)} — AgentZ Studio</title>
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:width" content="1280" />
  <meta property="og:image:height" content="720" />
  <meta property="og:url" content="https://agentz-studio.vercel.app/share/${esc(token)}" />
  <meta property="og:site_name" content="AgentZ Studio" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <meta http-equiv="refresh" content="0;url=https://agentz-studio.vercel.app/#/share/${esc(token)}" />
</head>
<body>
  <p>Weiterleitung zu <a href="https://agentz-studio.vercel.app/#/share/${esc(token)}">AgentZ Studio</a>…</p>
</body>
</html>`);
  } catch {
    return res.status(200).send(fallbackHtml(token));
  }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fallbackHtml(token: string) {
  return `<!DOCTYPE html>
<html lang="de"><head>
  <meta charset="UTF-8" />
  <title>AgentZ Studio</title>
  <meta property="og:title" content="AgentZ Studio — Video Review" />
  <meta property="og:description" content="Video-Review auf AgentZ Studio" />
  <meta property="og:image" content="https://agentz-studio.vercel.app/og-image.png" />
  <meta http-equiv="refresh" content="0;url=https://agentz-studio.vercel.app/#/share/${esc(token)}" />
</head><body><p>Weiterleitung…</p></body></html>`;
}
